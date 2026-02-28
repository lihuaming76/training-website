# 步骤二（2.1）推荐页面 — 实现说明（最终修订版 v2）

> **给 Claude Code 的使用方式：** 请同时阅读本文档和《步骤二推荐文案-所有组合-优化版.md》。本文档是技术需求，文案文档是内容数据源。请按本文档改造 `interactive-flow.js` 和 `index.html` 中的步骤二（`#step2`）。

---

## ⚠️ 最高优先：实现约束（请在动手前通读）

1. **Key 不复用：** 阶段 key（`direction | implementation | convince | explore`）和痛点 key（`alignment | scenario | scale | roi | roadmap | team`）是两套独立命名空间，绝不复用。
2. **依据提示必须用中文 label：** 页面展示"基于您的选择：看清方向 + 高层认知拉不齐"，不能显示 key（`direction + alignment`）。
3. **重点解决展示条数 = 用户选择数：** 选1个痛点展示1条，选2个展示2条，保持用户选择顺序。
4. **Deliverables 单独数据结构：** 不要把交付物文案写死在渲染函数里，必须用可维护的数据对象。
5. **explore 分支全程轻量化：** Step2 和 Step3 都进入 consult-mode，不出现课程版本推荐或复杂交付物。
6. **删除旧逻辑时做全局关键词搜索：** 避免残留 CSS / 事件监听 / localStorage key。
7. **renderStep2() 每次从 Step1 进入 Step2 都必须重新执行：** 用户可能返回 Step1 改选。
8. **事件委托：** Step2 内部交互（如升级提示展开、下载资源）使用事件委托绑定在 `#step2` 容器上，避免返回→改选→再进入时重复 addEventListener。
9. **upgrade 是可选字段：** `PAIN_POINT_CONTENT` 中只有部分痛点有 `upgrade` 字段，渲染时必须做 `if (item.upgrade)` 判断。

---

## 一、技术栈与架构

### 当前技术栈
- **纯前端静态站：** 单个 `index.html`（内联 CSS）+ `script.js` + `interactive-flow.js`
- **无框架：** 原生 HTML/CSS/JavaScript，无 React/Vue/构建工具
- **状态管理：** `interactive-flow.js` 中的 `flowState` 对象 + localStorage 持久化

### 关键文件
| 文件 | 职责 |
|-----|------|
| `index.html` | 所有页面内容（单页应用，各 section 通过锚点定位） |
| `interactive-flow.js` | 互动流程的状态管理、步骤切换、选择逻辑 |
| `script.js` | 通用交互（导航、轮播、滚动动画等，不涉及本次改造） |

### 互动流程区域
- 位于 `<section class="interactive section" id="interactive">` 内
- 4个步骤：`<div class="flow-step" id="step1~step4">`
- 通过 `.active` class 控制显示/隐藏
- 步骤间通过按钮的 `data-next` / `data-prev` 属性导航

---

## 二、数据结构定义（全部为 P0，必须先定义再写渲染逻辑）

### 2.1 flowState 扩展

```javascript
const flowState = {
    currentStep: 1,
    selectedCourse: null,         // 'direction' | 'implementation' | 'convince' | 'explore'
    selectedPainPoints: [],       // 最多2个：'alignment'|'scenario'|'scale'|'roi'|'roadmap'|'team'
    recommendedVersion: null,     // 新增：'1day' | '2day' | 'consult'
    selectedContactMethod: 'wechat'
    // 注意：删除旧的 selectedConsultation 字段
};
```

### 2.2 中文 Label 映射表

```javascript
const COURSE_LABEL = {
    'direction':      '看清方向',
    'implementation': '推动项目落地',
    'convince':       '说服决策层',
    'explore':        '先聊聊'
};

const PAINPOINT_LABEL = {
    'alignment': '高层认知拉不齐',
    'scenario':  '不知道从哪个场景切入',
    'scale':     '试点做了但规模化推不动',
    'roi':       '算不清投入产出',
    'roadmap':   '缺落地节奏',
    'team':      '团队能力跟不上'
};
```

### 2.3 推荐映射表

```javascript
const RECOMMENDATION_MAP = {
    'direction':      { branch: 'A', version: '1day',    label: '推荐：1天高管工作坊（定方向）', reason: '一天看清方向，找准切入点。' },
    'implementation': { branch: 'B', version: '2day',    label: '推荐：2天管理者集训（出方案）', reason: '两天打通机制，带走可执行方案。' },
    'convince':       { branch: 'C', version: '2day',    label: '推荐：2天管理者集训（出方案）', reason: '两天产出经得起追问的汇报材料。' },
    'explore':        { branch: 'D', version: 'consult', label: null, reason: null }
};
```

### 2.4 痛点文案数据（完整四个分支）

```javascript
const PAIN_POINT_CONTENT = {
    'A': {
        'alignment': {
            title: '统一高层认知坐标系',
            desc: '26个标杆案例 + 5维度成熟度评估，让技术、业务、财务用同一把尺子对话。'
        },
        'scenario': {
            title: '锁定最值得做的场景',
            desc: '"商业价值×实施难度"矩阵评估，当场筛出3-5个最高回报的优先切入点。'
        },
        'scale': {
            title: '定位规模化的真正断点',
            desc: '通过标杆案例复盘，帮您识别卡在"数据孤岛"还是"权责不清"，现场给出诊断方向。',
            upgrade: '规模化推进涉及组织机制设计，2天版有专门的RACI矩阵和跨部门协作模块，建议了解。'
        },
        'roi': {
            title: '建立ROI叙事框架',
            desc: '了解财务/业务/战略三种ROI叙事逻辑，为优先场景建立初步测算思路。'
        },
        'roadmap': {
            title: '拿到90天路线框架',
            desc: '现场产出分阶段路线图框架和第一周启动方向，理清轻重缓急。'
        },
        'team': {
            title: '识别能力短板与优先补齐方向',
            desc: '成熟度评估中的"人才储备"维度，帮您快速定位团队差距在哪。',
            upgrade: '团队分工与协作机制设计，2天版有完整的RACI矩阵和6个关键角色模块，建议了解。'
        }
    },
    'B': {
        'alignment': {
            title: '先统一认知，再推项目',
            desc: '第一天用26个标杆案例 + 5维度评估对齐高层认知，为落地方案建立共识基础。'
        },
        'scenario': {
            title: '选出场景并当场做成方案',
            desc: '优先级矩阵锁定Top场景，工作坊直接产出包含ROI测算的完整项目画布。'
        },
        'scale': {
            title: '打通规模化的组织瓶颈',
            desc: '第二天专门设计RACI责任矩阵、跨部门决策流程和协作机制，解决"部门墙打不通"的根源。'
        },
        'roi': {
            title: '产出可汇报的ROI方案',
            desc: 'ROI计算器详细测算 + 财务/业务/战略三种叙事方式，产出可直接用于立项汇报的材料。'
        },
        'roadmap': {
            title: '拿到可执行的90天计划',
            desc: '每个里程碑有验收标准、每个任务有责任人，第一周清单细化到每天做什么、产出什么。'
        },
        'team': {
            title: '明确谁来做、谁负责、谁配合',
            desc: 'RACI矩阵把6个关键角色的职责写死，配合激励机制设计，解决"没人愿意牵头"的问题。'
        }
    },
    'C': {
        'alignment': {
            title: '用"他山之石"打破内部僵局',
            desc: '引入26个标杆企业的真实ROI数据与落地路径——不是你在说服老板，是同行的成功案例在说服他们。'
        },
        'scenario': {
            title: '用评估框架替代拍脑袋',
            desc: '5维度评估 + 优先级矩阵，让决策层看到结构化的选择逻辑，而不是"我觉得应该做这个"。'
        },
        'scale': {
            title: '用机制设计回应"为什么这次能成"',
            desc: 'RACI矩阵 + 验收标准 + 跨部门协作机制，帮您证明这次有闭环、有人管、有标准。'
        },
        'roi': {
            title: '同一个项目，给不同决策者讲不同的数',
            desc: '财务ROI给CFO看回报率，业务ROI给VP看增长，战略ROI给CEO看竞争优势——三套叙事，一次做完。'
        },
        'roadmap': {
            title: '用路线图证明"已经想清楚了"',
            desc: '一份带验收标准和责任人的90天路线图，比任何承诺都有说服力。决策层要的是确定性。'
        },
        'team': {
            title: '用RACI矩阵回答"谁来干"',
            desc: '决策层批预算前一定会问这个问题。6个角色、每个任务的R/A/C/I写清楚，证明团队已经ready。'
        }
    },
    'D': {
        'alignment': {
            title: '高层分歧在哪',
            desc: '帮您判断高层分歧是认知层面还是机制层面，两者的解法完全不同。'
        },
        'scenario': {
            title: '候选场景初筛',
            desc: '快速梳理2-3个候选场景，初步判断哪个回报最高、最容易先做出成果。'
        },
        'scale': {
            title: '规模化卡在哪个环节',
            desc: '聊聊卡在哪个环节——数据打不通、部门不配合、还是验收标准不清，不同原因对应不同解法。'
        },
        'roi': {
            title: 'ROI测算思路',
            desc: '帮您理一下ROI测算思路，看是缺数据、缺方法、还是缺叙事角度。'
        },
        'roadmap': {
            title: '需要路线图还是先解决瓶颈',
            desc: '帮您判断是需要一个完整路线图，还是先解决某个具体瓶颈。'
        },
        'team': {
            title: '缺人、缺技能、还是缺机制',
            desc: '帮您评估是缺人、缺技能、还是缺机制——三种情况的优先动作完全不同。'
        }
    }
};
```

### 2.5 交付物数据（按分支独立定义）

```javascript
const DELIVERABLES = {
    'A': [
        { prefix: '一份认知地图：', content: 'AI成熟度评估结果（5维度评分 + 优先机会点）' },
        { prefix: '一个方向选择：', content: 'AI项目画布初稿（明确优先场景和价值方向）' },
        { prefix: '一个启动框架：', content: '90天路线图框架（阶段划分 + 关键里程碑）' }
    ],
    'B': [
        { prefix: '一套可汇报的方案：', content: '完整AI项目画布（含详细ROI测算 + 三种高管叙事）' },
        { prefix: '一张防扯皮的地图：', content: '详细90天路线图 + RACI跨部门责任矩阵 + 第一周清单' },
        { prefix: '一次抗压测试记录：', content: '经过讲师模拟CEO/CFO/CIO追问验证的风险预演方案' }
    ],
    'C': [
        { prefix: '一套可汇报的方案：', content: '完整AI项目画布（含详细ROI测算 + 三种高管叙事）' },
        { prefix: '一张防扯皮的地图：', content: '详细90天路线图 + RACI跨部门责任矩阵 + 第一周清单' },
        { prefix: '一次抗压测试记录：', content: '经过讲师模拟CEO/CFO/CIO追问验证的风险预演方案' }
    ],
    'D': [] // D分支不展示交付物
};
```

### 2.6 分支D的沟通承诺数据

```javascript
const EXPLORE_PROMISE = {
    badges: ['绝无销售压力', '只提供专业判断', '赠送《AI落地断点自检表》'],
    note: '如果您暂时不需要培训，我们会直接告诉您。'
};
```

---

## 三、HTML 模板结构

### 3.1 分支 A/B/C 的页面结构（推荐课程版本）

用以下结构**替换**现有 `#step2` 内部的全部内容：

```html
<div class="flow-step" id="step2" data-step="2">
    <div class="step-header">
        <span class="step-number">步骤 2/4</span>
        <p class="step-basis" id="recommendBasis"></p>
        <!-- 动态填充："基于您的选择：看清方向 + 高层认知拉不齐、算不清ROI" -->
    </div>

    <!-- === 课程推荐模式（分支A/B/C）=== -->
    <div class="recommend-mode" id="recommendMode">
        <div class="recommendation-card">
            <div class="recommend-label" id="recommendLabel"></div>
            <p class="recommend-reason" id="recommendReason"></p>

            <div class="recommend-solutions">
                <h4 class="solutions-intro" id="solutionsIntro"></h4>
                <!-- 动态填充："这门课会帮您重点解决：" 或 "针对您关注的两个问题..." -->
                <div class="solutions-list" id="solutionsList"></div>
                <!-- 动态插入1-2条痛点卡片，每条结构见下方 solution-item 模板 -->
            </div>

            <div class="recommend-deliverables">
                <h4>您会带走：</h4>
                <div class="deliverables-list" id="deliverablesList"></div>
                <!-- 动态插入3条交付物 -->
            </div>
        </div>

        <!-- 赠送资料（保留） -->
        <div class="bonus-resources">
            <div class="resource-card">
                <div class="resource-icon">📄</div>
                <div class="resource-content">
                    <h5>AI项目画布（样例）</h5>
                    <p>完整A3画布年度规范，包含ROI测算细节。</p>
                    <span class="resource-format">PDF格式，可打印</span>
                </div>
            </div>
            <div class="resource-card">
                <div class="resource-icon">✅</div>
                <div class="resource-content">
                    <h5>落地断点自检表</h5>
                    <p>一页纸快速诊断企业AI落地核心阻碍。</p>
                    <span class="resource-format">Excel格式，可编辑</span>
                </div>
            </div>
        </div>
    </div>

    <!-- === 沟通引导模式（分支D）=== -->
    <div class="explore-mode" id="exploreMode" style="display:none;">
        <h3 class="explore-title">没问题，我们先聊聊</h3>
        <p class="explore-subtitle">不急着选课程。15分钟帮您理清现状，再看需要什么。</p>

        <div class="explore-focus">
            <h4>这15分钟我们会重点聊：</h4>
            <ul class="explore-focus-list" id="exploreFocusList"></ul>
            <!-- 动态插入1-2条沟通重点 -->
        </div>

        <div class="explore-promise">
            <div class="promise-badges" id="explorePromiseBadges"></div>
            <!-- 动态插入承诺badges -->
            <p class="promise-note" id="explorePromiseNote"></p>
        </div>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
        <button class="btn btn-secondary btn-back" data-prev="step1">返回</button>
        <button class="btn btn-gold btn-continue" id="step2Continue" data-next="step3">继续预约沟通</button>
    </div>
</div>
```

### 3.2 动态生成的子元素模板

**痛点解决方案卡片（solution-item）：**
```html
<div class="solution-item">
    <h5 class="solution-title">【动态：title】</h5>
    <p class="solution-desc">【动态：desc】</p>
    <!-- 仅当 upgrade 字段存在时渲染以下部分 -->
    <div class="upgrade-hint">
        <span class="upgrade-icon">💡</span>
        <p class="upgrade-text">【动态：upgrade】</p>
    </div>
</div>
```

**交付物条目（deliverable-item）：**
```html
<div class="deliverable-item">
    <span class="deliverable-check">✅</span>
    <span class="deliverable-prefix">【动态：prefix，加粗金黄色】</span>
    <span class="deliverable-content">【动态：content】</span>
</div>
```

**分支D沟通重点条目：**
```html
<li class="explore-focus-item">
    <strong>【动态：title】</strong>
    <span>【动态：desc】</span>
</li>
```

---

## 四、核心渲染函数

```javascript
// ===================================
// Step 2: Dynamic Recommendation Rendering
// ===================================

// 用户可能从step1返回修改，所以每次进入step2都必须重新渲染
function renderStep2() {
    const course = flowState.selectedCourse;
    const painPoints = flowState.selectedPainPoints;

    // 防御性校验：状态不完整则强制退回步骤一
    if (!course || !painPoints || painPoints.length === 0) {
        showStep(1);
        return;
    }

    const config = RECOMMENDATION_MAP[course];
    const branch = config.branch;

    // 保存推荐版本
    flowState.recommendedVersion = config.version;
    saveFlowState();

    // 清空旧内容（防止返回→改选→再进入时内容重复）
    document.getElementById('solutionsList').innerHTML = '';
    document.getElementById('deliverablesList').innerHTML = '';
    document.getElementById('exploreFocusList').innerHTML = '';

    // 1. 渲染依据提示
    const courseLabel = COURSE_LABEL[course];
    const painLabels = painPoints.map(p => PAINPOINT_LABEL[p]).join('、');
    document.getElementById('recommendBasis').textContent = 
        `基于您的选择：${courseLabel} + ${painLabels}`;

    // 2. 根据分支切换显示模式
    const recommendMode = document.getElementById('recommendMode');
    const exploreMode = document.getElementById('exploreMode');

    if (course === 'explore') {
        // === 分支D：沟通引导模式 ===
        recommendMode.style.display = 'none';
        exploreMode.style.display = 'block';
        renderExploreMode(branch, painPoints);
    } else {
        // === 分支A/B/C：课程推荐模式 ===
        recommendMode.style.display = 'block';
        exploreMode.style.display = 'none';
        renderRecommendation(config, branch, painPoints);
    }

    // 3. 给step2内容区域添加淡入效果（让用户感知到内容刷新）
    const step2 = document.getElementById('step2');
    step2.classList.remove('fade-in');
    void step2.offsetWidth; // 触发reflow
    step2.classList.add('fade-in');
}

function renderRecommendation(config, branch, painPoints) {
    // 推荐标签和理由
    document.getElementById('recommendLabel').textContent = config.label;
    document.getElementById('recommendReason').textContent = config.reason;

    // 衔接句
    const introText = painPoints.length === 1
        ? '这门课会帮您重点解决：'
        : '针对您关注的两个问题，这门课会帮您重点解决：';
    document.getElementById('solutionsIntro').textContent = introText;

    // 渲染痛点解决方案（按用户选择顺序）
    const solutionsList = document.getElementById('solutionsList');
    painPoints.forEach(point => {
        const item = PAIN_POINT_CONTENT[branch][point];
        if (!item) return; // 防御：未知痛点跳过

        const div = document.createElement('div');
        div.className = 'solution-item';

        let html = `
            <h5 class="solution-title">${item.title}</h5>
            <p class="solution-desc">${item.desc}</p>
        `;

        // 仅当 upgrade 字段存在时渲染升级提示
        if (item.upgrade) {
            html += `
                <div class="upgrade-hint">
                    <span class="upgrade-icon">💡</span>
                    <p class="upgrade-text">${item.upgrade}</p>
                </div>
            `;
        }

        div.innerHTML = html;
        solutionsList.appendChild(div);
    });

    // 渲染交付物
    const deliverablesList = document.getElementById('deliverablesList');
    const deliverables = DELIVERABLES[branch];
    deliverables.forEach(d => {
        const div = document.createElement('div');
        div.className = 'deliverable-item';
        div.innerHTML = `
            <span class="deliverable-check">✅</span>
            <span class="deliverable-prefix">${d.prefix}</span>
            <span class="deliverable-content">${d.content}</span>
        `;
        deliverablesList.appendChild(div);
    });
}

function renderExploreMode(branch, painPoints) {
    // 渲染沟通重点
    const focusList = document.getElementById('exploreFocusList');
    painPoints.forEach(point => {
        const item = PAIN_POINT_CONTENT[branch][point];
        if (!item) return;

        const li = document.createElement('li');
        li.className = 'explore-focus-item';
        li.innerHTML = `<strong>${item.title}：</strong><span>${item.desc}</span>`;
        focusList.appendChild(li);
    });

    // 渲染承诺badges
    const badgesContainer = document.getElementById('explorePromiseBadges');
    badgesContainer.innerHTML = '';
    EXPLORE_PROMISE.badges.forEach(badge => {
        const span = document.createElement('span');
        span.className = 'promise-badge';
        span.textContent = badge;
        badgesContainer.appendChild(span);
    });

    // 渲染承诺备注
    document.getElementById('explorePromiseNote').textContent = EXPLORE_PROMISE.note;
}
```

---

## 五、交互规则

### 步骤切换逻辑

| 动作 | 行为 |
|-----|------|
| Step1 点击"继续" | 先调用 `renderStep2()` → 再 `showStep(2)` |
| Step2 点击"返回" | `showStep(1)`，Step1 保留选中状态（已有实现） |
| Step2 点击"继续预约沟通" | `showStep(3)` |

### 关键修改点：initializeNavigationButtons()

```javascript
// 修改继续按钮的事件处理
continueButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const nextStep = btn.getAttribute('data-next');
        if (nextStep) {
            // ★ 进入step2前必须先渲染
            if (nextStep === 'step2') {
                renderStep2();
            }
            const stepNumber = parseInt(nextStep.replace('step', ''));
            showStep(stepNumber);
        }
    });
});
```

### 状态校验

```javascript
// renderStep2() 开头已包含防御性校验
if (!flowState.selectedCourse || !painPoints || painPoints.length === 0) {
    showStep(1);
    return;
}
```

### 重渲染视觉过渡

在 CSS 中添加：
```css
.flow-step.fade-in {
    animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
    from { opacity: 0.6; }
    to { opacity: 1; }
}
```

### Step3 的 consult-mode

**当 `flowState.recommendedVersion === 'consult'` 时，Step3 也需要进入轻量化模式：**
- 隐藏"沟通重点"中的课程版本对比内容
- 只保留：预约方式选择 + 联系方式 + 承诺badges + 赠送资料提示
- 具体实现：在 `showStep(3)` 时检查 `flowState.recommendedVersion`，根据值切换 Step3 的显示内容（可用与 Step2 相同的 recommend-mode / explore-mode 双模式切换方案）

---

## 六、样式要求

### 推荐卡片
- 深色背景（与站点整体一致）
- 左侧金黄色边框（4px solid #D4A843）
- 推荐标签：金黄色背景 `#D4A843` + 深色文字，圆角 pill 样式

### 升级提示（.upgrade-hint）
- 半透明金黄色背景 `rgba(212, 168, 67, 0.1)`
- 左侧金黄色竖线 `border-left: 2px solid #D4A843`
- 字体 `0.9em`，不要过于醒目

### 交付物（.deliverable-item）
- `.deliverable-prefix`：加粗，金黄色 `#D4A843`
- `.deliverable-content`：正常颜色

### 依据提示（.step-basis）
- 浅灰色文字 `rgba(255,255,255,0.5)`
- 字号 `0.85em`
- 位于步骤标题上方

### 分支D 视觉差异
- `.explore-title`：更大字号（1.5em），居中
- `.promise-badge`：描边样式（border: 1px solid #D4A843），非实心，保持低压力感
- 主CTA按钮保持金黄色实心

### 衔接句
- 选1个痛点时：`solutionsIntro` 显示"这门课会帮您重点解决："
- 选2个痛点时：`solutionsIntro` 显示"针对您关注的两个问题，这门课会帮您重点解决："

---

## 七、需要删除的旧代码（全局搜索关键词清单）

请在以下文件中搜索并删除所有相关代码：

### interactive-flow.js 中删除：
- `selectedConsultation` — flowState 中的字段定义和所有赋值
- `initializeConsultationOptions` — 整个函数
- `initializeInteractiveFlow()` 中对 `initializeConsultationOptions()` 的调用

### index.html 中删除/替换：
- `#step2` 内部的 `.consultation-options` 整个区块
- `#step2` 内部的 `.consultation-grid` 及其子元素
- `#step2` 内部的 `.consultation-card` 及其子元素
- `#step2` 内部旧的 `.recommendation-content` / `.recommendation-left` / `.recommendation-right` 区块（用新模板替换）

### CSS 中删除（如有内联样式）：
- `.consultation-options` 相关样式
- `.consultation-grid` 相关样式
- `.consultation-card` 相关样式
- `.consultation-text` 相关样式

---

## 八、实现优先级

| 优先级 | 任务 |
|-------|------|
| **P0** | 定义所有数据对象（2.2~2.6） |
| **P0** | 实现 `renderStep2()` / `renderRecommendation()` / `renderExploreMode()` |
| **P0** | 替换 `#step2` HTML 结构（新模板） |
| **P0** | 修改 `initializeNavigationButtons()` 加入 renderStep2 调用 |
| **P0** | 删除旧 consultation 相关代码（全局搜索清理） |
| **P1** | 实现分支D的 explore-mode 完整布局 |
| **P1** | Step3 的 consult-mode 轻量化适配 |
| **P1** | 升级提示（💡）的条件渲染和样式 |
| **P2** | 淡入过渡动画（fade-in） |
| **P2** | 依据提示、交付物前缀等样式微调 |
| **P2** | 移动端响应式适配 |
