# 步骤3 → 步骤4 跳转按钮 + 一屏收尾修复

> **问题：** 步骤3当前没有任何方式进入步骤4（确认页）。需要在底部添加跳转按钮，并确保整个页面在一屏内显示完整。

---

## 改动1：添加底部操作栏

在右栏卡片下方（"预约电话时段"按钮和"选定时间，我们准时致电"之后），添加一个**全宽底部操作栏**，横跨左右两栏：

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   💡 沟通前会发送《AI落地断点自检表》    [ 返回 ]  [ 我已扫码/预约完成 → ] │
│      您的信息严格保密，绝不外泄                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 具体实现

在两栏网格容器的**下方**（不是右栏内部），添加一个全宽的底部栏：

```css
/* 底部操作栏 — 全宽，横跨两栏 */
.step3-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
```

**左侧：信任提示**
```html
<div class="trust-hint">
  💡 沟通前我们会发送《AI落地断点自检表》，帮您提前梳理思路。
  <br>
  <span style="color: #666; font-size: 11px;">您的信息仅用于预约诊断，严格保密，绝不外泄。</span>
</div>
```
```css
.trust-hint {
  font-size: 12px;
  color: #888;
  line-height: 1.6;
}
```

**右侧：按钮组**
```html
<div class="bottom-buttons">
  <button class="btn-back">返回</button>
  <button class="btn-next" onclick="goToStep4()">我已扫码/预约完成 →</button>
</div>
```
```css
.bottom-buttons {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* 返回 — 次级按钮 */
.btn-back {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  font-size: 13px;
  padding: 8px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-back:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: #aaa;
}

/* 我已扫码/预约完成 — 主按钮（accent实色） */
.btn-next {
  background: #E8C547;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-next:hover {
  background: #f0d060;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(232, 197, 71, 0.25);
}
```

### 按钮功能
- **"返回"**：回到步骤2（与当前已有的返回逻辑一致）
- **"我已扫码/预约完成 →"**：跳转到步骤4确认页（路由到 step4 页面）

---

## 改动2：为底部栏腾出空间

底部操作栏大约需要 **50-60px** 高度。为了在一屏内放下它，需要从上方压缩等量空间：

### 方案A（推荐）：压缩主标题区
```css
/* 主标题 — 字号缩小 */
font-size: 26px !important;  /* 当前约32px */

/* 主标题 margin-bottom */
margin-bottom: 2px !important;

/* 副标题 margin-bottom */
margin-bottom: 16px !important;  /* 当前约20px */
```
标题区省出约 30px。

### 方案B（配合A一起做）：压缩头部进度条区域
```css
/* 进度条区域的上下padding */
padding-top: 12px !important;   /* 当前约20px */
padding-bottom: 8px !important;
```
再省出约 15px。

### 方案C（配合A、B一起做）：右栏卡片内间距再微调
```css
/* "或"分隔线上下margin */
margin: 8px 0 !important;  /* 当前约10-12px */

/* "预约电话时段"按钮的padding */
padding: 8px 20px !important;  /* 当前约10-12px */

/* "选定时间，我们准时致电"下方margin */
margin-bottom: 0 !important;
```
再省出约 15px。

A + B + C 合计省出约 60px，刚好放下底部操作栏。

---

## 改动3：页面锁定一屏

确认页面最外层容器设置：
```css
height: 100vh;
overflow: hidden;
```

---

## 空间预算验证（100vh = 900px）

| 区块 | 高度 |
|------|------|
| 导航栏 | 56px |
| 头部（进度条+步骤+回顾） | 65px |
| 主标题+副标题 | 55px |
| 两栏内容区 | 400px |
| 底部操作栏 | 55px |
| 各区块间距 | ~60px |
| **总计** | **~691px** ✅ |

900px 视口下有约 200px 余量，768px 小屏也完全放得下。

---

## 检查清单

| # | 检查项 | ☐ |
|---|-------|---|
| 1 | 底部操作栏可见，横跨两栏全宽 | ☐ |
| 2 | "我已扫码/预约完成→"是实色黄色按钮 | ☐ |
| 3 | 点击"我已扫码/预约完成→"能跳转到步骤4 | ☐ |
| 4 | "返回"按钮能回到步骤2 | ☐ |
| 5 | 信任提示（自检表+保密）在按钮左侧 | ☐ |
| 6 | 页面所有内容在一屏内完整显示 | ☐ |
| 7 | 页面设置了 overflow: hidden | ☐ |
