# 步骤2 方案推荐页 — 单屏布局重构指令

> **目标：** 将当前需要滚动的步骤2页面重构为**单屏布局（100vh，无滚动）**，所有信息在一屏内完成展示和决策。以下是逐项改动说明，请严格按照执行。

---

## 一、全局布局结构（最重要，先改这个）

### 当前问题
页面是传统的纵向长页面布局，内容从上到下平铺，需要滚动才能看到底部的资料卡片和CTA按钮。每个板块视觉权重相近，用户分不清重点。

### 改动要求
将整个页面改为 `height: 100vh; overflow: hidden;` 的单屏布局，使用 flexbox 纵向排列，让内容自适应填满视口。

页面结构从上到下分为5个紧凑层，每层都设置 `flex-shrink: 0`（信任栏除外）：

```
┌─────────────────────────────────────────────┐
│  导航栏（56px 高）                             │
├─────────────────────────────────────────────┤
│  头部区：进度条 + 步骤文字 + 用户选择回顾         │
├─────────────────────────────────────────────┤
│  推荐方案主卡片（内含两个"重点解决"横向并排）       │
├─────────────────────────────────────────────┤
│  "您会带走" 三列交付物卡片                       │
├─────────────────────────────────────────────┤
│  底部行：左侧=免费资料卡片 ｜ 右侧=CTA按钮组      │
├─────────────────────────────────────────────┤
│  信任锚（一行小字）                              │
└─────────────────────────────────────────────┘
```

主内容区（导航栏以下）设置 `max-width: 1200px; margin: 0 auto; padding: 28px 60px 0;`。

---

## 二、头部区域改造

### 当前状态
- "步骤 2/4" 文字 + "基于您的选择：…" 副标题，占据较多纵向空间。

### 改动要求
- 压缩为紧凑的居中区块，`margin-bottom: 24px`。
- 进度条改为4段横条样式（每段宽 `48px`，高 `3px`，圆角 `2px`，间距 `6px`）。第1段实色（已完成），第2段半透明accent色（当前），第3、4段灰色 `rgba(255,255,255,0.1)`。进度条颜色统一使用页面accent黄色，**不要用蓝色**。
- "步骤 2/4" 字号 `11px`，颜色 `#666E7A`，`letter-spacing: 2px`，`text-transform: uppercase`。
- "基于您的选择：…" 字号 `13px`，颜色 `#A0A8B8`，其中用户选择的关键词（如"看清方向"）用accent色 `#E8C547` + `font-weight: 500` 高亮。
- **删除**当前"1/2 选择方向 ✅ · 2/2 补充问题 ✅"这行子步骤状态（它属于步骤1的信息，在步骤2页面不需要）。

---

## 三、推荐方案主卡片（核心改动）

### 当前状态
- "推荐：1天高管工作坊（定方向）" 是一个黄底黑字pill，下面跟着一句描述。
- 然后纵向堆叠了两个独立的大卡片"统一高层认知坐标系"和"建立ROI叙事框架"，各自带左侧黄线，每个占了很大面积。
- 三个元素（pill、卡片1、卡片2）是分散的独立模块。

### 改动要求
将这三者合并为**一个统一的推荐主卡片**，结构如下：

```
┌────────────────────────────────────────────────────────┐
│ ▊                                                       │
│ ▊  ⚡ 推荐：1天高管工作坊（定方向）    一天看清方向，找准切入点  │
│ ▊                                                       │
│ ▊  ┌──────────────────────┐  ┌──────────────────────┐  │
│ ▊  │ 🎯 统一高层认知坐标系  │  │ 📊 建立ROI叙事框架   │  │
│ ▊  │ 26个标杆案例+5维度... │  │ 了解财务/业务/战略... │  │
│ ▊  └──────────────────────┘  └──────────────────────┘  │
│ ▊                                                       │
└────────────────────────────────────────────────────────┘
```

具体样式：
- 整个卡片：`background: linear-gradient(135deg, rgba(232,197,71,0.06) 0%, rgba(232,197,71,0.02) 100%); border: 1px solid rgba(232,197,71,0.18); border-radius: 16px; padding: 24px 32px; margin-bottom: 20px;`
- 左侧accent竖线：用 `::before` 伪元素，`width: 3px; height: 100%; background: #E8C547; border-radius: 3px 0 0 3px; position: absolute; top: 0; left: 0;`
- **顶部行**（flex，space-between，`margin-bottom: 16px`）：
  - 左侧：黄底黑字badge — `background: #E8C547; color: #1a1a1a; font-size: 15px; font-weight: 700; padding: 8px 20px; border-radius: 8px;`
  - 右侧：一句话副标题 — `font-size: 14px; color: #A0A8B8;`
- **下方**：两个"解决问题"模块**横向并排**（`display: grid; grid-template-columns: 1fr 1fr; gap: 16px;`），每个模块：
  - `background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 18px 20px;`
  - 标题：`font-size: 15px; font-weight: 600;`，前面带一个小图标emoji
  - 描述：`font-size: 13px; color: #A0A8B8; line-height: 1.65;`
  - **删除**原来每个卡片的左侧黄线
  - **标题和描述都改为左对齐**（当前标题是居中的，描述是左对齐的，对齐方式冲突）

---

## 四、"您会带走" — 改为横向三列

### 当前状态
三个交付物纵向排列为列表（带绿勾+黄色标题+描述），占了大量纵向空间。

### 改动要求
改为 **横向三列网格**（`display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px;`）。

- 在网格上方加一行标签 `"您会带走"`：`font-size: 13px; font-weight: 600; color: #A0A8B8; letter-spacing: 0.5px; grid-column: 1 / -1;`
- 每个交付物是一个小卡片：`background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px;`
- 卡片内部 flex 横排：左侧绿色对勾圆角方块（`20px × 20px`，背景 `rgba(52,211,153,0.12)`），右侧文字区（标题 `13px bold` accent色 + 描述 `12px` 灰色）。
- **删除**原来每项左侧的黄色竖线装饰。

---

## 五、底部行 — 资料卡片与CTA并排

### 当前状态
- "AI项目画布（样例）"和"落地断点自检表"两张资料卡片独占一行。
- "返回"和"继续预约沟通"两个按钮在资料卡片下方再占一行。
- 两者之间没有关联，需要继续滚动。

### 改动要求
将资料卡片和CTA按钮组**合并为同一行**（`display: flex; gap: 16px; align-items: stretch;`），左侧资料区、右侧CTA区：

**左侧资料区**（`flex: 1; display: flex; gap: 14px;`）：
- 两张资料卡片保持并排，每张：`background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px 18px;`
- 内部横排：左侧图标区（`40px × 40px` 圆角方块，背景 `rgba(255,255,255,0.06)`），右侧文字区（名称 `13px bold` + 格式标签 `11px` accent色 + 一行描述 `11px` 灰色）。
- hover效果：`background` 提亮 + `translateY(-1px)`。

**右侧CTA区**（`min-width: 260px; display: flex; flex-direction: column; gap: 10px; justify-content: center;`）：
- 主按钮"预约工作坊席位 →"：`background: #E8C547; color: #1a1a1a; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 10px;`，hover时 `box-shadow: 0 8px 24px rgba(232,197,71,0.25); transform: translateY(-1px);`
  - **注意**：按钮文案从"继续预约沟通"改为**"预约工作坊席位 →"**，更具体更有行动力。
- 次按钮"← 返回上一步"：`background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #666E7A; font-size: 13px; padding: 10px 20px; border-radius: 8px;`

---

## 六、新增信任锚

### 当前状态
页面底部没有任何信任元素。

### 改动要求
在底部行下方增加一行居中信任文字：
- 内容：`已帮助 120+ 位创业者找到清晰路径 · 平均 3 次沟通出方案 · 满意度 4.9/5`
- 样式：`font-size: 11px; color: #666E7A; text-align: center; padding-bottom: 12px; letter-spacing: 0.3px;`
- 分隔符 `·` 用 `opacity: 0.4`。

---

## 七、删除 / 清理项

请确认以下元素在新版中被**移除或替换**：

1. ❌ **所有独立的左侧黄色竖线装饰**（推荐卡片可保留一条作为accent bar，其余全删）
2. ❌ "1/2 选择方向 ✅ · 2/2 补充问题 ✅" 子步骤状态行
3. ❌ "针对您关注的两个问题，这门课会帮您重点解决：" 这行过渡文案（信息已被融入主卡片结构中）
4. ❌ 两个"解决问题"作为独立全宽卡片的布局（合并进主卡片内部）
5. ❌ 底部"返回"和"继续预约沟通"作为独立居中按钮行（合并到底部行右侧）
6. ❌ 页面的纵向滚动能力（改为 `overflow: hidden; height: 100vh;`）

---

## 八、入场动画（锦上添花）

给各区块加上 staggered fade-up 入场动画：

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.header       { animation: fadeUp 0.5s ease both; }
.reco-card    { animation: fadeUp 0.5s ease 0.1s both; }
.deliverables { animation: fadeUp 0.5s ease 0.2s both; }
.footer-row   { animation: fadeUp 0.5s ease 0.3s both; }
```

---

## 九、参考实现

完整的HTML参考原型已生成，文件名为 `step2-single-screen.html`，可以直接打开查看最终效果。请以该文件的视觉效果和布局结构为准进行开发，但需要适配到你现有的项目框架（Vue/React/原生）中，而非直接复制HTML。

---

## 核心原则总结

| 原则 | 说明 |
|------|------|
| **零滚动** | 所有内容在 100vh 内完成，不需要滚动即可决策 |
| **信息合并** | 推荐badge + 解决问题 合并为一个主卡片；资料 + CTA 合并为一行 |
| **黄线减法** | 从"每个板块都有黄线"减到"只有主推荐卡片有一条" |
| **横向优先** | 解决问题2列、交付物3列、底部资料+CTA并排——压缩纵向空间 |
| **对齐统一** | 所有卡片内部统一左对齐，不混用居中和左对齐 |
| **CTA始终可见** | 按钮在一屏内始终可见，无需粘性底栏 |
