const axios = require('axios');
const { InputFile } = require('grammy');


module.exports = {
    name: 'whitesilk',
    description: 'Sends a random white silk image',
    async execute(bot) {
        bot.command('whitesilk', async (ctx) => {
            try {
                const response = await axios.get('https://api.asxe.vip/whitesilk.php', { responseType: 'arraybuffer' });

                if (response.status === 200 && response.headers['content-type'].startsWith('image/')) {
                    const imageData = await Buffer.from(response.data);

                    const inputfile = await new InputFile(imageData, 'image.jpg')

                    await ctx.replyWithPhoto(inputfile);
                } else {
                    await ctx.reply('No image was returned. Please try again later.');
                }

            } catch (error) {
                console.error('Error fetching white silk image:', error);
                await ctx.reply('Something went wrong. Please try again later.');
            }
        });
    }
};
