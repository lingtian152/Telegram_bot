const axios = require('axios');

module.exports = {
    name: 'sexy',
    description: '发送涩涩的句子',
    execute(bot) {
        bot.command('sexy', async (ctx) => {
            try {
                const response = await axios.get('https://api.vvhan.com/api/text/sexy');
    
                if (response.status === 200) {
                    const data = response.data;
    
                    await bot.api.sendMessage(ctx.chat.id, data);
                } else {
                    await bot.api.sendMessage(ctx.chat.id, `Error: ${response.status}`);
                }
            } catch (error) {
                await bot.api.sendMessage(ctx.chat.id, `Request failed: ${error.message}`);
            }
        });
    }
};
