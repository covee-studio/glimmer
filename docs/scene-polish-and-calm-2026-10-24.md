# 自然场景细节打磨与 Calm 调研

## 范围与回退

分支 `codex/nature-themes`。调整前设计 `21a0366`；本轮截图与验收页检查点 `5b8461c`。只调整飞鸟、After rain 场景和樱花封面。未推送、发布或修改商店版本号。

## 具体调整

- 高山云影：原版整个鸟形纵向翻转，容易退化为横线。现保留身体，左右翼围绕翼根运动，短暂拍翼后滑翔。五只鸟有不同大小、透明度、节奏和间距。山体和雾层未改。
- 雨后天晴：去掉细长光谱弧，换成上下缓慢散开的雨云、右上暖白日光和微弱云隙光束。中央保持清晰，封面使用相同构图。兼容已有设置，保留 `rainbow` 存储 ID 和 `After rain` 名称。
- 樱花封面：等粗线换成收细枝条，加入分枝、花苞、角度和花瓣略不对称的花朵。只改封面，未改主场景枝条、落花数量和轨迹。

## Calm 调研

本轮读取官方场景帮助、Zen Mode 文档、深色场景说明及 App Store 页面。场景网页和商店页面的浏览器可视化读取超时，未完成应用内逐款场景、视频节奏或付费内容实测。

已确认：

- Scene 将视觉背景和环境声组合，例子有 Rain on Leaves、Mountain Lake，分类涉及自然、水、抽象。
- 声音可调或静音，有 Silent Earth / Silent Clouds；视觉不必强制绑定声音。
- Zen Mode 可隐藏界面；官方文档提到桌面闲置 15 秒后淡出控件。
- iOS 部分场景可随系统深浅色切换日夜状态。

适合 Glimmer 的设计判断：

1. 场景需要清楚的空间、光源和自然现象，避免仅换底色。本轮雨后改造遵循这一点。
2. 动作需要停顿与节奏；本轮飞鸟采用拍翼与滑翔交替。
3. 封面构图、形态和光线应对应实际场景。
4. 保持阅读界面安静；本轮不新增计时器、卡片或自动播放。
5. 官方资料不代表音源可复用。本轮未引入 Calm 素材、外部媒体或托管成本。

后续可单独评估海洋等场景的自然运动节奏、昼夜体验；先做可比较原型，保持各主题区别。

来源：

- https://support.calm.com/hc/en-us/articles/115002474307-Calm-Scenes-Guide-Change-Background-Volume-Playback-Timer
- https://support.calm.com/hc/en-us/articles/360008619874-How-to-Hide-App-Menus-View-Scenes-Only-Zen-Mode
- https://support.calm.com/hc/en-us/articles/360053428413-How-to-Use-Dark-Mode-Scenes-on-iOS-iPhone-iPad
- https://apps.apple.com/us/app/calm/id571800810

## 验收

- 前后实际浏览器截图：`screenshots/2026-10-24/scene-polish/before.png` 与 `after.png`，均 1280×720。固定验收文案仅用于设计比较。
- 完整阅读页：`reading-mountains.png`、`reading-after-rain.png`。
- 120 帧只读采样：飞行位置 120 种、翼型变换 60 种；切换完成后仅一层背景，无横向溢出。这不是帧率性能基准。
- 模拟减少动态效果：鸟群及全部翅膀 animationName 均为 none；已清除模拟。
- 66 项测试、lint、Web/插件构建和回归脚本通过。
- 本轮验证本地 Web，未宣称商店已安装插件已经更新。
