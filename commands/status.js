const { exec } = require('child_process');
const os = require('os');

// Function to get server info based on the system type
async function getServerInfo() {
    return new Promise((resolve, reject) => {
        const platform = os.platform();
        let command;

        if (platform === 'win32') {
            command = `powershell -Command "Get-WmiObject Win32_Processor | Select-Object -Property LoadPercentage,NumberOfCores"`;
        } else if (platform === 'linux' || platform === 'darwin') {
            command = `mpstat | awk '$3 ~ /all/ {print $12}'`;
        } else {
            reject('Unsupported platform');
            return;
        }

        exec(command, (err, stdout) => {
            if (err) {
                reject(err);
            } else {
                if (platform === 'win32') {
                    const cpuInfo = {};
                    const loadMatch = stdout.match(/LoadPercentage\s+:\s+(\d+)/);
                    const coresMatch = stdout.match(/NumberOfCores\s+:\s+(\d+)/);
                    if (loadMatch) cpuInfo['LoadPercentage'] = loadMatch[1];
                    if (coresMatch) cpuInfo['NumberOfCores'] = coresMatch[1];
                    resolve(cpuInfo);
                } else if (platform === 'linux' || platform === 'darwin') {
                    const idle = parseFloat(stdout.trim());
                    const loadPercentage = (100 - idle).toFixed(2);
                    resolve({ LoadPercentage: loadPercentage, NumberOfCores: os.cpus().length });
                }
            }
        });
    });
}

// Function to format uptime in a human-readable way
function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
    name: 'status',
    description: 'Show bot and server info',
    execute(bot) {
        bot.command('status', async (ctx) => {
            try {
                const serverInfo = await getServerInfo();
                const numCores = serverInfo['NumberOfCores'] || 'N/A';
                const uptime = formatUptime(process.uptime() * 1000); // Converting to milliseconds
                const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); // Memory usage in MB

                const message = `*Server Status:*\n`
                    + `*Number of Cores:* ${numCores}\n`
                    + `*Bot Uptime:* ${uptime}\n`
                    + `*Memory Usage:* ${memoryUsage} MB`;

                await bot.api.sendMessage(ctx.chat.id, message, { parse_mode: 'Markdown' });
            } catch (error) {
                console.error('Error fetching server info:', error);
                await bot.api.sendMessage(ctx.chat.id, 'Failed to fetch server info.');
            }
        });
    }
};
