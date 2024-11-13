const axios = require('axios');

module.exports = {
    name: 'update',
    description: '更新机器人',
    async execute(bot) {
        bot.command('update', async (ctx) => {
            if (ctx.message.from.id === 1762462335) {
                const response = await axios.post('http://192.168.1.170:5000/update',
                    { verification: '114514' }
                );

                if (response.status === 200) {
                    const message = response.data.message;
                    await ctx.reply(message);
                } else {
                    const message = response.data.message;
                    await ctx.reply(message);
                }
            } else {
                await ctx.reply('喂喂喂！你谁啊！别乱碰我！！');
            }
        });
    }
};