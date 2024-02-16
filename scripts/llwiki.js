/**
 * @file 将LLWiki(https://llwiki.org)中的歌词转为中日对照文字。
 *     可能包含不正确的注音！务必人工核对。
 *     在Chrome控制台执行。
 * @author Kiyoshi(kiyoshi.kusunoki@gmail.com)
 */
function main() {
    Array.from(document.getElementsByClassName("Lyrics_box")[0].children)
        .filter((i) => Array.from(i.classList).includes("Lyrics_line"))
        .map((i) => {
            const children = Array.from(i.children);
            const original = children.filter((k) =>
                Array.from(k.classList).includes("Lyrics_original")
            )[0];

            const translated = children.filter((k) =>
                Array.from(k.classList).includes("Lyrics_translated")
            )[0];
            return (
                translated.textContent +
                "\n" +
                original.textContent +
                (original.textContent != original.innerText
                    ? " // 记得注音"
                    : "")
            );
        })
        .join("\n")
        .replaceAll("\n\n", "");
}
main();
