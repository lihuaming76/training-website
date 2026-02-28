# 步骤3 预约页面 — 优化定稿指令

> **页面目标：** 转化漏斗的临门一脚。用户在这里扫码或预约电话，所有改动服务于：**一屏显示 + 降低行动摩擦 + 建立信任。**

---

## P0：一屏显示（先解决放不下的问题）

### 1. 二维码缩小至 140px

当前二维码过大（约200px+），占据右栏近半面积。

```css
/* 二维码图片 */
width: 140px !important;
height: 140px !important;
```

二维码只需"能扫就行"，缩小后节省约 50-60px 纵向空间。

### 2. 主标题区间距压缩

当前"开启15分钟精准诊断"与副标题之间、副标题与两栏内容区之间间距偏大。

```css
/* 主标题 */
margin-bottom: 4px !important;

/* 副标题 */
margin-bottom: 20px !important;
```

标题区从约120px压缩到约80px。

### 3. 左栏三个价值点间距收紧

当前每个价值点之间约 20-24px，压缩到 12-14px：

```css
/* 每个价值点容器 */
margin-bottom: 12px !important;
```

三个点总共省出约 20px。

### 4. 右栏卡片内部间距统一压缩

逐项缩减：
- "选择您方便的沟通方式" 到二维码：`margin-bottom: 12px`（原约20px）
- 二维码到 "扫码添加微信"：`margin-top: 10px`（原约16px）
- "微信号" 到 "或" 分隔线：`margin: 12px 0`（原约20px）
- "预约电话时段" 按钮到底部：`margin-bottom: 0`

### 5. 锁定一屏

```css
/* 页面最外层容器 */
height: 100vh;
overflow: hidden;
```

---

## P1：信任感建设（高端咨询服务的关键）

### 6. 二维码上方添加专家背书

在右栏二维码上方、"选择您方便的沟通方式"标题下方，插入一个专家信息条：

```
┌─────────────────────────────────────┐
│  [头像]  李华明 | Pallas Studio 创始人  │
│          首席AI转型顾问               │
└─────────────────────────────────────┘
```

样式：
- 容器：`display: flex; align-items: center; gap: 12px; margin-bottom: 16px;`
- 头像：圆形，`width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);`（如无真实头像，先用灰色占位圆 + 首字母）
- 姓名：`font-size: 13px; font-weight: 600; color: #F0F0F0;`
- 职称：`font-size: 12px; color: #A0A8B8;`

### 7. 社会证明数字

在右栏卡片底部（"预约电话时段"按钮下方），添加一行社会证明：

```
已为 137 位企业高管提供诊断 · 满意度 4.9/5
```

样式：`font-size: 11px; color: #666; text-align: center; margin-top: 12px; letter-spacing: 0.3px;`

### 8. 信任文案补位

左栏内容比右栏短，底部留有空白。在左栏三个价值点下方补充信任文案：

```
不推销，只给专业判断。
```

样式：`font-size: 13px; color: #888; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06);`

用一条微弱分隔线与上方价值点区分，既填补空白，又强化"不推销"的核心承诺。

---

## P2：视觉细节与交互强化

### 9. 左栏价值点关键词高亮

三个价值点的标题（"帮您快速定位"、"聚焦您最关注的"、"给出明确建议"）加粗处理：

```css
font-weight: 700;
color: #F0F0F0; /* 纯白，与描述文字拉开层级 */
```

第2个价值点中用户的关注词（如"算不清投入产出"、"团队能力跟不上"）使用 accent 色高亮：

```css
color: #E8C547;
font-weight: 500;
```

让用户一眼看到"这是针对我说的"。

### 10. "预约电话时段"按钮增强

当前是纯描边按钮，视觉上偏弱。增加 hover 效果：

```css
/* 默认态 */
border: 1px solid rgba(255,255,255,0.15);
border-radius: 8px;
padding: 10px 20px;
font-size: 13px;
color: #ccc;
width: 100%;
text-align: center;
transition: all 0.25s ease;

/* hover态 */
border-color: rgba(255,255,255,0.3);
background: rgba(255,255,255,0.04);
transform: translateY(-1px);
```

### 11. 底部按钮主次关系明确

确保底部两个按钮的视觉层级正确：

- **"我已扫码/预约完成 →"**：必须是**实色 accent 按钮**（`background: #E8C547; color: #1a1a1a; font-weight: 700; padding: 12px 32px; border-radius: 8px;`），这是全页面最重要的行动终点。hover 时 `box-shadow: 0 6px 20px rgba(232,197,71,0.25); transform: translateY(-1px);`
- **"返回"**：描边次级按钮（`background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 10px 32px;`）

两个按钮并排居中：`display: flex; justify-content: center; gap: 16px; padding: 16px 0;`

### 12. 二维码区域引导文案优化

将当前"扫码添加微信"改为更有行动力的文案：

```
扫码预约 15 分钟专属诊断
```

样式：`font-size: 14px; font-weight: 600; color: #F0F0F0; margin-top: 10px;`

下方保留原有备注（添加后备注"15分钟诊断"）和微信号。

---

## P3：移动端适配

### 13. 响应式断点处理

```css
@media (max-width: 768px) {
  /* 两栏改为单列 */
  .two-column-container {
    grid-template-columns: 1fr !important;
    gap: 24px !important;
  }

  /* 二维码在移动端适当放大，方便扫码 */
  .qrcode-image {
    width: 200px !important;
    height: 200px !important;
  }

  /* 右栏卡片全宽 */
  .right-column-card {
    width: 100% !important;
  }

  /* 底部按钮纵向堆叠 */
  .bottom-buttons {
    flex-direction: column !important;
    gap: 10px !important;
  }
  .bottom-buttons button {
    width: 100% !important;
  }

  /* 页面允许滚动（移动端不强制一屏） */
  .page-container {
    height: auto !important;
    overflow: auto !important;
  }
}
```

---

## 检查清单

| # | 检查项 | 状态 |
|---|-------|------|
| 1 | 二维码缩小到 140px | ☐ |
| 2 | 主标题区间距压缩（标题区总高 ≤ 80px） | ☐ |
| 3 | 左栏价值点间距 12px | ☐ |
| 4 | 右栏卡片内部间距全部收紧 | ☐ |
| 5 | 页面 100vh + overflow hidden（桌面端） | ☐ |
| 6 | 专家头像+姓名+职称出现在二维码上方 | ☐ |
| 7 | 社会证明数字出现在右栏底部 | ☐ |
| 8 | 左栏底部有"不推销，只给专业判断"信任文案 | ☐ |
| 9 | 价值点标题加粗，用户关注词用accent色高亮 | ☐ |
| 10 | "我已扫码/预约完成→"是实色accent按钮（非文字链接） | ☐ |
| 11 | "返回"是描边次级按钮 | ☐ |
| 12 | 二维码上方文案改为"扫码预约15分钟专属诊断" | ☐ |
| 13 | 移动端两栏变单列，二维码放大到200px，按钮纵向堆叠 | ☐ |
