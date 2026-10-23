# 主题排列对比（2026-10-23）

## 调整前检查点

当前产品代码已保存于 `c0c41f1`；本次另外提交调整前的实际截图，作为排列修改之前的检查点。

调整前每行四项：

1. 随机、Waves、Ripples、Mist
2. Solar、Stars、Paper、Mountains
3. Bamboo、Ocean、After rain、Snow
4. Fireflies、Maple、Sakura、Campfire

截图：`screenshots/2026-10-23/theme-order/before.png`。截取完整选择面板，保持原窗口尺寸与 Bamboo 选中状态。

本轮仅调整展示顺序，颜色、封面、主题场景、存储 ID 与随机选项的功能均保留。

## 调整后

1. 随机、Waves、Paper、Mist
2. Solar、After rain、Ripples、Ocean
3. Mountains、Bamboo、Sakura、Maple
4. Snow、Stars、Fireflies、Campfire

截图：`screenshots/2026-10-23/theme-order/after.png`，沿用相同的截取位置与尺寸，Bamboo 保持选中。实际 DOM 顺序已核对；61 项测试、代码检查通过。

已逐个比较调整前后的 15 个主题定义，内容完全相同，只有顺序改变。调整前检查点为 `69f0f01`。排列单独提交；需要回退时可撤销排列提交，保留之前的视觉与功能修复。
