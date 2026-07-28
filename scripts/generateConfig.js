const ass = ``.split("\n");
const track = 1;
let result = "";
for (let i = 0; i < ass.length; i++) {
  const start = ass[i].split(",")[1];
  const end = ass[i].split(",")[2];
  const text = ass[i]
    .split(",")
    .slice(9)
    .join(",")
    .replace(/\{[\s\S]*?\}/g, "");
  const style = ass[i].split(",")[3];
  if (style.includes("日文-") && !style.includes("日文-f-")) {
    result += `${track},${start},${end},${text}\n`;
  }
}
result;
