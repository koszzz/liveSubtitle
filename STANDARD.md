# 颜色
- #A5469C Liella
- #FF7F27 Kanon
- #43D1D9 Keke
- #FF6E90 Chisato
- #4B9C40 Sumire
- #0000A0 Ren
- #ABA229 Kinako
- #FF3535 Mei
- #7FB0A6 Shiki
- #FF51C4 Natsumi
- #D895F0 Margarete
- #27A7AE Tomari
- #FF683D SunnyPassion
- #9A1B5A Mao
- #B4AA2B Yuna

# 样式命名

- 一般：{语言}-{说话者，用罗马字拼写}

> e.g. 日语-Keke

- 注音：{语言}-f-{说话者，用罗马字拼写}

> e.g. 日语-f-Keke

- 画外音：{语言}-外-{说话者，用罗马字拼写}

> e.g. 中文-外-Liella

# 分词
> 演出版和 CD 版存在差异的，以演出版为准。
> 两人及以上同时演唱一部分时，使用 Liella 色，小组歌曲同样适用。

# 轨道
- 轨道1: 主要的轨道
- 轨道2: 次要的轨道，通常用于画外音与第二主唱

# 歌词

> 非特殊情况以歌词本为准，包括换行。
> 注音依照歌词本，应加于外文字幕正上方。
> 单语字幕应调整竖直位置于双语字幕的垂直中心。

# 字幕制作工作流

1. 在 subtitleFiles 中添加歌曲文件夹，以歌名命名。

2. 进入歌曲文件夹，新建`lyrics.txt`，存放歌词

> `lyrics.txt` 的前四行为属性。第一行为歌曲名，第二行为译者（没有译者时为词作者），第三行是歌词来源（通常是 URL ），第四行是备注行，通常留空。
> 歌词从第五行开始书写，以 中文 (换行) 日文 的格式书写一句歌词。
> 对于 LLWiki:
> 从 LLWiki 上获取歌词，可以使用 `./scripts/llwiki.js` 脚本。于浏览器控制台执行，可获取歌词。右键输出的歌词，`复制字符串内容`粘贴，调整格式即可。

3. 将歌词转换为 ASS 字幕初稿。将`./scripts/lyrics2ass.js`于浏览器控制台执行，在`const lyrics = ``;`的反引号中粘贴`lyrics.txt`文件的内容（包含属性），即可获取 ASS 字幕初稿内容。在歌曲文件夹中新建`subtitle.ass`文件，将初稿内容粘贴即可。

4. 分词。建议使用 VS Code。使用快捷键同时选择于`中文-`或`日文-`后，输入说话人罗马字即可。单句内的分词使用 ASS 标签`{\r}`切换样式，例如`{\r日文-Liella}`

5. 打轴。用`Aegisub`打开`subtitle.ass`文件。下载**演出版**视频，导入到`Aegisub`中，进行常规打轴。

6. 创建配置文件。将`./scripts/generateConfig.js`于浏览器控制台执行，在`const ass = ``.split("\n");`的反引号中粘贴`subtitle.ass`中所有以`Dialogue:`开头的行（针对于只靠`Dialogue`显示字幕的 ASS 文件），即可获取`config.txt`内容。在歌曲文件夹中创建`config.txt`，粘贴内容即可。

> `config.txt`的内容中，每行是以逗号分隔的4个数据。第一项是轨道编号，可以填写`1`或`2`，默认为1；第二项和第三项是字幕起始、终止时间，格式为小时:分钟:秒.毫秒；第四项是字幕内容

7. 校对。模拟生产环境，检查字幕是否存在问题。

8. 添加筛选器。在`./subtitleFiles/filter-config.json`中添加筛选器。
```
{
    "name": "始まりは君の空", // 筛选器名称
    "type": "album", // 筛选器类型，可选 album（专辑/单曲）、unit（小组）、live（演出）、solo（独唱）
    "songs": [ // 筛选器所含的歌曲名称
        "始まりは君の空",
        "Dancing Heart La-Pa-Pa-Pa!",
        "Dreaming Energy",
        "私のSymphony",
        "私のSymphony What a Wonderful Dream!! Ver."
    ]
},
```
9. 机器校对：中日文标签错误，{\r}打成{\\}错误、中日双语时间不一致

> 译者：依然洳雪、DiegoL