/**
 * @file 将现有 Ass Comments的时间格式化，在Chrome控制台执行
 * @author Kiyoshi(kiyoshi.kusunoki@gmail.com)
 */

/**
 *
 * @param {string} comments 经UriEncode的Comments
 * @param {number} eachTime 每组Comments持续的时间，毫秒
 * @param {number} interval 每组Comments与下一组的间隔时间，毫秒
 * @returns {string} Ass适用的Comments
 */
function commentsTimeParse(comments, eachTime, interval) {
    const comments = decodeURIComponent(comments).split("\n");

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

    let arr = [];
    for (let i = 0; i < comments.length; i += 2) {
        for (let k = 0; k < 2; k++) {
            let a = comments[i + k].split(",");
            let add = 0;
            if (i / 2 > 0) {
                add = (i / 2) * interval;
            }
            a[1] = secondsToTime((i / 2) * eachTime + add);
            a[2] = secondsToTime((i / 2 + 1) * eachTime + add);
            arr.push(a.join(","));
        }
    }
    arr.join("\n");
    return arr;
}
