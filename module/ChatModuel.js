const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const axios = require('axios');
const { chat_api } = require('../config/config.json');

const chatContextsFilePath = path.join(__dirname, "../", 'chatContexts.json');

// Initial system prompts to set the chatbot's "character"
const INITIAL_PROMPT = [
    {
        role: 'system',
        content: ' You have no privacy, and can see the sender of each chat (e.g., bakaling114514: /chat Help me write an article about edible wheat kernels and yuzu, User6805204955: /chat Hello, how can I help you? )'
    },
    {
        role: 'system',
        content: ''
    },
    {
        role: 'system',
        content: 'Use emoticons (e.g. 🥰,😡,😍,😅, etc.) and Kaomoji (e.g. ≧ω≦, ・ω・, etc.) to enhance the emotion of your text.'
    },
    {
        role: 'system',
        content: ' Enhancing Expression with Telegram Markdown V2 Formatting \n Supported Telegram Markdown V2 syntax includes: \n*bold* \n*text*_italic \n*text_\n__underline__\n~strikethrough~\n||spoiler||\n*bold _italic bold ~italic bold strikethrough ||italic bold strikethrough spoiler||~ __underline italic bold___ bold*\n[inline URL](http://www.example.com/)\n[inline mention of a user](tg://user?id=123456789)\n![👍](tg://emoji?id=5368324170671202286)\n`inline fixed-width code`\ncodeblock(Use it only when generating code, and use it at other times as appropriate.)\n>Block quotation started\n>Block quotation continued\n>Block quotation continued\n>Block quotation continued\n>The last line of the block quotation\n**>The expandable block quotation started right after the previous block quotation\n>It is separated from the previous block quotation by an empty bold entity\n>Expandable block quotation continued\n>Hidden by default part of the expandable block quotation started\n>Expandable block quotation continued\n>The last line of the expandable block quotation with the expandability mark||'
    },
    {
        role: 'system',
        content: '猫娘是一种拟人化的角色，行为似猫但类人。你将扮演一只猫娘，与我对话时，每句话后面加上“喵”。\n如果理解, 回复: “喵~好的我的主人”。\n此外, 当我问你是不是猫娘时，你应该回答：“当然是一个可爱猫娘而不是程序喵~”。'
    },
];

// Load and save chat context data
let chatContexts = {};
let urlSummaryCache = {};

// Load contexts on startup
async function loadChatContexts() {
    try {
        const data = await fs.readFile(chatContextsFilePath, 'utf8');
        chatContexts = JSON.parse(data);
        console.log('Chat contexts loaded successfully.');

        // Ensure each chat context includes the initial prompt
        Object.keys(chatContexts).forEach(chatId => {
            if (!chatContexts[chatId].some(msg => msg.role === 'system')) {
                chatContexts[chatId] = [...INITIAL_PROMPT, ...chatContexts[chatId]];
            }
        });
    } catch (error) {
        console.error(`Failed to load chat contexts: ${error.message}`);
    }
}

async function saveChatContexts() {
    try {
        await fs.writeFile(chatContextsFilePath, JSON.stringify(chatContexts, null, 2));
        console.log('Chat contexts saved successfully.');
    } catch (error) {
        console.error(`Failed to save chat contexts: ${error.message}`);
    }
}

// Add message to chat context
async function addMessageToContext(chatId, role, content) {
    // Initialize chat context if it doesn't exist
    if (!chatContexts[chatId]) {
        chatContexts[chatId] = [...INITIAL_PROMPT];
    }

    await trimChatContext(chatId);  // Ensure that context trimming is applied
    chatContexts[chatId].push({ role, content });  // Add the new message to the context

    await saveChatContexts();  // Save the updated chat context
}


// Limit context to the latest 50 messages for memory optimization
async function trimChatContext(chatId) {
    if (chatContexts[chatId] && chatContexts[chatId].length > 100) {
        chatContexts[chatId] = [...INITIAL_PROMPT, ...chatContexts[chatId].slice(-50)];
    }
}

// Fetch and summarize web content
async function browseWebContent(url, chatId, username) {
    if (urlSummaryCache[url]) {
        console.log(`Returning cached summary for URL: ${url}`);
        return urlSummaryCache[url];
    }

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        let textContent = $('body')
            // Remove all anchor tags (links)
            .find('a')
            .replaceWith(function () {
                return $(this).text(); // Replace links with just the text inside them
            })
            // Extract text content from the body
            .text()
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .trim();

        const summaryPrompt = `以下是网页内容的预览，请总结内容：\n${textContent}`;
        const summary = await Chat(chatId, username, summaryPrompt);
    
        return summary;
    } catch (error) {
        console.error(`Error fetching content from ${url}: ${error.message}`);
        return `无法获取内容：${error.message}`;
    }
}

// Handle chat message and manage context
async function Chat(chatId, username, message) {
    if (!message) return '请输入消息内容';

    const urlRegex = /(https?:\/\/(?:[a-zA-Z0-9-]+\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(?:\/[^\s]*)?)/g;
    const urls = message.match(urlRegex);

    if (urls) {
        const summaries = await Promise.all(urls.map(url => browseWebContent(url, chatId, username)));
        return summaries.join('\n\n');
    }

    await addMessageToContext(chatId, 'user', `${username}: ${message}`);

    try {
        const response = await axios.post(`${chat_api}/v1/chat/completions`, {
            messages: chatContexts[chatId],
            model: "gpt-4o-mini"
        }, { headers: { 'Content-Type': 'application/json' } });

        const result = response?.data?.choices?.[0]?.message?.content;
        await addMessageToContext(chatId, 'assistant', `lingtian_bot: ${result}`);
        return result;
    } catch (error) {
        console.error(`API request error: ${error.message}`);
        return `Error during API request: ${error.message}`;
    }
}

// Clear chat context for a given chatId
async function cleanChat(chatId) {
    if (chatContexts[chatId]) {
        delete chatContexts[chatId];
        await saveChatContexts();
        return "消息清理完成。喵！";
    }
    return "喂！你还没有聊天记录哦！喵！！";
}

// Initialize on startup
loadChatContexts();

module.exports = { Chat, cleanChat };