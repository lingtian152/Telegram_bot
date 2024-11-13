const { Bot } = require('grammy');
const { apiRoot, token, api_id, api_hash } = require('./config/config.json');
const { commandLoader, eventLoader } = require('./Loader');

const bot = new Bot(token, {
    client: {
        apiRoot: apiRoot || "https://api.telegram.org",
        api_Id: api_id || "",
        api_hash: api_hash || ""
    }
});


(async () => {
    await commandLoader(bot);
    await eventLoader(bot);

    await bot.init();

    const info = await bot.botInfo;
    console.log(`${info.username} (${info.id}) has started.`);

    bot.start();
})();
