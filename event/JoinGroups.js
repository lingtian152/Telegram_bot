const path = require('path');
const fs = require('fs').promises; // Use promises for async file operations

const groupsFile = path.join(__dirname, "../", 'bot_groups.json');

module.exports = {
    name: "Grpup Events",
    description: "Logging group events",
    execute(bot) {
        bot.on("my_chat_member", async (ctx) => {
            const chat = ctx.chat;
            const newStatus = ctx.update.my_chat_member.new_chat_member.status;

            try {
                // Check if the groups file exists; if not, create it with an empty array
                if (!await fs.access(groupsFile).catch(() => false)) {
                    await fs.writeFile(groupsFile, JSON.stringify([]));
                }

                // Read the existing groups
                let groups = JSON.parse(await fs.readFile(groupsFile, 'utf-8')) || [];

                if (chat.type === 'group' || chat.type === 'supergroup') {
                    if (newStatus === "member") {
                        // Add group if not already in the list
                        if (!groups.find(g => g.id === chat.id)) {
                            await bot.api.sendMessage(1762462335, `我加入了新群组 ${chat.title} (ID: ${chat.id})`);
                            groups.push({ id: chat.id, name: chat.title });
                            await fs.writeFile(groupsFile, JSON.stringify(groups, null, 2));
                        }
                    } else if (newStatus === "left" || newStatus === "kicked") {
                        // Remove group if the bot left or was removed
                        groups = groups.filter(g => g.id !== chat.id);
                        await bot.api.sendMessage(1762462335, `我被踢出群组 ${chat.title} (ID: ${chat.id})`);
                        await fs.writeFile(groupsFile, JSON.stringify(groups, null, 2));
                    }
                }
            } catch (error) {
                console.error(`Failed to update groups: ${error.message}`);
            }
        });
    }
}
