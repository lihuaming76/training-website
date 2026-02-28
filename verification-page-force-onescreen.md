# 实战验证首屏 — 强制一屏方案

> **问题：** 之前的间距压缩方案没有生效，可能是CSS优先级被覆盖。这次换思路：用 flexbox 整体约束，强制所有内容填满一屏。

---

## 方案：给首屏内容区加一个 100vh 容器

找到实战验证页面从"23年顶尖咨询实战"到"向下查看3大实战拆解"之间的**所有内容的共同父容器**（或创建一个wrapper），对其设置：

```css
/* 首屏容器 — 强制占满一屏 */
height: 100vh;
max-height: 100vh;
overflow: hidden;
display: flex;
flex-direction: column;
justify-content: space-between;
padding-top: 20px;
padding-bottom: 20px;
box-sizing: border-box;
```

这样做的效果是：无论内部各元素的 margin/padding 是多少，flex 的 `space-between` 会自动把它们均匀分布在一屏之内，"向下查看3大实战拆解"会自然被推到视口底部。

---

## 如果无法找到共同父容器，用备选方案

在页面中找到以下几个关键元素，逐一强制缩小：

### 备选1：导航栏下方到标题之间的空白

用浏览器 DevTools 检查导航栏（nav）到"23年顶尖咨询实战"之间的DOM结构。找到产生空白的元素（可能是一个空的hero区、一个section的padding、或者body/main的padding-top），对其强制设置：

```css
/* 用 !important 确保覆盖 — 对产生空白的那个元素 */
height: 0 !important;
min-height: 0 !important;
padding-top: 0 !important;
padding-bottom: 0 !important;
margin-top: 0 !important;
margin-bottom: 0 !important;
```

这个空白区域大约有 80-100px，释放它就能腾出足够空间。

### 备选2：如果空白来自导航栏的fixed定位避让

检查 `<main>` 或页面主内容容器是否有类似这样的样式：

```css
padding-top: 150px; /* 或 margin-top: 150px */
```

如果有，改为仅比导航栏高度多一点：

```css
padding-top: 70px !important; /* 导航栏约60px + 10px缓冲 */
```

### 备选3：直接在style标签中写全局覆盖

如果以上方法仍然被覆盖，在页面的 `<head>` 中或组件的 `<style>` 中添加一段带高优先级选择器的覆盖样式：

```css
/* 添加到页面样式中 — 用ID或多层选择器提高优先级 */
body .verification-page .hero-section,
body .verification-page .page-header,
body .verification-page > section:first-child {
  padding-top: 20px;
  margin-top: 0;
  min-height: 0;
  height: auto;
}

body .verification-page .logo-wall {
  margin: 12px 0;
  padding: 8px 0;
}

body .verification-page .quote-section {
  margin: 12px 0;
  padding: 16px 32px;
}

body .verification-page .scroll-hint {
  margin-top: 8px;
  padding-bottom: 12px;
}
```

注意：以上类名是示意，请根据实际DOM结构中的类名替换。

---

## 调试步骤

请按以下顺序操作：

1. **先在浏览器 DevTools 中找到导航栏与"23年顶尖咨询实战"之间的所有DOM元素**，逐个检查哪个元素贡献了空白高度
2. **记录该元素的选择器**（class或id）
3. **用足够高优先级的CSS覆盖其高度/padding/margin**
4. 检查"向下查看3大实战拆解"是否进入视口
5. 如果仍未进入，继续压缩Logo墙和引言区的上下间距

---

## 验证标准

- [ ] 导航栏到"23年顶尖咨询实战"之间的空白 ≤ 30px
- [ ] "↓ 向下查看 3 大实战拆解" 在 1920×900 视口下完整可见
- [ ] 所有内容（标题、Logo墙、案例标题、引言、向下提示）在一屏内
