const path = require('path');
const fs = require('fs').promises;

const groupsFile = path.join(__dirname, "../", 'bot_groups.json');
const privateFile = path.join(__dirname, "../", 'bot_private.json');

async function addChatToFile(filePath, chatData) {
    if (!fs.access(filePath)) {
        await fs.writeFile(filePath, '[]');
    }

    try {
        const fileData = await fs.readFile(filePath, 'utf-8');
        const chats = JSON.parse(fileData);

        // Check if the chat is already in the list
        if (!chats.some(chat => chat.id === chatData.id)) {
            chats.push(chatData);
            await fs.writeFile(filePath, JSON.stringify(chats, null, 2));
            console.log(`Added new chat to ${filePath}:`, chatData);
        }
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
    }
}

module.exports = {
    name: "group",
    description: "Group event",
    execute(bot) {
        bot.on('message', async (ctx) => {
            const chat = ctx.chat;

            if (chat.type === 'group' || chat.type === 'supergroup') {
                const groupData = { id: chat.id, name: chat.title };
                await addChatToFile(groupsFile, groupData);
            } else if (chat.type === 'private') {
                const privateData = { id: chat.id, name: ctx.from.username || "Unknown" };
                await addChatToFile(privateFile, privateData);
            }
        });
    }
};
