/* Đội ngũ kỹ thuật · Kế hoạch bảo trì định kỳ, khóa tạm phòng, checklist kỹ thuật & đề xuất vật tư */

document.addEventListener('DOMContentLoaded', () => {
  const maintenancePlans = [
    {
      planId: 'BT-11-01',
      campus: 'Cơ sở 3',
      room: 'F.04.01',
      roomType: 'Phòng Lab máy tính',
      scheduleTime: '13:00 - 16:00 (24/11/2026)',
      locked: false,
      completed: false,
      checklist: [
        { item: 'Máy chiếu & Màn chiếu', passed: true },
        { item: 'Hệ thống âm thanh / Micro', passed: true },
        { item: 'Mạng LAN / Wifi nội bộ', passed: false },
        { item: 'Hệ thống điều hòa & Điện', passed: true },
        { item: 'Cấu hình 45 PC Lab', passed: true }
      ],
      materialRequest: ''
    }
  ];

  const planContainer = document.getElementById('ua3-plan-list');
  const materialForm = document.getElementById('ua3-material-form');

  function renderPlans() {
    if (!planContainer) return;
    planContainer.innerHTML = maintenancePlans.map((p) => `
      <div class="ua4-card" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div>
            <strong>${p.planId} - ${p.room} (${p.campus})</strong> · <small>${p.roomType}</small>
            <div style="font-size:12.5px;color:#555;">Khung giờ bảo trì (không trùng TKB): ${p.scheduleTime}</div>
          </div>
          <div>
            <span class="${p.completed ? 'badge-ok' : p.locked ? 'badge-warn' : 'badge-err'}">
              ${p.completed ? 'Hoạt động bình thường' : p.locked ? 'Tạm khóa để bảo trì' : 'Chưa khóa phòng'}
            </span>
          </div>
        </div>

        <ul style="list-style:none;margin-bottom:12px;">
          ${p.checklist.map((c, idx) => `
            <li style="padding:4px 0;font-size:13.5px;">
              <label>
                <input type="checkbox" data-plan="${p.planId}" data-idx="${idx}" ${c.passed ? 'checked' : ''} ${p.completed ? 'disabled' : ''}>
                ${c.item} — <strong>${c.passed ? 'Đạt' : 'Cần khắc phục'}</strong>
              </label>
            </li>
          `).join('')}
        </ul>

        <div style="display:flex;gap:10px;">
          ${!p.locked && !p.completed ? `<button class="btn-vlu" data-action="lock" data-id="${p.planId}">Kích hoạt Tạm khóa bảo trì (BR2)</button>` : ''}
          ${p.locked && !p.completed ? `<button class="btn-vlu" data-action="complete" data-id="${p.planId}">Hoàn thành & Mở khóa phòng</button>` : ''}
        </div>
      </div>
    `).join('');
  }

  if (planContainer) {
    planContainer.addEventListener('change', (e) => {
      const cb = e.target.closest('input[type="checkbox"][data-plan]');
      if (!cb) return;
      const plan = maintenancePlans.find((p) => p.planId === cb.dataset.plan);
      if (plan) {
        plan.checklist[Number(cb.dataset.idx)].passed = cb.checked;
        renderPlans();
      }
    });

    planContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const plan = maintenancePlans.find((p) => p.planId === btn.dataset.id);
      if (!plan) return;

      if (btn.dataset.action === 'lock') {
        // BR2: Chặn đặt phòng phát sinh trong khung giờ bảo trì
        plan.locked = true;
        alert(`Đã kích hoạt trạng thái "Tạm khóa để bảo trì" cho phòng ${plan.room}. Hệ thống đã chặn lượt đăng ký mượn phòng.`);
      } else if (btn.dataset.action === 'complete') {
        // BR3: Kiểm tra hoàn tất checklist trước khi mở khóa vận hành phòng
        const failedItems = plan.checklist.filter((c) => !c.passed).map((c) => c.item);
        if (failedItems.length > 0) {
          alert(`Chưa thể mở khóa phòng! Các hạng mục chưa đạt: ${failedItems.join(', ')}.`);
          return;
        }
        plan.locked = false;
        plan.completed = true;
        alert(`Đã hoàn thành bảo trì phòng ${plan.room} và mở lại trạng thái "Hoạt động bình thường".`);
      }
      renderPlans();
    });
  }

  // Tạo phiếu đề xuất cấp phát vật tư tiêu hao gửi Phòng CSVC
  if (materialForm) {
    materialForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const itemName = document.getElementById('ua3-material-name')?.value.trim();
      const qty = document.getElementById('ua3-material-qty')?.value;
      if (!itemName || !qty || Number(qty) <= 0) {
        alert('Vui lòng nhập tên vật tư và số lượng hợp lệ.');
        return;
      }
      alert(`Đã gửi phiếu đề xuất cấp phát vật tư: ${itemName} (SL: ${qty}) tới Phòng Cơ sở vật chất.`);
      materialForm.reset();
    });
  }

  renderPlans();
});
