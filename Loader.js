const fs = require('fs');
const path = require('path');

// Array to hold commands
const commands = [];
const events = [];

async function commandLoader(bot) {
    const commandsPath = path.join(__dirname, 'commands'); // Adjust the path to the commands folder

    // Read and load all command files from the commands folder
    fs.readdirSync(commandsPath).forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.ts')) {  // Check file extension
            const command = require(path.join(commandsPath, file)); // Use require() for CommonJS

            if (command.name && typeof command.execute === 'function') {
                commands.push({
                    command: command.name,  // Set the command name
                    description: command.description || '无描述',  // Default to '无描述' if no description
                });

                console.log(`${command.name} 成功加载 - ${command.description || '无描述'}`);

                // Bind the command handler
                command.execute(bot); // Call the command's execute method
            } else {
                console.log(`${file} 未导出命令名称或处理逻辑`);
            }
        }
    });

    // Set the bot's command list
    bot.api.setMyCommands(commands)
        .then(() => {
            console.log('命令列表设置成功。');
        })
        .catch(error => {
            console.error('设置命令列表时出错:', error);
        });

    // Output all loaded commands and their descriptions
    console.log('已加载的命令:');
    commands.forEach(cmd => {
        console.log(`- ${cmd.command}: ${cmd.description}`);
    });
}

async function eventLoader(bot) {
    const eventPath = path.join(__dirname, 'event');

    // 读取并加载 event 文件夹中的所有命令
    fs.readdirSync(eventPath).forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.ts')) {  // 判断文件后缀
            const event = require(path.join(eventPath, file));

            if (event.name && typeof event.execute === 'function') {
                events.push({
                    event: event.name,  // 将命令名设置为 'event'
                    description: event.description || '无描述',  // 如果没有描述，默认显示'无描述'
                });

                console.log(`${event.name} 成功加载 - ${event.description || '无描述'}`);

                // 为每个事件绑定处理逻辑
                event.execute(bot); // 调用事件的 execute 方法
            } else {
                console.log(`${file} 未导出事件名称或处理逻辑`);
            }
        }
    });

    // 输出已加载的所有事件及其描述
    console.log('已加载的事件:');
    events.forEach(evnt => {
        console.log(`- ${evnt.event}: ${evnt.description}`);
    });
    console.log(events);
}

module.exports = {
    commandLoader,
    eventLoader
}
