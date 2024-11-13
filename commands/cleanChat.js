const path = require('path');
const { cleanChat } = require('../module/ChatModuel');

module.exports = {
    name: 'clean',
    description: '清理bot的对话记录',
    async execute(bot) {
        bot.command('clean', async (ctx) => {
            try {
                const response = await cleanChat(ctx.chat.id);
                await ctx.reply(response);
            } catch (error) {
                console.error(`Error while cleaning chat history: ${error.message}`);
                await ctx.reply(`Unexpected error: ${error.message}`);
            }
        });
    }
};
