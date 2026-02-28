// ============================================
// form-submit.js — 表单提交与诊断流程追踪
// ============================================

// ========== 配置 ==========
const API_CONFIG = {
  // 部署后替换为真实的 API 网关地址
  bookingUrl:   'https://1300852218-g5nf0us9v4.ap-shanghai.tencentscf.com',
  diagnosisUrl: 'https://1300852218-6ugsblbl0w.ap-shanghai.tencentscf.com',
  // 开发模式：设为true时使用模拟响应，不实际调用API
  devMode: false,
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
  // 开发模式：返回模拟成功响应
  if (API_CONFIG.devMode) {
    console.log('[开发模式] 模拟提交成功:', { url, data });
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, message: '提交成功（开发模式）' });
      }, 500);
    });
  }

  // 生产模式：实际调用API
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
