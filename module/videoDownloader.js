const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');
const { av2bv } = require('./biliav2bv'); // 引入 av2bv 函数
const { BiliBili, Youtube } = require('../config/cookie.json');

// 获取视频标题
async function GetVideoTitle(url) {
    const youtubeDlPath = path.resolve(__dirname, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
    return new Promise((resolve, reject) => {
        exec(`${youtubeDlPath} --get-title "${url}"`, { encoding: 'utf8' }, (error, stdout) => {
            if (error) {
                return reject(new Error(`获取标题错误: ${error.message}`));
            }
            resolve(stdout.trim());
        });
    });
}


// 下载函数，根据类型（音频或视频）下载
async function downloader(videoUrl, type = "video") {
    const urlRegex = /https:\/\/(?:www\.|m\.)?(youtube\.com|youtu\.be|bilibili\.com|b23\.tv)\/?/;

    if (!urlRegex.test(videoUrl)) {
        throw new Error("无效的视频链接");
    }

    // 根据来源选择下载方法
    let cookieFile = "";
    if (/https:\/\/(?:www\.|m\.)?(youtube\.com|youtu\.be)/.test(videoUrl)) {
        cookieFile = Youtube || "";
    } else if (/https:\/\/(?:www\.|m\.)?(bilibili\.com|b23\.tv)/.test(videoUrl)) {
        let avMatch = videoUrl.match(/av(\d+)/);
        if (avMatch) {
            try {
                videoUrl = videoUrl.replace(`av${avMatch[1]}`, av2bv(avMatch[1]));
            } catch (conversionError) {
                throw new Error(`AV 到 BV 转换失败: ${conversionError.message}`);
            }
        }
        cookieFile = BiliBili || "";
    } else {
        throw new Error("不支持的视频来源");
    }

    // 调用相应的下载函数
    return type === "audio" ? audiodownloader(videoUrl, cookieFile) : videoDownload(videoUrl, cookieFile);
}

// 音频下载函数
async function audiodownloader(url, cookieFile) {
    const youtubeDlPath = path.resolve(__dirname, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
    const videoTitle = await GetVideoTitle(url);
    const outputFileName = path.resolve(__dirname, `${videoTitle}.mp3`);

    return new Promise((resolve, reject) => {
        const command = `${youtubeDlPath} -f "bestaudio" --extract-audio --audio-format mp3 -o "${outputFileName}" --cookies "${cookieFile}" -N 8 "${url}"`;
        console.log(`执行命令: ${command}`);

        exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error) return reject(`下载错误: ${error.message}`);
            if (stderr) console.warn(`stderr: ${stderr}`);
            setTimeout(() => resolve({ filePath: outputFileName, title: videoTitle }), 1000);
        });
    });
}

// 视频下载函数
async function videoDownload(url, cookieFile) {
    const youtubeDlPath = path.resolve(__dirname, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
    const videoTitle = await GetVideoTitle(url);
    const outputFileName = path.resolve(__dirname, `${videoTitle}.mp4`);

    return new Promise((resolve, reject) => {
        const command = `${youtubeDlPath} -f "bestvideo+bestaudio" --merge-output-format mp4 -o "${outputFileName}" --cookies "${cookieFile}" -N 8 "${url}"`;
        console.log(`执行命令: ${command}`);

        exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error) return reject(`下载错误: ${error.message}`);
            if (stderr) console.warn(`stderr: ${stderr}`);
            setTimeout(() => {
                if (fs.existsSync(outputFileName)) {
                    resolve({ filePath: outputFileName, title: videoTitle });
                } else {
                    reject("文件下载失败，未能找到输出文件");
                }
            }, 1000);
        });
    });
}

module.exports = {
    downloader,
    GetVideoTitle
};