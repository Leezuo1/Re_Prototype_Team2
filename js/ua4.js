/* js/ua4.js — Nghiệp vụ Hồ sơ kỹ thuật & Giám sát thiết bị (UA4 - Đội ngũ Kỹ thuật) */

Object.assign(TECH_ICONS, {
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  transfer: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>'
});

/* ===== 1. Dữ liệu danh mục & lý lịch kỹ thuật thiết bị (F88, F89) ===== */
const CAMPUS_ROOMS = [
  { room: 'A.04-02', building: 'Cơ sở chính – Tòa A' },
  { room: 'A.04-05', building: 'Cơ sở chính – Tòa A' },
  { room: 'A.02-08', building: 'Cơ sở chính – Tòa A' },
  { room: 'B.02-05', building: 'Cơ sở chính – Tòa B' },
  { room: 'B.03-01', building: 'Cơ sở chính – Tòa B' },
  { room: 'Lab CNTT 01', building: 'Khu Lab Công nghệ' },
  { room: 'Lab CNTT 02', building: 'Khu Lab Công nghệ' }
];

const EQUIPMENT_ASSETS = [
  {
    code: 'VLU-MC-102',
    name: 'Máy chiếu Epson EB-X51',
    specs: '3800 ANSI Lumens · Độ phân giải XGA · Cổng HDMI/VGA',
    room: 'A.04-02',
    building: 'Cơ sở chính – Tòa A',
    warrantyEnd: '2027-12-31',
    status: 'ready', // ready | busy | maint
    note: 'Hoạt động ổn định, bóng đèn còn 85% tuổi thọ',
    history: [
      { date: '10/09/2026', type: 'Bảo trì định kỳ', detail: 'Vệ sinh lưới lọc bụi và căn chỉnh khung hình', tech: 'Nguyễn Dương Quốc Bảo' },
      { date: '14/04/2026', type: 'Sửa chữa sự cố', detail: 'Thay cáp tín hiệu HDMI âm tường', tech: 'Nguyễn Dương Quốc Bảo' }
    ]
  },
  {
    code: 'VLU-AT-209',
    name: 'Bộ Micro không dây Shure BLX288',
    specs: 'Băng tần UHF · 2 tay micro cầm tay · Đầu thu kênh đôi',
    room: 'B.02-05',
    building: 'Cơ sở chính – Tòa B',
    warrantyEnd: '2026-08-15',
    status: 'maint',
    note: 'Đang kiểm tra mạch thu sóng kênh A',
    history: [
      { date: '21/11/2026', type: 'Tiếp nhận sự cố', detail: 'Mất sóng liên tục ở micro số 1 (#SC-203)', tech: 'Nguyễn Dương Quốc Bảo' },
      { date: '22/08/2026', type: 'Thay linh kiện', detail: 'Thay đầu chụp lưới và khay pin mới', tech: 'Nguyễn Dương Quốc Bảo' }
    ]
  },
  {
    code: 'VLU-NW-014',
    name: 'Switch mạng Cisco Catalyst 2960',
    specs: '24 cổng Gigabit Ethernet · 2 cổng Uplink SFP',
    room: 'Lab CNTT 02',
    building: 'Khu Lab Công nghệ',
    warrantyEnd: '2028-05-20',
    status: 'ready',
    note: 'Lắp cố định trong tủ rack kỹ thuật phòng Lab',
    history: [
      { date: '05/05/2026', type: 'Bảo trì định kỳ', detail: 'Kiểm tra thông mạch 24 port RJ45 và nguồn dự phòng', tech: 'Nguyễn Dương Quốc Bảo' }
    ]
  },
  {
    code: 'VLU-TV-088',
    name: 'Màn hình tương tác thông minh 75"',
    specs: '4K UHD · Cảm ứng đa điểm 20 chạm · Kính cường lực',
    room: 'A.02-08',
    building: 'Cơ sở chính – Tòa A',
    warrantyEnd: '2027-06-30',
    status: 'busy',
    note: 'Đã hiệu chỉnh lại tọa độ cảm ứng góc phải',
    history: [
      { date: '21/11/2026', type: 'Sửa chữa sự cố', detail: 'Cân chỉnh lại điểm chạm và cập nhật driver (#SC-201)', tech: 'Nguyễn Dương Quốc Bảo' }
    ]
  },
  {
    code: 'VLU-PC-310',
    name: 'Cụm máy tính thực hành Lab (40 máy)',
    specs: 'Core i7-13700 · RAM 16GB · SSD 512GB NVMe',
    room: 'Lab CNTT 01',
    building: 'Khu Lab Công nghệ',
    warrantyEnd: '2027-09-10',
    status: 'ready',
    note: 'Đã cài đặt môi trường thực hành học kỳ 1 (2026–2027)',
    history: [
      { date: '01/09/2026', type: 'Bảo trì định kỳ', detail: 'Kiểm tra nhiệt độ CPU và cập nhật image hệ điều hành', tech: 'Nguyễn Dương Quốc Bảo' }
    ]
  }
];

const STATUS_META = {
  ready: { label: 'Sẵn sàng', cls: 'status-ready' },
  busy: { label: 'Đang mượn', cls: 'status-busy' },
  maint: { label: 'Đang bảo trì / Hỏng', cls: 'status-maint' }
};

let ua4TrapCloser = null;

const escStr = (val) =>
  String(val ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtWarranty = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const getAsset = (code) => EQUIPMENT_ASSETS.find((item) => item.code === code);

/* ===== 2. Cập nhật thẻ thống kê & Bảng danh mục thiết bị (F88) ===== */
function renderAssetStats() {
  const total = EQUIPMENT_ASSETS.length;
  const ready = EQUIPMENT_ASSETS.filter((a) => a.status === 'ready').length;
  const maint = EQUIPMENT_ASSETS.filter((a) => a.status === 'maint').length;
  const rate = total ? Math.round(((total - maint) / total) * 100) : 100;

  const setTxt = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setTxt('statTotal', total);
  setTxt('statReady', ready);
  setTxt('statMaint', maint);
  setTxt('statRate', `${rate}%`);
}

function renderAssetTable() {
  renderAssetStats();

  const keyword = (document.getElementById('qAsset')?.value || '').trim().toLowerCase();
  const building = document.getElementById('qBuilding')?.value || '';
  const status = document.getElementById('qStatus')?.value || '';

  const filtered = EQUIPMENT_ASSETS
    .filter((a) => !building || a.building === building)
    .filter((a) => !status || a.status === status)
    .filter((a) => {
      if (!keyword) return true;
      return `${a.code} ${a.name} ${a.specs} ${a.room} ${a.building}`.toLowerCase().includes(keyword);
    });

  const countEl = document.getElementById('assetCount');
  if (countEl) countEl.textContent = `Hiển thị ${filtered.length} / ${EQUIPMENT_ASSETS.length} thiết bị`;

  const tbody = document.getElementById('assetTableBody');
  if (!tbody) return;

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:28px; color:#6b7280;">
          Không tìm thấy thiết bị phù hợp với điều kiện lọc hiện tại.
        </td>
      </tr>`;
    return;
  }

  // BR1: Chỉ cung cấp thao tác Lịch sử, Cập nhật thông số và Điều chuyển — không có nút xóa tài sản
  tbody.innerHTML = filtered
    .map((a) => {
      const st = STATUS_META[a.status] || STATUS_META.ready;
      return `
        <tr>
          <td><strong>${escStr(a.code)}</strong></td>
          <td>
            <div style="font-weight:600;">${escStr(a.name)}</div>
            <small style="color:#6b7280;">${escStr(a.specs)}</small>
          </td>
          <td>
            <div><strong>${escStr(a.room)}</strong></div>
            <small style="color:#6b7280;">${escStr(a.building)}</small>
          </td>
          <td>${fmtWarranty(a.warrantyEnd)}</td>
          <td><span class="status-pill ${st.cls}">${st.label}</span></td>
          <td>
            <div class="action-group">
              <button type="button" class="btn btn-outline btn-sm" data-history="${a.code}">Lịch sử</button>
              <button type="button" class="btn btn-outline btn-sm" data-edit="${a.code}">Cập nhật</button>
              <button type="button" class="btn btn-red btn-sm" data-move="${a.code}">Điều chuyển</button>
            </div>
          </td>
        </tr>`;
    })
    .join('');
}

/* ===== 3. Khung Modal dùng chung trong UA4 ===== */
function showUa4Modal(innerHtml) {
  const root = document.getElementById('modalRoot');
  if (!root) return null;

  root.innerHTML = `
    <div class="ua4-modal open" role="dialog" aria-modal="true" aria-labelledby="ua4DlgTitle">
      <div class="modal-box">
        ${innerHtml}
      </div>
    </div>`;

  const modalWrap = root.querySelector('.ua4-modal');
  const box = root.querySelector('.modal-box');

  modalWrap.addEventListener('mousedown', (e) => {
    if (e.target === modalWrap) closeUa4Modal();
  });
  root.querySelectorAll('[data-close-ua4]').forEach((btn) => {
    btn.addEventListener('click', closeUa4Modal);
  });

  if (typeof bindDialogFocus === 'function') {
    ua4TrapCloser = bindDialogFocus(box, closeUa4Modal);
  }
  return box;
}

function closeUa4Modal() {
  if (typeof ua4TrapCloser === 'function') {
    ua4TrapCloser();
    ua4TrapCloser = null;
  }
  const root = document.getElementById('modalRoot');
  if (root) root.innerHTML = '';
}

/* ===== 4. Xem lý lịch & lịch sử bảo trì / luân chuyển (F88) ===== */
function openHistoryModal(code) {
  const asset = getAsset(code);
  if (!asset) return;

  const logsHtml = asset.history.length
    ? asset.history
        .map(
          (h) => `
        <div style="padding:10px 12px; border:1px solid #f3d1d3; border-radius:8px; margin-bottom:8px; background:#fffafa;">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
            <strong style="color:#d71920;">${escStr(h.type)}</strong>
            <span style="color:#6b7280;">${escStr(h.date)}</span>
          </div>
          <div style="font-size:13px; color:#1f2937;">${escStr(h.detail)}</div>
          <small style="color:#6b7280;">Thực hiện: ${escStr(h.tech)}</small>
        </div>`
        )
        .join('')
    : '<p style="font-size:13px; color:#6b7280;">Chưa có lịch sử bảo trì hoặc điều chuyển.</p>';

  showUa4Modal(`
    <h3 id="ua4DlgTitle">Lý lịch kỹ thuật · ${escStr(asset.code)}</h3>
    <p style="margin:0 0 12px; font-size:13px; color:#4b5563;">
      <b>${escStr(asset.name)}</b> · Vị trí hiện tại: <b>${escStr(asset.room)}</b> (${escStr(asset.building)})
    </p>
    <div style="max-height:280px; overflow-y:auto; margin-bottom:12px;">
      ${logsHtml}
    </div>
    <div class="modal-foot">
      <button type="button" class="btn btn-red" data-close-ua4>Đóng</button>
    </div>
  `);
}

/* ===== 5. Cập nhật thông số kỹ thuật & trạng thái thiết bị (F89, BR1) ===== */
function openEditAssetModal(code) {
  const asset = getAsset(code);
  if (!asset) return;

  const box = showUa4Modal(`
    <h3 id="ua4DlgTitle">Cập nhật hồ sơ kỹ thuật · ${escStr(asset.code)}</h3>
    <div class="form-row">
      <label for="edSpecs">Thông số cấu hình kỹ thuật *</label>
      <input type="text" id="edSpecs" class="ua4-input" value="${escStr(asset.specs)}">
    </div>
    <div class="form-row">
      <label for="edWarranty">Hạn bảo hành *</label>
      <input type="date" id="edWarranty" class="ua4-input" value="${escStr(asset.warrantyEnd)}">
    </div>
    <div class="form-row">
      <label for="edStatus">Trạng thái vận hành *</label>
      <select id="edStatus" class="ua4-select">
        <option value="ready" ${asset.status === 'ready' ? 'selected' : ''}>Sẵn sàng hoạt động</option>
        <option value="busy" ${asset.status === 'busy' ? 'selected' : ''}>Đang được mượn</option>
        <option value="maint" ${asset.status === 'maint' ? 'selected' : ''}>Đang bảo trì / Hỏng</option>
      </select>
    </div>
    <div class="form-row">
      <label for="edNote">Ghi chú kỹ thuật</label>
      <input type="text" id="edNote" class="ua4-input" value="${escStr(asset.note)}" placeholder="VD: Đã vệ sinh lọc bụi, thay bóng đèn mới">
    </div>
    <p style="margin:6px 0 0; font-size:12px; color:#7f1d1d;">
      Lưu ý (BR1): Kỹ thuật viên không có quyền xóa vĩnh viễn tài sản; liên hệ Phòng CSVC nếu cần thanh lý.
    </p>
    <div class="modal-foot">
      <button type="button" class="btn btn-outline" data-close-ua4>Hủy</button>
      <button type="button" class="btn btn-red" id="btnSaveAsset">Lưu cập nhật</button>
    </div>
  `);

  const saveBtn = box.querySelector('#btnSaveAsset');
  saveBtn.addEventListener('click', () => {
    const specs = box.querySelector('#edSpecs').value.trim();
    const warrantyEnd = box.querySelector('#edWarranty').value;
    const status = box.querySelector('#edStatus').value;
    const note = box.querySelector('#edNote').value.trim();

    if (!specs) {
      notifyToast('Vui lòng nhập thông số cấu hình thiết bị', 'error');
      return;
    }

    runWithLock(saveBtn, () => {
      asset.specs = specs;
      asset.warrantyEnd = warrantyEnd;
      asset.status = status;
      asset.note = note;
      asset.history.unshift({
        date: 'Hôm nay',
        type: 'Cập nhật hồ sơ',
        detail: `Cập nhật thông số & trạng thái sang "${STATUS_META[status].label}"`,
        tech: 'Nguyễn Dương Quốc Bảo'
      });

      closeUa4Modal();
      renderAssetTable();
      notifyToast(`Đã cập nhật hồ sơ kỹ thuật thiết bị ${asset.code}`);
    });
  });
}

/* ===== 6. Điều chuyển thiết bị giữa các phòng học (F89, BR2) ===== */
function openTransferModal(code) {
  const asset = getAsset(code);
  if (!asset) return;

  const targetRooms = CAMPUS_ROOMS.filter((r) => r.room !== asset.room);

  const box = showUa4Modal(`
    <h3 id="ua4DlgTitle">Điều chuyển thiết bị · ${escStr(asset.code)}</h3>
    <div class="form-row">
      <label>Phòng nguồn hiện tại</label>
      <input type="text" class="ua4-input" value="${escStr(asset.room)} (${escStr(asset.building)})" readonly>
    </div>
    <div class="form-row">
      <label for="trTargetRoom">Phòng đích nhận thiết bị *</label>
      <select id="trTargetRoom" class="ua4-select">
        ${targetRooms
          .map((r) => `<option value="${escStr(r.room)}" data-bld="${escStr(r.building)}">${escStr(r.room)} · ${escStr(r.building)}</option>`)
          .join('')}
      </select>
    </div>
    <div class="form-row">
      <label for="trReason">Lý do điều chuyển (BR2) *</label>
      <input type="text" id="trReason" class="ua4-input" placeholder="VD: Bổ sung máy chiếu phục vụ lớp thực hành">
    </div>
    <div class="modal-foot">
      <button type="button" class="btn btn-outline" data-close-ua4>Hủy</button>
      <button type="button" class="btn btn-red" id="btnConfirmMove">Xác nhận điều chuyển</button>
    </div>
  `);

  const moveBtn = box.querySelector('#btnConfirmMove');
  moveBtn.addEventListener('click', () => {
    const sel = box.querySelector('#trTargetRoom');
    const newRoom = sel.value;
    const newBuilding = sel.selectedOptions[0].dataset.bld;
    const reason = box.querySelector('#trReason').value.trim() || 'Điều phối thiết bị theo nhu cầu phòng học';
    const oldRoom = asset.room;

    // BR2: Cập nhật ngay sơ đồ vị trí mới của cả 2 phòng trên hệ thống
    runWithLock(moveBtn, () => {
      asset.room = newRoom;
      asset.building = newBuilding;
      asset.history.unshift({
        date: 'Hôm nay',
        type: 'Điều chuyển vị trí (BR2)',
        detail: `Chuyển từ phòng ${oldRoom} sang phòng ${newRoom} (${reason})`,
        tech: 'Nguyễn Dương Quốc Bảo'
      });

      closeUa4Modal();
      renderAssetTable();
      notifyToast(`Đã điều chuyển ${asset.code}: ${oldRoom} → ${newRoom}`);
    });
  });
}

/* ===== 7. Trích xuất báo cáo kỹ thuật gửi Phòng CSVC (F90, PB-90) ===== */
function exportTechReport(format, btn) {
  const period = document.getElementById('reportPeriod')?.value || 'Học kỳ 1 (2026–2027)';
  const maintCount = EQUIPMENT_ASSETS.filter((a) => a.status === 'maint').length;

  runWithLock(btn, () => {
    notifyToast(
      `Đã xuất báo cáo ${format} (${period} · ${EQUIPMENT_ASSETS.length} thiết bị, ${maintCount} đang bảo trì) gửi Phòng CSVC`
    );
  });
}

/* ===== 8. Khởi tạo trang UA4 ===== */
function initUA4() {
  renderAssetTable();

  ['qAsset', 'qBuilding', 'qStatus'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(id === 'qAsset' ? 'input' : 'change', renderAssetTable);
  });

  document.getElementById('btnSearchAsset')?.addEventListener('click', renderAssetTable);

  document.getElementById('assetTableBody')?.addEventListener('click', (e) => {
    const histBtn = e.target.closest('[data-history]');
    if (histBtn) return openHistoryModal(histBtn.dataset.history);

    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) return openEditAssetModal(editBtn.dataset.edit);

    const moveBtn = e.target.closest('[data-move]');
    if (moveBtn) return openTransferModal(moveBtn.dataset.move);
  });

  document.getElementById('btnExportPdf')?.addEventListener('click', (e) => {
    exportTechReport('PDF', e.currentTarget);
  });

  document.getElementById('btnExportExcel')?.addEventListener('click', (e) => {
    exportTechReport('Excel (.xlsx)', e.currentTarget);
  });
}

document.addEventListener('DOMContentLoaded', initUA4);
