# 提示词：构建「关于讲师」模块 V2 优化版

## 角色与背景

你是一名高级前端开发工程师，正在对 Pallas Studio（帕拉斯智策工作室）培训官网的「关于讲师」模块进行重构优化。

当前版本的问题：
- 左栏（照片区）信息密度过低——只有一张照片 + 姓名 + "资深数据与AI领域专家"泛化头衔
- 右栏信息堆叠扁平——核心资历、擅长领域、代表性成果视觉层级雷同
- "代表性成果"只是四行打钩文本，缺乏结构化和视觉冲击力
- 整体缺少"为什么这个人能扛住我的项目"的说服逻辑

### 设计核心原则

这个模块要回答的不是"讲师是谁"，而是**"为什么这个人能扛住我的项目"**。

目标客户是正在评估一笔 ¥5-16万支出的企业决策者，他们看讲师介绍时的三个核心问题：
1. "这个人做过跟我类似规模/行业的项目吗？"
2. "他是纯理论的还是真扛过业务指标的？"
3. "把两天时间和团队交给他，风险可控吗？"

所有设计决策围绕这三个问题展开。

---

## 品牌视觉规范（必须严格遵守）

```
主背景色：#0D1117（深色区块）
页面背景：#FFFFFF
Accent主色：#E8C547（黄金色）
正文标题色：#0F172A
正文内容色：#334155
次要文字色：#64748B
辅助灰色：#94A3B8
边框色：#E2E8F0
浅背景色：#F8FAFC
成果绿色：#059669
警示红色：#DC2626
蓝色标签色：#2563EB
琥珀色：#D97706
紫色（Agentic AI）：#7C3AED
圆角：8px（卡片）、12px（大容器）、20px（按钮）
```

---

## 整体布局

模块位于「课程详情」页面的底部区块（导航栏中对应「关于讲师」锚点）。

### 结构：左右双栏

```
┌──────────────────────────────────────────────────────────────────────┐
│  模块标题区（全宽，居中）                                               │
├──────────────────────┬───────────────────────────────────────────────┤
│                      │                                               │
│   A. 左栏             │   B. 右栏                                     │
│   人格化信任锚点       │   结构化能力证明                                │
│                      │                                               │
│   宽度: 320px 固定    │   宽度: flex: 1（自适应剩余空间）                │
│                      │                                               │
└──────────────────────┴───────────────────────────────────────────────┘
```

- 整体容器：`max-width: 1200px; margin: 0 auto; padding: 60px 40px;`
- 双栏布局：`display: flex; gap: 48px; align-items: flex-start;`
- 响应式 < 768px：改为单栏纵向，左栏居中，右栏在下

---

### 模块标题区（双栏上方，全宽居中）

```
关于讲师
```

- 主标题：`font-size: 28px; font-weight: 700; color: #0F172A; text-align: center; margin-bottom: 40px;`
- 标题下方无副标题（讲师模块不需要解释性文案，直接进入内容）

---

## A. 左栏：人格化信任锚点

宽度固定 `320px`。整体为一张卡片容器。

### 卡片容器样式

```css
.instructor-card {
  background: #0D1117;
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 80px; /* 滚动时粘住 */
}
```

### A1. 照片区

- 图片路径：`images/mypic-1.png`
- 容器：`width: 100%; aspect-ratio: 3/4; overflow: hidden;`
- 图片：`width: 100%; height: 100%; object-fit: cover; object-position: center top;`
- 底部渐变遮罩（让文字浮在照片底部）：
  ```css
  .photo-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, #0D1117 0%, rgba(13,17,23,0.8) 40%, transparent 100%);
  }
  ```

### A2. 姓名（叠在照片底部，渐变遮罩之上）

```
李华明
```

- 样式：`position: absolute; bottom: 60px; left: 24px; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: 1px;`

### A3. 方法论承诺金句（替代泛化头衔）

**删除**当前的"资深数据与AI领域专家"。替换为：

```
"只做可立项、可推进、可验收的AI工作坊"
```

- 位置：姓名下方，仍在照片区的渐变遮罩内
- 样式：`position: absolute; bottom: 24px; left: 24px; right: 24px; font-size: 13px; color: #E8C547; font-style: italic; line-height: 1.5;`
- 左侧加一条竖线装饰：`border-left: 2px solid #E8C547; padding-left: 12px;`

这句金句直接呼应课程详情页的核心主张"不是听课，是产出方案"。

### A4. 信息区（照片下方，深色背景内）

`padding: 20px 24px 24px;`

#### 双重身份标签

两个并排标签，突出"咨询方法论 + 实业实操"双重背景：

```
[顶尖咨询合伙人]         [深入业务一线操盘]
 IBM / 德勤 / 埃森哲       亲历业务指标与团队搭建
```

样式：
```css
.identity-tag {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}
.identity-tag .sub {
  font-size: 10px;
  font-weight: 400;
  margin-top: 2px;
  opacity: 0.7;
}
```

- 左标签：`background: rgba(37,99,235,0.12); color: #93B4F8; border: 1px solid rgba(37,99,235,0.25);`
  - 主文：「顶尖咨询合伙人」
  - 子文：「IBM / 德勤 / 埃森哲」
- 右标签：`background: rgba(217,119,6,0.12); color: #FBBF24; border: 1px solid rgba(217,119,6,0.25);`
  - 主文：「深入业务一线操盘」
  - 子文：「亲历业务指标与团队搭建」

两标签并排：`display: flex; gap: 8px; margin-bottom: 16px;`

**重要说明**：右侧标签强调的是讲师在实体企业中亲自参与业务运营、搭建团队、承担指标的经历——不是CEO角色，而是"不只做顾问，还深入甲方业务一线扛过活"的实操背景。文案聚焦于"亲历"而非"领导"。

#### 左栏CTA按钮

```
预约15分钟：判断你的场景能否立项 →
```

样式：
```css
.instructor-cta {
  display: block;
  width: 100%;
  text-align: center;
  padding: 10px 16px;
  border: 1px solid #E8C547;
  color: #E8C547;
  background: transparent;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
}
.instructor-cta:hover {
  background: #E8C547;
  color: #0D1117;
}
```

这是"人对人"的CTA——跟右下角浮动的"帮我评估选型（免费）"互补而不冲突。一个是"跟讲师本人聊"，一个是"跟团队聊"。

---

## B. 右栏：结构化能力证明

宽度自适应：`flex: 1;`。内部按纵向排列四个子模块。

---

### B1. 核心资历（3条，带结果指向）

不再只是罗列头衔，而是每条资历后跟一句话说明**这条资历对客户意味着什么**。

```
┌─ 🏅 ─┬──────────────────────────────────────────────────────────┐
│      │  23年实战经验              擅长高管场推进与跨部门博弈         │
├─ 🏅 ─┼──────────────────────────────────────────────────────────┤
│      │  26个标杆项目              机制与交付模板已验证可复用         │
├─ 🏅 ─┼──────────────────────────────────────────────────────────┤
│      │  顶尖咨询 + 业务实操双栖    跨行业方法论沉淀，甲乙方视角兼备  │
└──────┴──────────────────────────────────────────────────────────┘
```

每行结构：

```html
<div class="credential-row">
  <div class="credential-icon">🏅</div>
  <div class="credential-main">23年实战经验</div>
  <div class="credential-value">擅长高管场推进与跨部门博弈</div>
</div>
```

样式：
```css
.credential-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  margin-bottom: 8px;
}
.credential-icon {
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}
.credential-main {
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  white-space: nowrap;
  margin-right: 16px;
}
.credential-value {
  font-size: 12px;
  color: #64748B;
  flex: 1;
  text-align: right;
}
```

第三条"顶尖咨询 + 业务实操双栖"与左栏的双重身份标签形成呼应——左栏是视觉标签，这里是文字说明。

---

### B2. 擅长领域（3卡片，用交付物语言）

三张水平排列的卡片。每张卡片不是在描述能力，而是在说**"你能带出来什么会、产出什么东西"**。

```
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│  数据治理机制         │  │  AI立项画布          │  │  90天行动计划        │
│  与路线图            │  │  与ROI测算           │  │  与验收标准          │
│                    │  │                    │  │                    │
│  把口径争议变成       │  │  CFO/业务VP/CEO      │  │  里程碑/RACI/       │
│  红线与Owner        │  │  三叙事直接上会       │  │  风险预演            │
│                    │  │                    │  │  消除"回去不动"      │
│  → 指标身份证        │  │  → A3画布            │  │  → 路线图           │
│  → 质量红灯规则      │  │  → ROI沙盘           │  │  → 第一周清单        │
│  → 验收对账单        │  │  → 一页纸上会稿       │  │  → RACI矩阵        │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

三卡片并排：`display: flex; gap: 16px; margin-top: 24px;`

每张卡片结构：

```html
<div class="expertise-card">
  <div class="expertise-title">数据治理机制与路线图</div>
  <div class="expertise-promise">把口径争议变成红线与Owner</div>
  <div class="expertise-outputs">
    <span>→ 指标身份证</span>
    <span>→ 质量红灯规则</span>
    <span>→ 验收对账单</span>
  </div>
</div>
```

样式：
```css
.expertise-card {
  flex: 1;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 20px 16px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.expertise-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}
.expertise-title {
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.4;
  margin-bottom: 8px;
}
.expertise-promise {
  font-size: 12px;
  color: #D97706;
  font-weight: 500;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #F1F5F9;
}
.expertise-outputs span {
  display: block;
  font-size: 11px;
  color: #2563EB;
  margin-bottom: 3px;
}
```

每张卡片顶部有一条 4px 色带（区分三个领域）：
- 卡片1（治理）：`border-top: 4px solid #2563EB;`
- 卡片2（ROI）：`border-top: 4px solid #D97706;`
- 卡片3（行动计划）：`border-top: 4px solid #059669;`

---

### B3. 代表性成果（4张战绩卡片）

从当前的四行打钩文本，升级为结构化的**"机制 → 结果"战绩卡片**。每张卡片左侧有行业色条，明确写出"做了什么机制"（括号内容），跟课程详情页的"我们卖的是可执行机制"核心主张一致。

区块标题：

```
代表性成果
```

`font-size: 20px; font-weight: 700; color: #0F172A; margin-top: 32px; margin-bottom: 16px;`

#### 四张战绩卡片

**卡片1：组织效能**

```html
<div class="achievement-card" data-category="org">
  <div class="achievement-category">组织效能</div>
  <div class="achievement-client">头部物流集团</div>
  <div class="achievement-mechanism">
    建立经营会议数据决策机制（会前准入 / 会后追踪 / KPI字典统一）
  </div>
  <div class="achievement-result">
    → 战略会议效率提升 50%+，数据口径争议下降 80%
  </div>
</div>
```

**卡片2：数据治理**

```html
<div class="achievement-card" data-category="data">
  <div class="achievement-category">数据治理</div>
  <div class="achievement-client">知名运动服饰品牌</div>
  <div class="achievement-mechanism">
    完成全渠道主数据治理闭环（口径Owner / 拦截规则 / 跨系统流转SOP）
  </div>
  <div class="achievement-result">
    → 主数据准确率 75% → 95%+，终端缺货率双位数下降
  </div>
</div>
```

**卡片3：业务ROI**

```html
<div class="achievement-card" data-category="roi">
  <div class="achievement-category">业务ROI</div>
  <div class="achievement-client">知名快消饮品企业</div>
  <div class="achievement-mechanism">
    建立营销ROI测算与归因机制（三叙事口径 + 洞察直驱执行工单闭环）
  </div>
  <div class="achievement-result">
    → 年度节省预算 500万+，执行动作单点增幅翻倍
  </div>
</div>
```

**卡片4：团队建设**

```html
<div class="achievement-card" data-category="team">
  <div class="achievement-category">团队建设</div>
  <div class="achievement-client">大型集团企业</div>
  <div class="achievement-mechanism">
    从零组建百人数据团队，实现数据产品化与跨业务线规模化复用
  </div>
  <div class="achievement-result">
    → 交付边际成本大幅下降，多业务线复用落地
  </div>
</div>
```

#### 战绩卡片统一样式

```css
.achievement-card {
  display: flex;
  flex-direction: column;
  padding: 16px 16px 16px 20px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  margin-bottom: 10px;
  position: relative;
  transition: box-shadow 0.2s;
}
.achievement-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 左侧色条 */
.achievement-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 4px;
  border-radius: 2px;
}
.achievement-card[data-category="org"]::before { background: #2563EB; }
.achievement-card[data-category="data"]::before { background: #7C3AED; }
.achievement-card[data-category="roi"]::before { background: #059669; }
.achievement-card[data-category="team"]::before { background: #D97706; }

.achievement-category {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.achievement-card[data-category="org"] .achievement-category { color: #2563EB; }
.achievement-card[data-category="data"] .achievement-category { color: #7C3AED; }
.achievement-card[data-category="roi"] .achievement-category { color: #059669; }
.achievement-card[data-category="team"] .achievement-category { color: #D97706; }

.achievement-client {
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 4px;
}

.achievement-mechanism {
  font-size: 12px;
  color: #64748B;
  line-height: 1.5;
  margin-bottom: 6px;
}

.achievement-result {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
}
```

四张卡片纵向排列，`margin-bottom: 10px`。

---

### B4. 适用客户声明（筛选区）

在代表性成果下方，增加一个低调但有力的"适合/不适合"声明。传达"我们对客户有要求"的高端信号，同时帮助不合适的客户自我筛选。

```
┌─────────────────────────────┬─────────────────────────────┐
│  ✅ 适合                     │  ⛔ 不适合                    │
│                             │                             │
│  已有明确AI/数据场景，        │  只想听趋势概念课             │
│  希望快速拉齐高管共识         │                             │
│                             │  不愿提前提供场景数据          │
│  需要打通跨部门协作机制       │  与关键参训角色              │
│                             │                             │
│  急需可立项方案向上汇报       │  没有明确的业务痛点           │
└─────────────────────────────┴─────────────────────────────┘
```

```html
<div class="fit-check">
  <div class="fit-column fit-yes">
    <div class="fit-header">✅ 适合</div>
    <ul>
      <li>已有明确AI/数据场景，希望快速拉齐高管共识</li>
      <li>需要打通跨部门协作机制与责任边界</li>
      <li>急需可立项方案向上汇报</li>
    </ul>
  </div>
  <div class="fit-divider"></div>
  <div class="fit-column fit-no">
    <div class="fit-header">⛔ 不适合</div>
    <ul>
      <li>只想听趋势概念课</li>
      <li>不愿提前提供场景数据与关键参训角色</li>
      <li>没有明确的业务痛点</li>
    </ul>
  </div>
</div>
```

```css
.fit-check {
  display: flex;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 20px 24px;
  margin-top: 24px;
  gap: 24px;
}

.fit-column {
  flex: 1;
}

.fit-divider {
  width: 1px;
  background: #E2E8F0;
  align-self: stretch;
}

.fit-header {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
}
.fit-yes .fit-header { color: #059669; }
.fit-no .fit-header { color: #DC2626; }

.fit-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.fit-column li {
  font-size: 13px;
  color: #334155;
  line-height: 1.6;
  padding: 3px 0;
}
.fit-no li {
  color: #64748B;
}
```

---

## 响应式处理

### < 768px（手机 / 小平板）

```css
@media (max-width: 768px) {
  /* 双栏变单栏 */
  .instructor-section {
    flex-direction: column;
    padding: 40px 20px;
  }
  
  /* 左栏取消粘性定位，居中 */
  .instructor-card {
    position: static;
    width: 100%;
    max-width: 400px;
    margin: 0 auto 32px;
  }
  
  /* 擅长领域三卡变纵向 */
  .expertise-row {
    flex-direction: column;
  }
  
  /* 适用客户双栏变纵向 */
  .fit-check {
    flex-direction: column;
  }
  .fit-divider {
    width: 100%;
    height: 1px;
  }
}
```

### 768px - 1024px（平板横屏）

```css
@media (min-width: 768px) and (max-width: 1024px) {
  .instructor-card {
    width: 260px;
  }
  .expertise-row {
    flex-wrap: wrap;
  }
  .expertise-card {
    flex: 1 1 calc(50% - 8px);
  }
}
```

---

## 交互细节

### 左栏照片 hover 效果

```css
.instructor-photo:hover img {
  transform: scale(1.03);
  transition: transform 0.4s ease;
}
```

极轻微的放大，增加专业照片的高级感。

### 战绩卡片 hover 效果

```css
.achievement-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transform: translateX(4px);
  transition: all 0.2s;
}
```

向右微移 4px，配合左侧色条暗示"点击可展开"的潜在交互。

### 擅长领域卡片 hover 效果

```css
.expertise-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transform: translateY(-2px);
  transition: all 0.2s;
}
```

---

## 与页面其他模块的关联设计

### 1. 战绩卡片 ↔ 实战验证模块

四张战绩卡片的客户（物流集团、运动服饰、饮品企业）与「实战验证」模块的三个案例精确对应。视觉上通过左侧色条颜色建立隐性关联（但不做显式链接，保持模块独立性）。

### 2. 擅长领域卡片 ↔ 课程交付物

三张擅长领域卡片底部的「→ 输出」列表，每一项都对应课程详情页「现场就能带走的决策资产」中的具体交付物。用户如果留意到，会感觉到"讲师的能力 = 课程的交付物 = 带走的资产"，形成完整的证据链。

### 3. 适用客户声明 ↔ 课前准备区

"不适合：不愿提前提供场景数据与关键参训角色"与课前准备区的"课前数据收集清单 + 现场角色硬性要求"形成前后呼应——讲师模块在"预筛"，课前准备区在"落实"。

### 4. 左栏CTA ↔ 定价区CTA

左栏的"预约15分钟"是"人对人"的轻CTA，定价区的"申请1天版/2天版"是"事对事"的重CTA。两者在页面上的物理距离和视觉重量形成自然的漏斗：先对人建立信任 → 再对事做出决策。

---

## 技术要求

1. 纯 HTML + CSS 实现，不使用框架
2. 照片路径：`images/mypic-1.png`
3. 左栏使用 `position: sticky; top: 80px;` 实现滚动粘性（右栏内容长，左栏照片保持可见）
4. 所有过渡动画 ≤ 0.3s，使用 `ease` 缓动
5. 兼容 Chrome / Safari / Firefox
6. 所有文字为中文（英文仅出现在公司名"IBM / 德勤 / 埃森哲"处）

## 交付要求

- 输出修改后的讲师模块 HTML + CSS 代码
- 可直接嵌入现有页面（替换当前讲师模块区域）
- 代码清晰有注释

## 质量标准

- **3秒判断**：用户滚动到讲师模块后，3秒内能看到"方法论承诺金句 + 双重身份标签 + 23年/26个项目"三个核心信任锚点
- **信任递进**：视线自然从左栏（人格信任）→ 右栏顶部（资历证明）→ 中部（领域能力）→ 底部（量化成果）→ 适用声明（自我筛选），形成完整的说服链
- **与课程详情零矛盾**：擅长领域的交付物列表、战绩卡片的机制描述、适用客户声明——每一处文案都与课程详情页的核心主张和交付物体系保持一致
- **不自卖自夸**：整个模块没有一句"我很厉害"，全部用"我做了什么机制 → 产生了什么结果"的结构说话。资历是为了说明"你能扛住复杂场景"，不是为了炫耀
- **"适合/不适合"的克制感**：这块不能做得太大或太醒目——它是一个安静的筛选信号，不是"拒客声明"。视觉上用 `#F8FAFC` 浅灰底、小字号，让它"在那里但不喧宾夺主"
