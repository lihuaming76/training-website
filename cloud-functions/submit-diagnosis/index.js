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
