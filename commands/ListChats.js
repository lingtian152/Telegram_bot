const fs = require('fs').promises;
const path = require('path');

const groupsFile = path.join(__dirname, "../", 'bot_groups.json');
const privateFile = path.join(__dirname, "../", 'bot_private.json');

module.exports = {
    name: 'getchats',
    description: '获取群组现有的群组',
    execute(bot) {
        bot.command('getchats', async (ctx) => {
            try {
                // Only allow this command from a specific user in a private chat
                if (ctx.chat.type === 'private' && ctx.message.from.id === 1762462335) {
                    // Read the list of groups from the file
                    const groupdata = await fs.readFile(groupsFile, 'utf-8');
                    const privatedata = await fs.readFile(privateFile, 'utf-8');

                    const groups = JSON.parse(groupdata);
                    const private = JSON.parse(privatedata)

                    if (groups.length === 0 && private.length === 0) {
                        await ctx.reply('当前没有任何群组或私聊');
                    } else if (groups.length === 0) {
                        await ctx.reply('当前没有任何群组');
                    } else if (private.length === 0) {
                        await ctx.reply('当前没有任何私聊');
                    }

                    const groupNames = groups.map(group => `- ${group.name} (ID: ${group.id})`).join('\n');
                    const privateNames = private.map(private => `- ${private.name} (ID: ${private.id})`).join('\n');
                    await ctx.reply(`当前群组现有的群组有：\n${groupNames} \n 当前私聊现有的私聊有：\n${privateNames}`, { parse_mode: 'Markdown' });
                } else {
                    await ctx.reply('喂喂喂！你谁啊！又想动我！');
                }
            } catch (err) {
                await ctx.reply('获取群组失败，请稍后再试！');
                console.error(`Error retrieving groups: ${err.message}`);
            }
        });
    }
};