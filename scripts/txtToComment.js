/**
 * @file 将 ./input/ 中，开头4行为注释的txt日中字幕稿转换为使用Comment的.ass字幕，用于制作karaoke特效。使用node.js执行。
 * @author Kiyoshi(kiyoshi.kusunoki@gmail.com)
 */

/**
 * 毫秒数转ass时间格式
 * 
 * @param {number} seconds100 毫秒数
 * @returns {string} 类似 0:00:00.00 的ass适用时间格式
 */

function secondsToTime(seconds100) {
    const hours = Math.floor(seconds100 / 360000);
    const minutes = Math.floor((seconds100 - hours * 360000) / 6000);
    const seconds = Math.floor(
        (seconds100 - hours * 360000 - minutes * 6000) / 100
    );
    const miS = Math.floor(
        seconds100 - hours * 360000 - minutes * 6000 - seconds * 100
    );

    return `${hours}:${("" + minutes).padStart(2, "0")}:${(
        "" + seconds
    ).padStart(2, "0")}.${("" + miS).padStart(2, "0")}`;
}

function to(text, eachTime) {
    const arr = text.split("\n").slice(4);
    let result = "";
    for (let i = 0; i < arr.length; i += 2) {
        const tags = `{\\fad(200,200)}`
        const zh = tags+arr[i];
        const ja = tags+arr[i + 1];
        let add = 0;
        // if (i / 2 > 0) {
        //     add = (i / 2) * 30;
        // }
        const inTime = secondsToTime((i / 2) * eachTime + add);
        const outTime = secondsToTime((i / 2 + 1) * eachTime + add);
        result += `Comment: 0,${inTime},${outTime},中文,,0,0,0,,${zh}\nComment: 0,${inTime},${outTime},日文,,0,0,0,,${ja}\n`;
    }
    return result;
}

const fs = require("fs");

const inputPath = "./input";
const outputPath = "./output";

// 读取 input 文件夹下的所有文件
const files = fs.readdirSync(inputPath);

// 遍历所有文件
files.forEach((file) => {
    // 获取文件名
    const fileName = file.replace(/\.[^.]+$/, "");

    // 创建 output 文件夹下的文件
    const outputFile = fs.createWriteStream(`${outputPath}/${fileName}.txt`);

    // 读取文件内容
    const data = fs.readFileSync(`${inputPath}/${file}`);
    const data1 = to(data.toString(), 90);

    // 写入文件内容
    outputFile.write(data1);

    // 关闭文件流
    outputFile.end();
});
