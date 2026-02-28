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
