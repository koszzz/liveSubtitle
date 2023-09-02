# Live Subtitle

> 适用于固定字幕内容的直播（例如演唱会）的实时字幕

## 效果

![直播用户端效果](https://raw.githubusercontent.com/koszzz/liveSubtitle/main/images/1.jpg)

> *直播用户端效果<sup>[1]</sup>*

![控制台端效果](https://raw.githubusercontent.com/koszzz/liveSubtitle/main/images/2.jpg)

> *直播控制台端效果*

## 使用

### 运行控制台

1. 使用部署在Github Pages上的客户端，可略过此步。

   [https://koszzz.github.io/liveSubtitle](https://koszzz.github.io/liveSubtitle)

2. 运行源代码

   ```shell
   git clone https://github.com/koszzz/liveSubtitle
   cd liveSubtitle
   npm install
   npm run dev
   ```

   服务将运行于[http://localhost:5173](http://localhost:5173)

### 上传歌词

> 不论使用的是部署在Github Pages上的客户端还是运行源代码，在进入控制台时都会被要求上传歌词JSON文件。
> Live Subtitle使用JSON格式储存日文与中文歌词，格式如下：

```json
[
    {
        "name": "小星星",
        "lyrics": [
            {
                "zh": "一闪一闪亮晶晶",
            	"ja": "きらきら ひらる",
                "index": 0
            },
            {
                "zh": "满天都是小星星",
                "ja": "おそらの ほしよ",
                "index": 1
            }
        ],
        "index": 0
    }
]
```

以下是数组每项解释说明

| 键           | 类型   | 注解                                   |
| ------------ | ------ | -------------------------------------- |
| name         | String | 歌曲名，会被显示在控制台左侧“曲名”列。 |
| index        | Number | 当前歌曲的索引，自0递增。              |
| lyrics       | Array  | 歌词列表。                             |
| lyrics.zh    | String | 中文歌词。                             |
| lyrics.ja    | String | 日文歌词。                             |
| lyrics.index | Number | 当前歌词在当前歌曲中的索引，自0递增。  |

提供适用于**LoveLive!Superstar!! Liella! 4th LoveLive! Tour ～brand new Sparkle～**演唱会的[测试歌词文件](https://raw.githubusercontent.com/koszzz/liveSubtitle/main/public/data.json)，附歌词译者表<sup>[2]</sup>。

### 时间轴

在上传完歌词JSON文件后，将会变为控制台页面（如下图）。

![控制台](https://raw.githubusercontent.com/koszzz/liveSubtitle/main/images/2.jpg)

> 上部为歌词字幕，下部左侧为以当前歌词为第一项的歌词表，下部右侧为歌曲表。

#### 操作

- 按下键盘**方向左键**可使歌词隐藏或显示。
- 按下键盘**方向下键**可切换到下一句，并使歌词显示。
- 点击右侧歌曲表中项，可将歌词切换至点击歌曲的第一条歌词，**不会变更**歌词的显示与否。

- 点击左侧歌词表中项，可将歌词切换至点击歌词，**不会变更**歌词的显示与否。

### 推流

> 使用OBS Studio<sup>[3]</sup>演示

![OBS画面](https://raw.githubusercontent.com/koszzz/liveSubtitle/main/images/3.jpg)

将画面调整为上述**直播控制台端**布局，使得各窗口大小占屏幕宽高比例如下，并使Live Subtitle置于直播画面之上：

| 窗口          | 宽（100%） | 高（100%） |
| ------------- | ---------- | ---------- |
| 直播画面      | 100%       | 100%       |
| Live Subtitle | 100%       | <95%       |

在OBS中添加以上二窗口为来源，并使字幕置于直播画面之上。将直播窗口占满屏幕，将Live Subtitle窗口裁剪至只有字幕部分。

#### 抠像

为避免遮挡画面，需要将洋红色底色去除。

![右键菜单](https://raw.githubusercontent.com/koszzz/liveSubtitle/main/images/4.jpg)

1. 右键**字幕**来源，选择底部**滤镜**项。

![选择色度键](https://raw.githubusercontent.com/koszzz/liveSubtitle/main/images/5.jpg)

2. 点击左下角**＋**，添加**色度键**效果滤镜。
3. 右侧设置**关键色类型**为**自定义颜色**，**关键色**设置为**＃a5469b**，**相似度**设置为**1**。
4. 保存并关闭

## 技术

- [Vue.js](https://cn.vuejs.org/) 3.3.4
- [Vite](https://cn.vitejs.dev/) 4.4.6
- [Element Plus](https://element-plus.org/zh-CN/) 2.3.9

### 字体

- [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) Bold
- [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) Bold

## 注释

1. 画面为QQ"Liella!"频道于2023年8月26日转播的**LoveLive!Superstar!! Liella! 4th LoveLive! Tour ～brand new Sparkle～**爱知 Day1场《ビギナーズRock!!》桜小路きな子 (CV. 鈴原希実)（后复现）。

2. 歌词译者表如下：

   | 曲名                                | 翻译（或含听写）                     |
   | ----------------------------------- | ------------------------------------ |
   | Jump Into the New World             | Shibaです                            |
   | Star宣言                            | bob球球1301                          |
   | 自我介绍                            | 上善若水, yukiyuu                    |
   | Blooming Dance! Dance!              | Shibaです                            |
   | Killer Kyun☆                        | 依然洳雪                             |
   | MIRACLE NEW STORY                   | 依然洳雪                             |
   | 【Day1】幕间动画1                   | 上善若水, yukiyuu                    |
   | 【Day2】幕间动画1                   | 上善若水, yukiyuu                    |
   | 【Wien】Butterfly Wing              | 旁生魄w, bob球球1301                 |
   | 【Wien】Edelstein                   | 五十嵐若葉, Sanry                    |
   | 【Kinako】ビギナーズRock!!          | 依然洳雪                             |
   | 【Ren】Midnight Rhapsody            | 依然洳雪                             |
   | 【Keke】星屑クルージング            | Shibaです                            |
   | 【Sumire】Starry Prayer             | 依然洳雪                             |
   | 【Natsumi】Eyeをちょうだい          | 丹                                   |
   | 【Mei】茜心                         | 上善若水                             |
   | 【Shiki】ガラスボールリジェクション | 依然洳雪                             |
   | 【Nako】君を想う花になる            | 上善若水                             |
   | 【Kanon】Free Flight                | 依然洳雪                             |
   | 幕间动画2                           | 上善若水, yukiyuu                    |
   | 影遊び                              | 五十嵐若葉                           |
   | Alternate                           | 五十嵐若葉                           |
   | What a Wonderful Dream!!            | 葫芦又, Shibaです                    |
   | 幕间动画3                           | 上善若水, yukiyuu                    |
   | Hoshizora Monologue                 | Shibaです                            |
   | Including you                       | Shibaです                            |
   | 未来の音が聴こえる                  | Shibaです                            |
   | Second Sparkle                      | Shibaです                            |
   | 私のSymphony 2022Ver.               | 葫芦又                               |
   | 幕间动画4                           | 上善若水, yukiyuu                    |
   | Vitamin SUMMER!                     | bob球球1301                          |
   | TO BE CONTINUED                     | Shibaです                            |
   | UNIVERSE!!                          | Shibaです                            |
   | 常夏☆サンシャイン                   | 葫芦又                               |
   | Day1                                | Sanry                                |
   | Nonfiction!!                        | 每次都被修改的小河                   |
   | 追いかける夢の先で                  | Shibaです                            |
   | Sing! Shine! Smile!                 | Shibaです                            |
   | 名前呼びあうように                  | Shibaです                            |
   | Unison                              | Shibaです                            |
   | Chance Day, Chance Way!             | bob球球1301, Bilibili Macro Link字幕 |
   | 水花的标志                          | 肝肝蜜柑, Sanry                      |
   | 未来は風のように                    | 五十嵐若葉, Min_Zi_LRC               |
   | 始まりは君の空                      | 葫芦又, N10000的小河                 |
   | Dancing Heart La-Pa-Pa-Pa!          | 葫芦又, N10000的小河                 |
   | Dreaming Energy                     | 葫芦又                               |
   | Wish Song                           | 葫芦又                               |
   | WE WILL!!                           | 旁生魄w                              |
   | Starlight Prologue                  | 碘化亚金                             |
   | Dream Rainbow                       | 七影蝶                               |
   | Go!! Restart                        | 旁生魄w, bob球球1301, 五十嵐若葉     |
   | Welcome to 僕らのセカイ             | bob球球1301                          |
   | だから僕らは鳴らすんだ！            | 葫芦又, Sanry                        |
   | Shooting Voice!!                    | 依然洳雪                             |
   | Velour                              | 五十嵐若葉                           |
   | 不可視なブルー                      | 五十嵐若葉                           |

3. 演示使用OBS Studio 29.1.3 (64 bit)，与最新版本可能有所不同。
