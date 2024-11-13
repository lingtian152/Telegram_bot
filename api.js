const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());


const flagFilePath = path.join(__dirname, 'updateInProgress.flag');


function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout || stderr);
            }
        });
    });
}

app.post("/update", async (req, res) => {
    try {
        const { verification } = req.body;

        // 验证请求
        if (!verification || verification !== '114514') {
            return res.status(401).json({ message: "你谁啊！没认证就别想动我！" });
        }

        // 检查是否有正在进行的更新
        if (fs.existsSync(flagFilePath)) {
            return res.status(409).json({ message: "更新正在进行中，请稍后再试。" });
        }

        // 创建标志文件
        fs.writeFileSync(flagFilePath, '');

        // 执行更新命令
        await executeCommand('docker compose down')

        const result = await executeCommand('yarn update');
        console.log(result);

        // 删除标志文件
        fs.unlinkSync(flagFilePath);

        return res.status(200).json({ message: "主人！我更新完成啦！" });

    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
        // 删除标志文件
        if (fs.existsSync(flagFilePath)) {
            fs.unlinkSync(flagFilePath);
        }
        return res.status(500).json({ message: `主人我更新失败啦！这里是日志: ${error.message}` });
    }
});
app.listen(5000, "0.0.0.0", () => {
    console.log(`Server running on port 5000`);
});