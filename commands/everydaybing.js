const axios = require('axios');
const { InputFile } = require('grammy');

module.exports = {
    name: 'todaybing',
    description: '获取每日bing壁纸',
    execute(bot) {
        bot.command("todaybing", async (ctx) => { // Use 'ctx' instead of 'message'
            try {
                const imageResponse = await axios.get("http://bingw.jasonzeng.dev?resolution=UHD", { responseType: 'arraybuffer' });

                if (imageResponse.status === 200) {
                    const imageData = Buffer.from(imageResponse.data, 'binary');
                    const inputfile = new InputFile(imageData, 'Today bing picture.jpg');
                    await bot.api.sendDocument(ctx.chat.id, inputfile)
                } else {
                    await bot.api.sendMessage(ctx.chat.id, `错误状态: ${imageResponse.status}`);
                }
            } catch (error) {
                await bot.api.sendMessage(ctx.chat.id, `发生错误: ${error.message}`);
            }
        });

        bot.catch((err) => {
            console.error('Error occurred:', err);
            // 这里可以进行错误通知或者重试逻辑
        });
    }
};
