# 任务：接入腾讯云云函数（SCF）作为表单后台

## 背景

这是 Pallas Studio 的培训官网（单页面静态站），计划部署在**腾讯云静态网站托管**上。目前所有表单提交和用户互动数据没有任何后台处理。需要用**腾讯云云函数（SCF）**实现轻量后台，完成数据收集、持久化存储和实时通知。

## 整体架构

```
用户浏览器（静态页面）
    │
    │  POST /api/submit-booking     （电话预约）
    │  POST /api/submit-diagnosis   （微信扫码诊断记录）
    │
    ▼
腾讯云云函数（SCF）
    │
    ├──→ 参数验证
    ├──→ 写入腾讯云 COS（JSON 文件持久化存储）
    ├──→ 推送通知到企业微信机器人 Webhook
    └──→ 返回结果给前端
```

选择 COS（对象存储）而非数据库的原因：提交量极小（每天可能就几条），JSON 文件足够，不需要数据库的复杂度和成本。后续如果量大了，再迁移到云数据库也很简单。

---

## 文件结构

```
项目根目录/
├── index.html                    # 主页面（已有）
├── styles.css                    # 样式（已有）
├── script.js                     # 通用交互（已有）
├── interactive-flow.js           # 互动诊断流程（已有）
├── form-submit.js                # 【新建】前端表单提交逻辑
│
└── cloud-functions/              # 【新建】云函数目录
    ├── submit-booking/           # 云函数1：电话预约
    │   ├── index.js
    │   └── package.json
    └── submit-diagnosis/         # 云函数2：微信诊断记录
        ├── index.js
        └── package.json
```

---

## 第一部分：云函数代码

### 云函数1：submit-booking（电话预约）

`cloud-functions/submit-booking/package.json`：

```json
{
  "name": "submit-booking",
  "version": "1.0.0",
  "dependencies": {
    "cos-nodejs-sdk-v5": "^2.12.0"
  }
}
```

`cloud-functions/submit-booking/index.js`：

```javascript
'use strict';

const COS = require('cos-nodejs-sdk-v5');
const https = require('https');

// ============================================
// 配置项（通过环境变量传入，部署时在控制台设置）
// ============================================
const CONFIG = {
  cos: {
    SecretId:  process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
    Bucket:    process.env.COS_BUCKET,      // 如 pallas-form-data-1258888888
    Region:    process.env.COS_REGION || 'ap-shanghai',
  },
  wechatWebhook: process.env.WECHAT_WEBHOOK,
};

// ============================================
// 主函数
// ============================================
exports.main_handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',    // 部署后改为你的域名
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    let body;
    try { body = JSON.parse(event.body); }
    catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: '请求格式错误' }) }; }

    const { name, phone, timeSlot, painPoints, recommendedVersion, entrySource } = body;

    if (!name || !name.trim()) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: '请输入姓名' }) };
    }
    if (!phone || !/^1\d{10}$/.test(phone)) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: '请输入正确的手机号' }) };
    }
    if (!timeSlot) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: '请选择沟通时段' }) };
    }

    const timestamp = new Date().toISOString();
    const record = {
      type: '电话预约',
      name: name.trim(),
      phone: phone.trim(),
      timeSlot,
      painPoints: painPoints || '',
      recommendedVersion: recommendedVersion || '',
      entrySource: entrySource || '',
      timestamp,
      date: timestamp.split('T')[0],
    };

    await saveToCOS(record, 'bookings');
    await sendWechatNotification(record);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: '预约成功' }) };
  } catch (error) {
    console.error('处理失败:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: '服务器错误，请稍后重试' }) };
  }
};

async function saveToCOS(record, folder) {
  const cos = new COS({ SecretId: CONFIG.cos.SecretId, SecretKey: CONFIG.cos.SecretKey });
  const fileName = `${folder}/${record.date}/${Date.now()}_${record.name || 'anonymous'}.json`;
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: CONFIG.cos.Bucket, Region: CONFIG.cos.Region,
      Key: fileName, Body: JSON.stringify(record, null, 2), ContentType: 'application/json',
    }, (err, data) => { if (err) { console.error('COS写入失败:', err); reject(err); } else { console.log('COS写入成功:', fileName); resolve(data); } });
  });
}

async function sendWechatNotification(record) {
  const timeSlotMap = {
    'weekday-morning': '工作日上午 9:00-12:00',
    'weekday-afternoon': '工作日下午 14:00-18:00',
    'weekend': '周末（灵活安排）',
  };
  const message = {
    msgtype: 'markdown',
    markdown: {
      content: [
        `## 📞 新的电话预约`,
        `**姓名**：${record.name}`,
        `**手机**：${record.phone}`,
        `**期望时段**：${timeSlotMap[record.timeSlot] || record.timeSlot}`,
        `**痛点标签**：${record.painPoints || '未选择'}`,
        `**推荐版本**：${record.recommendedVersion || '未确定'}`,
        `**入口来源**：${record.entrySource || '未知'}`,
        `**提交时间**：${record.timestamp}`,
      ].join('\n'),
    },
  };
  return new Promise((resolve) => {
    const url = new URL(CONFIG.wechatWebhook);
    const postData = JSON.stringify(message);
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
    }, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { console.log('通知结果:', d); resolve(d); }); });
    req.on('error', (err) => { console.error('通知失败:', err); resolve(null); });
    req.write(postData); req.end();
  });
}
```

---

### 云函数2：submit-diagnosis（微信扫码诊断记录）

`cloud-functions/submit-diagnosis/package.json`：

```json
{
  "name": "submit-diagnosis",
  "version": "1.0.0",
  "dependencies": {
    "cos-nodejs-sdk-v5": "^2.12.0"
  }
}
```

`cloud-functions/submit-diagnosis/index.js`：

```javascript
'use strict';

const COS = require('cos-nodejs-sdk-v5');
const https = require('https');

const CONFIG = {
  cos: {
    SecretId:  process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
    Bucket:    process.env.COS_BUCKET,
    Region:    process.env.COS_REGION || 'ap-shanghai',
  },
  wechatWebhook: process.env.WECHAT_WEBHOOK,
};

exports.main_handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    let body;
    try { body = JSON.parse(event.body); }
    catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: '请求格式错误' }) }; }

    const { contactMethod, painPoints, recommendedVersion, entrySource } = body;
    const timestamp = new Date().toISOString();
    const record = {
      type: '微信扫码',
      contactMethod: contactMethod || '微信扫码',
      painPoints: painPoints || '',
      recommendedVersion: recommendedVersion || '',
      entrySource: entrySource || '',
      timestamp,
      date: timestamp.split('T')[0],
    };

    await saveToCOS(record, 'diagnosis');
    await sendWechatNotification(record);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: '记录成功' }) };
  } catch (error) {
    console.error('处理失败:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: '服务器错误' }) };
  }
};

async function saveToCOS(record, folder) {
  const cos = new COS({ SecretId: CONFIG.cos.SecretId, SecretKey: CONFIG.cos.SecretKey });
  const fileName = `${folder}/${record.date}/${Date.now()}_${record.contactMethod}.json`;
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: CONFIG.cos.Bucket, Region: CONFIG.cos.Region,
      Key: fileName, Body: JSON.stringify(record, null, 2), ContentType: 'application/json',
    }, (err, data) => { if (err) reject(err); else resolve(data); });
  });
}

async function sendWechatNotification(record) {
  const message = {
    msgtype: 'markdown',
    markdown: {
      content: [
        `## 🔍 新的微信诊断记录`,
        `**联系方式**：微信扫码（请留意新好友申请）`,
        `**痛点标签**：${record.painPoints || '未选择'}`,
        `**推荐版本**：${record.recommendedVersion || '未确定'}`,
        `**入口来源**：${record.entrySource || '未知'}`,
        `**提交时间**：${record.timestamp}`,
        `> 用户已扫码，请留意微信好友申请并结合以上信息沟通`,
      ].join('\n'),
    },
  };
  return new Promise((resolve) => {
    const url = new URL(CONFIG.wechatWebhook);
    const postData = JSON.stringify(message);
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
    }, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); });
    req.on('error', () => resolve(null));
    req.write(postData); req.end();
  });
}
```

---

## 第二部分：前端代码

### 新建 `form-submit.js`

```javascript
// ============================================
// form-submit.js — 表单提交与诊断流程追踪
// ============================================

// ========== 配置 ==========
const API_CONFIG = {
  // 部署后替换为真实的 API 网关地址
  bookingUrl:   'REPLACE_WITH_YOUR_API_GATEWAY_URL/submit-booking',
  diagnosisUrl: 'REPLACE_WITH_YOUR_API_GATEWAY_URL/submit-diagnosis',
};

// ========== 诊断流程状态追踪 ==========
const diagnosisState = {
  painPoints: [],
  recommendedVersion: '',
  entrySource: '',
};
window.diagnosisState = diagnosisState;

// ========== 入口来源追踪 ==========
document.addEventListener('click', function(e) {
  const trigger = e.target.closest('[data-entry-source]');
  if (trigger) {
    diagnosisState.entrySource = trigger.getAttribute('data-entry-source');
  }
});

// ========== 通用提交函数 ==========
async function submitForm(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || '提交失败');
    return { success: true, message: result.message };
  } catch (error) {
    console.error('[提交失败]', error);
    return { success: false, message: error.message || '网络错误，请稍后重试' };
  }
}

// ========== 收集点 A：电话预约 ==========
document.addEventListener('DOMContentLoaded', function() {
  const submitBtn = document.getElementById('modalSubmit');
  if (!submitBtn) return;

  const newBtn = submitBtn.cloneNode(true);
  submitBtn.parentNode.replaceChild(newBtn, submitBtn);

  newBtn.addEventListener('click', async function() {
    const name     = document.getElementById('bookingName').value.trim();
    const phone    = document.getElementById('bookingPhone').value.trim();
    const timeSlot = document.getElementById('bookingTime').value;

    if (!name)                               { alert('请输入姓名'); return; }
    if (!phone || !/^1\d{10}$/.test(phone))  { alert('请输入正确的11位手机号'); return; }
    if (!timeSlot)                           { alert('请选择期望沟通时段'); return; }

    this.disabled = true;
    const originalText = this.textContent;
    this.textContent = '提交中...';

    const result = await submitForm(API_CONFIG.bookingUrl, {
      name, phone, timeSlot,
      painPoints: diagnosisState.painPoints.join(', '),
      recommendedVersion: diagnosisState.recommendedVersion,
      entrySource: diagnosisState.entrySource,
    });

    if (result.success) {
      const modalContent = document.querySelector('#phoneBookingModal .modal-content');
      if (modalContent) {
        modalContent.innerHTML = `
          <div style="text-align:center; padding:40px 20px;">
            <div style="font-size:48px; margin-bottom:16px;">✅</div>
            <h4 style="color:#0F172A; margin-bottom:8px;">预约成功</h4>
            <p style="color:#64748B; font-size:14px;">我们将在24小时内联系您</p>
            <p style="color:#94A3B8; font-size:12px;">如需紧急沟通，可直接扫描微信二维码</p>
            <button class="btn btn-gold" onclick="document.getElementById('phoneBookingModal').style.display='none'"
              style="margin-top:24px; padding:10px 32px; border-radius:20px; border:none; cursor:pointer; font-weight:600;">关闭</button>
          </div>`;
      }
    } else {
      alert('提交失败：' + result.message + '\n\n您也可以直接扫描微信二维码联系我们。');
      this.disabled = false;
      this.textContent = originalText;
    }
  });
});

// ========== 收集点 B：微信扫码完成（静默提交） ==========
document.addEventListener('DOMContentLoaded', function() {
  const completeBtn = document.getElementById('step3CompleteBtn');
  if (!completeBtn) return;

  completeBtn.addEventListener('click', function() {
    submitForm(API_CONFIG.diagnosisUrl, {
      contactMethod: '微信扫码',
      painPoints: diagnosisState.painPoints.join(', '),
      recommendedVersion: diagnosisState.recommendedVersion,
      entrySource: diagnosisState.entrySource,
    }).catch(err => console.warn('[诊断记录] 静默提交失败:', err));
  }, true);
});
```

---

## 第三部分：HTML 修改

### 3A. 引入 form-submit.js

在 `index.html` 的 `</body>` 之前，`interactive-flow.js` 之后添加：

```html
<script src="form-submit.js"></script>
```

加载顺序：`script.js` → `interactive-flow.js` → `form-submit.js`

### 3B. 给所有 CTA 按钮添加 data-entry-source

| 搜索关键词 | 添加属性 |
|---|---|
| 导航栏 `nav-cta` 指向 `#interactive` | `data-entry-source="导航栏"` |
| 右下角浮动CTA | `data-entry-source="浮动按钮"` |
| 落地定位模块底部 `#interactive` 按钮 | `data-entry-source="落地定位模块"` |
| `申请 1天版`（约第 3619 行） | `data-entry-source="申请1天版"` |
| `申请 2天版`（约第 3652 行） | `data-entry-source="申请2天版"` |
| `不确定选哪个` 链接 | `data-entry-source="版本对比表"` |
| `instructor-cta` 讲师按钮 | `data-entry-source="讲师模块"` |
| 6处 `立即预约工作坊` | `data-entry-source="预览弹窗"` |
| `联系我们` 脱敏声明 | `data-entry-source="脱敏声明"` |

### 3C. 在 interactive-flow.js 中更新 diagnosisState

**Step 1 完成时**（进入 Step 2 的逻辑中追加）：

```javascript
const selectedCards = document.querySelectorAll('#step1 .option-card.selected, #step1 .checkbox-item.selected');
window.diagnosisState.painPoints = Array.from(selectedCards).map(el => {
  const label = el.querySelector('.checkbox-label, .option-title');
  return label ? label.textContent.trim() : el.getAttribute('data-value');
});
```

**Step 2 展示推荐结果后追加**：

```javascript
const recommendLabel = document.getElementById('recommendLabel');
if (recommendLabel) {
  window.diagnosisState.recommendedVersion = recommendLabel.textContent.trim();
}
```

---

## 第四部分：部署指南（站长操作）

### 步骤 1：创建 COS 存储桶

1. 进入 COS 控制台 https://console.cloud.tencent.com/cos
2. 创建存储桶：名称 `pallas-form-data`，地域 `ap-shanghai`，访问权限 **私有读写**
3. 记下完整桶名（如 `pallas-form-data-1258888888`）

### 步骤 2：获取 API 密钥

1. 进入 API 密钥管理 https://console.cloud.tencent.com/cam/capi
2. 记下 `SecretId` 和 `SecretKey`
3. 建议创建子用户只授权 COS 写入权限

### 步骤 3：创建企业微信机器人

1. 企业微信 → 群设置 → 群机器人 → 添加
2. 复制 Webhook 地址

替代方案：Server酱（推个人微信）/ 飞书机器人 / 邮件

### 步骤 4：创建云函数

1. 进入云函数控制台 https://console.cloud.tencent.com/scf
2. 创建两个函数（submit-booking 和 submit-diagnosis），Node.js 16，64MB 内存，10秒超时
3. 设置环境变量：COS_SECRET_ID / COS_SECRET_KEY / COS_BUCKET / COS_REGION / WECHAT_WEBHOOK

### 步骤 5：配置 API 网关

1. 进入 API 网关控制台 https://console.cloud.tencent.com/apigateway
2. 创建服务，绑定 POST /submit-booking 和 POST /submit-diagnosis
3. 发布，获得 API 地址，填入 form-submit.js

### 步骤 6：测试

1. 电话预约 → 检查企业微信通知 + COS bookings/ 目录
2. 微信扫码 → 检查企业微信通知 + COS diagnosis/ 目录

### 费用

云函数免费 40万次/月、COS 免费 50GB、API 网关免费 100万次/月。实际月费 **¥0**。

---

## 注意事项

1. SecretId/SecretKey 只存在云函数环境变量中，绝不出现在前端代码里
2. 部署后把 CORS 的 `*` 改为实际域名
3. interactive-flow.js 修改时不要影响已有步骤跳转逻辑
4. 通知失败不影响主流程，数据已存入 COS
5. COS 中 JSON 文件可批量下载，后续可加汇总云函数导出 Excel
