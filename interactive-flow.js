// ===================================
// Interactive Flow - Core State Management
// ===================================

// Flow state object
const flowState = {
    currentStep: 1,
    selectedCourse: null,
    selectedPainPoints: [],
    recommendedVersion: null,
    isInteractiveActive: false
};

// ===================================
// Data Structures for Step 2
// ===================================

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

const RECOMMENDATION_MAP = {
    'direction':      { branch: 'A', version: '1day',    label: '推荐：1天高管工作坊（定方向）', reason: '一天看清方向，找准切入点。' },
    'implementation': { branch: 'B', version: '2day',    label: '推荐：2天跨部门实战推演', reason: '两天打通机制，带走可执行方案。' },
    'convince':       { branch: 'C', version: '2day',    label: '推荐：2天跨部门实战推演', reason: '两天产出经得起追问的汇报材料。' },
    'explore':        { branch: 'D', version: 'consult', label: null, reason: null }
};

const PAIN_POINT_CONTENT = {
    'A': {
        'alignment': { title: '统一高层认知坐标系', desc: '26个标杆案例 + 5维度成熟度评估，让技术、业务、财务用同一把尺子对话。' },
        'scenario': { title: '锁定最值得做的场景', desc: '"商业价值×实施难度"矩阵评估，当场筛出3-5个最高回报的优先切入点。' },
        'scale': { title: '定位规模化的真正断点', desc: '通过标杆案例复盘，帮您识别卡在"数据孤岛"还是"权责不清"，现场给出诊断方向。', upgrade: '规模化推进涉及组织机制设计，2天版有专门的RACI矩阵和跨部门协作模块，建议了解。' },
        'roi': { title: '建立ROI叙事框架', desc: '了解财务/业务/战略三种ROI叙事逻辑，为优先场景建立初步测算思路。' },
        'roadmap': { title: '拿到90天路线框架', desc: '现场产出分阶段路线图框架和第一周启动方向，理清轻重缓急。' },
        'team': { title: '识别能力短板与优先补齐方向', desc: '成熟度评估中的"人才储备"维度，帮您快速定位团队差距在哪。', upgrade: '团队分工与协作机制设计，2天版有完整的RACI矩阵和6个关键角色模块，建议了解。' }
    },
    'B': {
        'alignment': { title: '先统一认知，再推项目', desc: '第一天用26个标杆案例 + 5维度评估对齐高层认知，为落地方案建立共识基础。' },
        'scenario': { title: '选出场景并当场做成方案', desc: '优先级矩阵锁定Top场景，工作坊直接产出包含ROI测算的完整项目画布。' },
        'scale': { title: '打通规模化的组织瓶颈', desc: '第二天专门设计RACI责任矩阵、跨部门决策流程和协作机制，解决"部门墙打不通"的根源。' },
        'roi': { title: '产出可汇报的ROI方案', desc: 'ROI计算器详细测算 + 财务/业务/战略三种叙事方式，产出可直接用于立项汇报的材料。' },
        'roadmap': { title: '拿到可执行的90天计划', desc: '每个里程碑有验收标准、每个任务有责任人，第一周清单细化到每天做什么、产出什么。' },
        'team': { title: '明确谁来做、谁负责、谁配合', desc: 'RACI矩阵把6个关键角色的职责写死，配合激励机制设计，解决"没人愿意牵头"的问题。' }
    },
    'C': {
        'alignment': { title: '用"他山之石"打破内部僵局', desc: '引入26个标杆企业的真实ROI数据与落地路径——不是你在说服老板，是同行的成功案例在说服他们。' },
        'scenario': { title: '用评估框架替代拍脑袋', desc: '5维度评估 + 优先级矩阵，让决策层看到结构化的选择逻辑，而不是"我觉得应该做这个"。' },
        'scale': { title: '用机制设计回应"为什么这次能成"', desc: 'RACI矩阵 + 验收标准 + 跨部门协作机制，帮您证明这次有闭环、有人管、有标准。' },
        'roi': { title: '同一个项目，给不同决策者讲不同的数', desc: '财务ROI给CFO看回报率，业务ROI给VP看增长，战略ROI给CEO看竞争优势——三套叙事，一次做完。' },
        'roadmap': { title: '用路线图证明"已经想清楚了"', desc: '一份带验收标准和责任人的90天路线图，比任何承诺都有说服力。决策层要的是确定性。' },
        'team': { title: '用RACI矩阵回答"谁来干"', desc: '决策层批预算前一定会问这个问题。6个角色、每个任务的R/A/C/I写清楚，证明团队已经ready。' }
    },
    'D': {
        'alignment': { title: '高层分歧在哪', desc: '帮您判断高层分歧是认知层面还是机制层面，两者的解法完全不同。' },
        'scenario': { title: '候选场景初筛', desc: '快速梳理2-3个候选场景，初步判断哪个回报最高、最容易先做出成果。' },
        'scale': { title: '规模化卡在哪个环节', desc: '聊聊卡在哪个环节——数据打不通、部门不配合、还是验收标准不清，不同原因对应不同解法。' },
        'roi': { title: 'ROI测算思路', desc: '帮您理一下ROI测算思路，看是缺数据、缺方法、还是缺叙事角度。' },
        'roadmap': { title: '需要路线图还是先解决瓶颈', desc: '帮您判断是需要一个完整路线图，还是先解决某个具体瓶颈。' },
        'team': { title: '缺人、缺技能、还是缺机制', desc: '帮您评估是缺人、缺技能、还是缺机制——三种情况的优先动作完全不同。' }
    }
};

const DELIVERABLES = {
    'A': [
        { prefix: '一份认知地图：', content: 'AI成熟度评估结果（5维度评分 + 优先机会点）' },
        { prefix: '一个方向选择：', content: 'AI项目画布初稿（明确优先场景和价值方向）' },
        { prefix: '一个启动框架：', content: '90天路线图框架（阶段划分 + 关键里程碑）' }
    ],
    'B': [
        { prefix: '一套可汇报的方案：', content: '完整AI项目画布（含详细ROI测算 + 三种高管叙事）' },
        { prefix: '一张防扯皮的地图：', content: '详细90天路线图 + RACI跨部门责任矩阵 + 第一周清单' },
        { prefix: '一次抗压测试记录：', content: '经过高管视角极限模拟、交叉质询后的风险预演方案' }
    ],
    'C': [
        { prefix: '一套可汇报的方案：', content: '完整AI项目画布（含详细ROI测算 + 三种高管叙事）' },
        { prefix: '一张防扯皮的地图：', content: '详细90天路线图 + RACI跨部门责任矩阵 + 第一周清单' },
        { prefix: '一次抗压测试记录：', content: '经过高管视角极限模拟、交叉质询后的风险预演方案' }
    ],
    'D': []
};

const EXPLORE_PROMISE = {
    badges: ['绝无销售压力', '只提供专业判断', '提供《AI落地断点自检表》'],
    note: '如果您现阶段不需要启动外部工作坊，我们会直接告诉您。'
};

// ===================================
// CTA Bar Visibility Control
// ===================================

function showCtaBar() {
    const ctaBar = document.getElementById('step1CtaBar');
    if (ctaBar) {
        ctaBar.style.display = 'block';
    }
}

function hideCtaBar() {
    const ctaBar = document.getElementById('step1CtaBar');
    if (ctaBar) {
        ctaBar.style.display = 'none';
    }
}

function resetQuestionnaireState() {
    flowState.selectedCourse = null;
    flowState.selectedPainPoints = [];
    flowState.currentStep = 1;
    flowState.isInteractiveActive = false;

    // Clear UI selections
    document.querySelectorAll('.option-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelectorAll('.checkbox-item.selected').forEach(item => {
        item.classList.remove('selected');
    });

    // Hide CTA bar
    hideCtaBar();

    // Clear localStorage
    try {
        localStorage.removeItem('trainingFlowState');
    } catch (e) {
        console.error('Failed to clear localStorage:', e);
    }
}

// ===================================
// Step Navigation Functions
// ===================================

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.flow-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show target step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
        flowState.currentStep = stepNumber;

        // Update progress dots
        document.querySelectorAll('.progress-dot').forEach(dot => {
            const dotStep = parseInt(dot.getAttribute('data-step'));
            if (dotStep <= stepNumber) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Scroll to interactive section
        const interactiveSection = document.getElementById('interactive');
        if (interactiveSection) {
            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = interactiveSection.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }

        // Hide floating CTA when in interactive section
        const floatingCta = document.getElementById('floatingCta');
        if (floatingCta) {
            floatingCta.classList.remove('visible');
        }

        // Activate interactive mode and show CTA bar for Step 1
        if (stepNumber === 1) {
            flowState.isInteractiveActive = true;
            showCtaBar();
        } else if (stepNumber >= 2) {
            // Steps 2-4: keep interactive active but hide CTA (per product spec)
            hideCtaBar();
        }

        // Save state to localStorage
        saveFlowState();
    }
}

function goToNextStep() {
    if (flowState.currentStep < 4) {
        showStep(flowState.currentStep + 1);
    }
}

function goToPreviousStep() {
    if (flowState.currentStep > 1) {
        showStep(flowState.currentStep - 1);
    }
}

// ===================================
// State Persistence
// ===================================

function saveFlowState() {
    try {
        localStorage.setItem('trainingFlowState', JSON.stringify(flowState));
    } catch (e) {
        console.error('Failed to save flow state:', e);
    }
}

function loadFlowState() {
    try {
        const savedState = localStorage.getItem('trainingFlowState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            Object.assign(flowState, parsed);
            return true;
        }
    } catch (e) {
        console.error('Failed to load flow state:', e);
    }
    return false;
}

// ===================================
// Step 2: Dynamic Recommendation Rendering
// ===================================

function renderStep2() {
    const course = flowState.selectedCourse;
    const painPoints = flowState.selectedPainPoints;

    if (!course || !painPoints || painPoints.length === 0) {
        showStep(1);
        return;
    }

    const config = RECOMMENDATION_MAP[course];
    const branch = config.branch;

    flowState.recommendedVersion = config.version;
    saveFlowState();

    // Clear previous content
    const solutionsList = document.getElementById('solutionsList');
    const deliverablesList = document.getElementById('deliverablesList');
    const exploreFocusList = document.getElementById('exploreFocusList');

    if (solutionsList) solutionsList.innerHTML = '';
    if (deliverablesList) deliverablesList.innerHTML = '';
    if (exploreFocusList) exploreFocusList.innerHTML = '';

    // Set basis text
    const basisEl = document.getElementById('recommendBasis');
    if (basisEl) {
        const courseLabel = COURSE_LABEL[course];
        const painLabels = painPoints.map(p => PAINPOINT_LABEL[p]).join('、');
        basisEl.textContent = `基于您的选择：${courseLabel} + ${painLabels}`;
    }

    const recommendMode = document.getElementById('recommendMode');
    const exploreMode = document.getElementById('exploreMode');

    if (course === 'explore') {
        if (recommendMode) recommendMode.style.display = 'none';
        if (exploreMode) exploreMode.style.display = 'block';
        renderExploreMode(branch, painPoints);
    } else {
        if (recommendMode) recommendMode.style.display = 'block';
        if (exploreMode) exploreMode.style.display = 'none';
        renderRecommendation(config, branch, painPoints);
    }
}

function renderRecommendation(config, branch, painPoints) {
    const labelEl = document.getElementById('recommendLabel');
    const reasonEl = document.getElementById('recommendReason');
    if (labelEl) labelEl.textContent = config.label;
    if (reasonEl) reasonEl.textContent = config.reason;

    // Update diagnosisState with recommended version
    if (labelEl && window.diagnosisState) {
        window.diagnosisState.recommendedVersion = labelEl.textContent.trim();
    }

    const solutionsList = document.getElementById('solutionsList');
    if (solutionsList) {
        solutionsList.innerHTML = '';
        painPoints.forEach(point => {
            const item = PAIN_POINT_CONTENT[branch][point];
            if (!item) return;

            const div = document.createElement('div');
            div.className = 'solution-item';

            let html = `<h5 class="solution-title"><span class="icon">🎯</span>${item.title}</h5><p class="solution-desc">${item.desc}</p>`;

            if (item.upgrade) {
                html += `<div class="upgrade-hint"><span class="upgrade-icon">💡</span><p class="upgrade-text">${item.upgrade}</p></div>`;
            }

            div.innerHTML = html;
            solutionsList.appendChild(div);
        });
    }

    const deliverablesList = document.getElementById('deliverablesList');
    if (deliverablesList) {
        deliverablesList.innerHTML = '';
        const deliverables = DELIVERABLES[branch];
        deliverables.forEach(d => {
            const div = document.createElement('div');
            div.className = 'deliverable-item';
            div.innerHTML = `<span class="deliverable-check">✅</span><div><div class="deliverable-prefix">${d.prefix}</div><div class="deliverable-content">${d.content}</div></div>`;
            deliverablesList.appendChild(div);
        });
    }
}

function renderExploreMode(branch, painPoints) {
    const focusList = document.getElementById('exploreFocusList');
    if (focusList) {
        painPoints.forEach(point => {
            const item = PAIN_POINT_CONTENT[branch][point];
            if (!item) return;

            const li = document.createElement('li');
            li.className = 'explore-focus-item';
            li.innerHTML = `<strong>${item.title}：</strong><span>${item.desc}</span>`;
            focusList.appendChild(li);
        });
    }

    const badgesContainer = document.getElementById('explorePromiseBadges');
    if (badgesContainer) {
        badgesContainer.innerHTML = '';
        EXPLORE_PROMISE.badges.forEach(badge => {
            const span = document.createElement('span');
            span.className = 'promise-badge';
            span.textContent = badge;
            badgesContainer.appendChild(span);
        });
    }

    const noteEl = document.getElementById('explorePromiseNote');
    if (noteEl) noteEl.textContent = EXPLORE_PROMISE.note;
}

// ===================================
// Step 3: Dynamic Pain Point Rendering
// ===================================

function renderStep3() {
    const painPoints = flowState.selectedPainPoints;
    const course = flowState.selectedCourse;
    const el = document.getElementById('focusPainPointText');
    const basisEl = document.getElementById('step3Basis');

    // Update focus pain point text
    if (el) {
        if (!painPoints || painPoints.length === 0) {
            el.innerHTML = '围绕您企业当前最核心的落地瓶颈，给出初步判断和方向';
        } else {
            const painText = painPoints.map(p => `<span style="color: #E8C547; font-weight: 500;">「${PAINPOINT_LABEL[p]}」</span>`).join('和');
            el.innerHTML = `围绕${painText}，给出初步判断和方向`;
        }
    }

    // Update step basis
    if (basisEl && course && painPoints && painPoints.length > 0) {
        const courseLabel = {'direction': '看清方向', 'implementation': '推动落地', 'convince': '说服决策层', 'explore': '先聊聊'}[course] || '看清方向';
        const painText = painPoints.map(p => PAINPOINT_LABEL[p]).join('、');
        basisEl.textContent = `基于您的选择：${courseLabel} + ${painText}`;
    }
}

// ===================================
// Step 1: Course Selection
// ===================================

function initializeCourseSelection() {
    const courseOptions = document.querySelectorAll('#step1 .option-card');

    courseOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            courseOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            option.classList.add('selected');

            // Update state
            flowState.selectedCourse = option.getAttribute('data-value');

            // Update continue button
            updateStep1ContinueButton();

            // Save state
            saveFlowState();
        });
    });

    // Restore selection if exists
    if (flowState.selectedCourse) {
        const selectedOption = document.querySelector(`#step1 .option-card[data-value="${flowState.selectedCourse}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            updateStep1ContinueButton();
        }
    }
}

// ===================================
// Step 1: Pain Points Checkboxes
// ===================================

function initializePainPointCheckboxes() {
    const checkboxItems = document.querySelectorAll('#step1 .checkbox-item');
    const continueBtn = document.querySelector('#step1 .btn-continue');
    const MAX_SELECTIONS = 2;

    checkboxItems.forEach(item => {
        item.addEventListener('click', () => {
            const value = item.getAttribute('data-value');
            const isSelected = item.classList.contains('selected');

            if (isSelected) {
                // Deselect
                item.classList.remove('selected');
                flowState.selectedPainPoints = flowState.selectedPainPoints.filter(v => v !== value);
            } else {
                // Check if max selections reached
                if (flowState.selectedPainPoints.length >= MAX_SELECTIONS) {
                    return; // Don't allow more than 2 selections
                }
                // Select
                item.classList.add('selected');
                flowState.selectedPainPoints.push(value);
            }

            // Update continue button state
            updateStep1ContinueButton();
            saveFlowState();
        });
    });

    // Restore selections if exist
    if (flowState.selectedPainPoints && flowState.selectedPainPoints.length > 0) {
        flowState.selectedPainPoints.forEach(value => {
            const item = document.querySelector(`#step1 .checkbox-item[data-value="${value}"]`);
            if (item) {
                item.classList.add('selected');
            }
        });
    }
}

function updateStep1ContinueButton() {
    const continueBtn = document.getElementById('step1ContinueBtn');
    const statusEl = document.getElementById('step1Status');
    const nextStepHint = document.getElementById('nextStepHint');

    const has1A = !!flowState.selectedCourse;
    const has1B = flowState.selectedPainPoints.length > 0;

    // State machine: S0 (no 1A) / S1 (has 1A, no 1B) / S2 (has both)
    let state = 'S0';
    if (has1A && has1B) state = 'S2';
    else if (has1A) state = 'S1';

    if (continueBtn) {
        if (state === 'S0') {
            continueBtn.disabled = true;
            continueBtn.setAttribute('aria-disabled', 'true');
            continueBtn.textContent = '继续：补充关键问题（1/2）↓';
            continueBtn.setAttribute('data-action', 'scroll-to-1b');
        } else if (state === 'S1') {
            continueBtn.disabled = false;
            continueBtn.setAttribute('aria-disabled', 'false');
            continueBtn.textContent = '继续：补充关键问题（1/2）↓';
            continueBtn.setAttribute('data-action', 'scroll-to-1b');
        } else if (state === 'S2') {
            continueBtn.disabled = false;
            continueBtn.setAttribute('aria-disabled', 'false');
            continueBtn.textContent = '下一步（2/4）→';
            continueBtn.setAttribute('data-action', 'go-to-step2');
        }
    }

    if (statusEl) {
        if (state === 'S0') {
            statusEl.innerHTML = '<span class="status-text">请选择一个方向</span>';
        } else if (state === 'S1') {
            const courseLabel = COURSE_LABEL[flowState.selectedCourse];
            statusEl.innerHTML = `<span class="status-text">已选：${courseLabel}</span>`;
        } else if (state === 'S2') {
            const courseLabel = COURSE_LABEL[flowState.selectedCourse];
            const n = flowState.selectedPainPoints.length;
            statusEl.innerHTML = `<span class="status-text">已选：${courseLabel} · 已补充：${n}/2</span>`;
        }
    }

    if (nextStepHint) {
        nextStepHint.style.display = 'block';
        if (has1A) {
            nextStepHint.classList.add('active');
        } else {
            nextStepHint.classList.remove('active');
        }
    }

    // Update sub-step indicator
    const subStep1A = document.getElementById('subStep1A');
    const subStep1B = document.getElementById('subStep1B');

    if (subStep1A && subStep1B) {
        if (state === 'S0') {
            subStep1A.textContent = '1/2 选择方向 ☐';
            subStep1A.className = 'sub-step in-progress';
            subStep1B.textContent = '2/2 补充问题 ☐（最多选2项）';
            subStep1B.className = 'sub-step';
        } else if (state === 'S1') {
            subStep1A.textContent = '1/2 选择方向 ✅';
            subStep1A.className = 'sub-step completed';
            subStep1B.textContent = '2/2 补充问题 ☐（最多选2项）';
            subStep1B.className = 'sub-step in-progress';
        } else if (state === 'S2') {
            subStep1A.textContent = '1/2 选择方向 ✅';
            subStep1A.className = 'sub-step completed';
            subStep1B.textContent = '2/2 补充问题 ✅';
            subStep1B.className = 'sub-step completed';
        }
    }
}


// ===================================
// Scroll to Step 1B with Highlight
// ===================================

function scrollToStep1B() {
    const painPointsSection = document.getElementById('pain-points');
    if (!painPointsSection) return;

    // Calculate scroll position accounting for fixed header
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const targetPosition = painPointsSection.offsetTop - headerHeight - 20; // 20px extra padding

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });

    // Add highlight effect
    painPointsSection.classList.add('highlight-active');
    setTimeout(() => {
        painPointsSection.classList.remove('highlight-active');
    }, 1500);

    // Focus first checkbox for accessibility
    const firstCheckbox = painPointsSection.querySelector('.checkbox-item');
    if (firstCheckbox) {
        firstCheckbox.focus();
    }
}

// ===================================
// Step 3: Phone Booking Modal & Event Handlers
// ===================================

function initializeStep3Handlers() {
    // Phone booking button
    const bookPhoneBtn = document.getElementById('bookPhoneBtn');
    const modal = document.getElementById('phoneBookingModal');
    const modalCancel = document.getElementById('modalCancel');
    const modalSubmit = document.getElementById('modalSubmit');
    const step3CompleteBtn = document.getElementById('step3CompleteBtn');

    if (bookPhoneBtn && modal) {
        bookPhoneBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    if (modalCancel && modal) {
        modalCancel.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    if (modalSubmit && modal) {
        modalSubmit.addEventListener('click', () => {
            const name = document.getElementById('bookingName').value;
            const phone = document.getElementById('bookingPhone').value;
            const time = document.getElementById('bookingTime').value;

            if (!name || !phone || !time) {
                alert('请填写完整信息');
                return;
            }

            console.log('预约信息:', { name, phone, time });
            modal.style.display = 'none';
            alert('预约已提交，我们会尽快联系您');

            // Clear form
            document.getElementById('bookingName').value = '';
            document.getElementById('bookingPhone').value = '';
            document.getElementById('bookingTime').value = '';
        });
    }

    // Step 3 complete button
    if (step3CompleteBtn) {
        step3CompleteBtn.addEventListener('click', () => {
            showStep(4);
        });
    }

    // Copy WeChat ID button
    const copyBtn = document.querySelector('.copy-btn');
    const wechatId = document.getElementById('wechatIdCopy');

    if (copyBtn && wechatId) {
        copyBtn.addEventListener('click', () => {
            const text = wechatId.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✓';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
        });
    }
}

// ===================================
// Button Event Listeners
// ===================================

function initializeNavigationButtons() {
    // Step 1 continue button with state-based action
    const step1ContinueBtn = document.getElementById('step1ContinueBtn');
    if (step1ContinueBtn) {
        step1ContinueBtn.addEventListener('click', () => {
            const action = step1ContinueBtn.getAttribute('data-action');
            if (action === 'scroll-to-1b') {
                // Check if user is already near pain points section
                const painPointsSection = document.getElementById('pain-points');
                if (painPointsSection) {
                    const rect = painPointsSection.getBoundingClientRect();
                    const isNearPainPoints = rect.top < window.innerHeight && rect.bottom > 0;

                    // If already at pain points section and no selection, show reminder
                    if (isNearPainPoints && (!flowState.selectedPainPoints || flowState.selectedPainPoints.length === 0)) {
                        alert('请至少选择一个关键问题');
                        return;
                    }
                }
                scrollToStep1B();
            } else if (action === 'go-to-step2') {
                // Validate that at least one pain point is selected
                if (!flowState.selectedPainPoints || flowState.selectedPainPoints.length === 0) {
                    alert('请至少选择一个关键问题');
                    scrollToStep1B();
                    return;
                }

                // Update diagnosisState with selected pain points
                const selectedCards = document.querySelectorAll('#step1 .option-card.selected, #step1 .checkbox-item.selected');
                if (window.diagnosisState) {
                    window.diagnosisState.painPoints = Array.from(selectedCards).map(el => {
                        const label = el.querySelector('.checkbox-label, .option-title');
                        return label ? label.textContent.trim() : el.getAttribute('data-value');
                    });
                }

                showStep(2);
                setTimeout(() => renderStep2(), 50);
            }
        });
    }

    // Other continue buttons
    const continueButtons = document.querySelectorAll('.btn-continue:not(#step1ContinueBtn)');
    continueButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = btn.getAttribute('data-next');
            if (nextStep) {
                const stepNumber = parseInt(nextStep.replace('step', ''));
                showStep(stepNumber);

                // Render Step 2 content after step is visible
                if (nextStep === 'step2') {
                    setTimeout(() => renderStep2(), 50);
                }

                // Render Step 3 content after step is visible
                if (nextStep === 'step3') {
                    setTimeout(() => renderStep3(), 50);
                }
            }
        });
    });

    // Back buttons
    const backButtons = document.querySelectorAll('.btn-back, .btn-back-inline');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = btn.getAttribute('data-prev');
            if (prevStep) {
                const stepNumber = parseInt(prevStep.replace('step', ''));
                showStep(stepNumber);
            }
        });
    });
}

// ===================================
// Navigation Link Handlers
// ===================================

function initializeNavigationLinks() {
    // Handle all links to #interactive (nav links, buttons, floating CTA, etc.)
    const interactiveLinks = document.querySelectorAll('a[href="#interactive"]');
    interactiveLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Entering interactive section - activate mode and show CTA
            flowState.isInteractiveActive = true;
            showStep(1);
        });
    });

    // Handle all nav links with unified scroll behavior
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if going to interactive (already handled above)
            if (href === '#interactive') {
                return;
            }

            // Handle all other anchor links
            if (href && href.startsWith('#')) {
                e.preventDefault();

                // Reset state if leaving interactive section
                if (href !== '#pain-points') {
                    resetQuestionnaireState();
                }

                // Scroll to target section
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const header = document.getElementById('header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = targetSection.offsetTop - headerHeight - 30;

                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });

                    // Update URL hash after scroll starts
                    setTimeout(() => {
                        window.location.hash = href;
                    }, 100);
                }
            }
        });
    });
}

// ===================================
// Main Initialization
// ===================================

function initializeInteractiveFlow() {
    // Load saved state if exists
    loadFlowState();

    // Initialize all step components
    initializeCourseSelection();
    initializePainPointCheckboxes();
    initializeStep3Handlers();
    initializeNavigationButtons();
    initializeNavigationLinks();

    // Handle cases scroll link
    const casesScrollLink = document.getElementById('casesScrollLink');
    if (casesScrollLink) {
        casesScrollLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('cases-content');
            if (target) {
                const header = document.getElementById('header');
                const headerHeight = header ? header.offsetHeight : 80;
                const rect = target.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = rect.top + scrollTop - headerHeight - 50;
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            }
        });
    }

    // Check if we're in interactive section on page load
    const hash = window.location.hash;
    if (hash === '#interactive') {
        // We're in interactive section - show the appropriate step
        flowState.isInteractiveActive = true;
        if (flowState.currentStep === 1) {
            showStep(1);
        } else if (flowState.currentStep > 1) {
            showStep(flowState.currentStep);
        }
    } else {
        // Not in interactive section - hide CTA
        hideCtaBar();
    }

    console.log('Interactive flow initialized successfully!');
}

// ===================================
// Initialize on DOM Load
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initializeInteractiveFlow();
});

