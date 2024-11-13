const { Client } = require('nekos-best.js');
const fs = require('fs').promises;

const nekosBest = new Client();

async function getTags() {
    try {
        const data = await fs.readFile('config/neko_tag.txt', 'utf8');
        return data.split('\n').map(tag => tag.trim()).filter(Boolean);
    } catch (error) {
        console.error('Error reading tags file:', error);
        return [];
    }
}

async function RandomTag(tags) {
    const randomIndex = Math.floor(Math.random() * tags.length);
    return tags[randomIndex];
}

module.exports = {
    name: 'neko',
    description: '获取neko动图',
    execute(bot) {
        bot.command('neko', async (message) => {
            try {
                const tags = await getTags();

                if (tags.length === 0) {
                    await bot.api.sendMessage(message.chat.id, 'Tag list is empty or could not be loaded.');
                    return;
                }

                const tag = await RandomTag(tags);
                const picResponse = await nekosBest.fetch(tag, 1);
                const picUrl = picResponse.results[0].url;

                await bot.api.sendAnimation(message.chat.id, picUrl);
            } catch (error) {
                console.error('Error fetching neko image:', error);
                await bot.api.sendMessage(message.chat.id, 'Failed to fetch neko image, please try again later.');
            }
        });
    }
};
