const { Chat } = require('../module/ChatModuel');

module.exports = {
    name: 'chat',
    description: '跟机器人聊天',
    execute(bot) {
        // 监听所有文本消息
        bot.command('chat', async (ctx) => {
            // 获取用户聊天 ID 和用户名
            const chatId = ctx.chat.id;
            const username = ctx.from.username || `User${ctx.from.id}`;

            await ctx.replyWithChatAction('typing');

            // 调用 Chat 函数，传递 chatId, username 和用户的消息内容
            const responseMessage = await Chat(chatId, username, ctx.message.text);

            try {
                // 发送回复消息
                if (responseMessage) {
                    try {
                        try {
                            await bot.api.sendMessage(chatId, responseMessage, { parse_mode: 'MarkdownV2' });
                        } catch {
                            await bot.api.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
                        }
                    } catch {
                        await bot.api.sendMessage(chatId, responseMessage);
                    }
                } else {
                    await bot.api.sendMessage(chatId, responseMessage);
                }
            } catch (error) {
                console.error('处理消息时发生错误:', error);
                await bot.api.sendMessage(chatId, responseMessage);
            }
        });
    }
};