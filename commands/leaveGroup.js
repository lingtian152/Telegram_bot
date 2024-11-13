const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'leavegroup',
    description: '让bot离开指定的群组',
    execute(bot) {
        bot.command(this.name, async (ctx) => {
            try {
                if (ctx.chat.type === 'private' && ctx.message.from.id === 1762462335) {
                    const inputText = ctx.message.text.replace('/leavegroup', '').trim();
                    const group_id = inputText.split(' ')[0];

                    if (!group_id) {
                        await ctx.reply('你还没输入群组ID哦~');
                        return;
                    }

                    // Leave the group (corrected the method call)
                    await ctx.api.leaveChat(group_id);

                    await ctx.reply('已离开群组~');
                } else {
                    await ctx.reply('不是什么指令都是你可以碰的！');
                }
            } catch (error) {
                console.log(error);
                await ctx.reply('发生错误，请稍后再试！');
            }
        });
    }
};
