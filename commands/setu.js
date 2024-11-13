const axios = require('axios');
const { InputFile } = require('grammy');

module.exports = {
    name: 'setu',
    description: '发送涩图(但不完全涩）！',
    execute(bot) {
        bot.command('setu', async (ctx) => {
            try {
                const imageResponse = await axios.get("https://api.tomys.top/api/meinvPic?type=cos", { responseType: 'arraybuffer' });

                if (imageResponse.status === 200) {
                    const imageData = Buffer.from(imageResponse.data, 'binary');
                    const inputfile = new InputFile(imageData, 'image.jpg')
                    await bot.api.sendPhoto(ctx.chat.id, inputfile)
                } else {
                    await bot.api.sendMessage(ctx.chat.id, `图片获取失败，状态码：${imageResponse.status}`);
                }
            } catch (error) {
                console.error(error);
                await bot.api.sendMessage(ctx.chat.id, `发生错误: ${error.message}`);
            }
        });
    }
};
