const { InputFile } = require('grammy');
const { GetVideoTitle, downloader } = require('../module/videoDownloader');
const fs = require('fs').promises;

let download_queue = [];
let isDownloading = false;

// URL regex for supported platforms
const urlRegex = /(https?:\/\/(?:www\.)?(youtube\.com\/watch\?v=[\w\-]+|youtu\.be\/[\w\-]+|bilibili\.com\/video\/[a-zA-Z0-9]+|b23\.tv\/[\w\-]+))/g;

module.exports = {
    name: 'jx',
    description: '解析 YouTube 和哔哩哔哩视频',
    execute(bot) {
        bot.command('jx', async (ctx) => {
            await ctx.replyWithChatAction('typing');
            const inputText = ctx.message.text.replace('/jx', '').trim();
            const type = inputText.split(' ')[0];
            const cleanedText = inputText.replace(/^(audio|video)\s*/, ''); // Remove type from input

            try {
                if (urlRegex.test(cleanedText)) {
                    const downloadType = (type === 'audio' || type === 'video') ? type : 'video';
                    await handleMessage(ctx, cleanedText, bot, downloadType);
                } else {
                    await ctx.reply("请输入有效的链接。\n如 /jx video https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                }
            } catch (error) {
                console.error(`命令执行错误: ${error.message}`);
                await ctx.reply(`发生错误：${error.message}`);
            }
        });
    }
};

async function handleMessage(ctx, input, bot, type) {
    const urls = [...new Set(input.match(urlRegex) || [])];
    if (urls.length === 0) {
        await ctx.reply("请输入有效的链接。");
        return;
    }

    // Add unique URLs to the queue
    urls.forEach(url => {
        if (!download_queue.some(item => item.url === url)) {
            download_queue.push({ url, chatId: ctx.chat.id, type });
        }
    });

    processDownloadQueue(bot);
}

async function processDownloadQueue(bot) {
    if (isDownloading || download_queue.length === 0) return;

    isDownloading = true;
    const { url, chatId, type } = download_queue[0];

    try {
        const downloadMessage = type === "video" ? "视频下载中..." : "音频下载中...";
        const sentMessage = await bot.api.sendMessage(chatId, downloadMessage);

        const { filePath, title } = await downloader(url, type);
        if (!filePath) throw new Error("文件路径未定义，下载失败。");

        const file = new InputFile(filePath, `${title}.${type === "video" ? 'mp4' : 'mp3'}`);
        await bot.api.editMessageText(chatId, sentMessage.message_id, "下载完成！正在发送中...");

        if (type === "video") {
            await bot.api.sendVideo(chatId, file, { caption: title });
        } else {
            await bot.api.sendAudio(chatId, file, { caption: title });
        }

        // 清除下载完成的消息和文件
        await bot.api.deleteMessage(chatId, sentMessage.message_id);
        download_queue.shift();

        await fs.unlink(filePath).then(() => console.log(`文件删除成功: ${filePath}`)).catch(err => {
            console.error(`删除文件错误: ${err.message}`);
        });

    } catch (error) {
        console.error(`下载和发送文件时出错: ${error.message}`);
        await bot.api.sendMessage(chatId, `下载错误：${error.message}`);
        download_queue.shift();
    } finally {
        isDownloading = false;
        processDownloadQueue(bot);
    }
}
