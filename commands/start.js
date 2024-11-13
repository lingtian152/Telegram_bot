module.exports = {
    name: 'start',
    description: 'Start the bot',
    execute(bot) {
        bot.command('start', async (ctx) => {
            await bot.api.sendMessage(ctx.chat.id, '欢迎使用本 Bot！(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧\n本 Bot 由 笨蛋凌 开发 ✨\n请注意，本 Bot 加入的群聊和私聊内容可能会被开发者查看，但请放心，开发者不会随意窥探您的隐私哦！(＾▽＾)\n如果您对本 Bot 感兴趣，欢迎订阅我们的 频道，获取更多更新资讯~ ヽ(・∀・)ﾉ', { parse_mode: 'Markdown' });
        })
    }
}