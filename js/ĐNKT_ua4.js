/* Đội ngũ kỹ thuật · Tra cứu hồ sơ kỹ thuật, điều chuyển vị trí thiết bị & trích xuất báo cáo */

Object.assign(ICONS, {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  move: '<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M2 12h20M12 2v20"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>'
});

/* ===== Dữ liệu mẫu Danh mục thiết bị & Lý lịch kỹ thuật VLU (F88 - F90) ===== */
const ASSETS = [
  {
    code: 'TB-MC-A0502', name: 'Máy chiếu Epson EB-X51', campus: 'CS3', room: 'A.0502',
    status: 'ready', warranty: '15/08/2027',
    spec: '3.800 ANSI Lumens · XGA · Cổng HDMI/VGA · Bóng đèn 1.850h',
    history: [
      { date: '24/11/2026', action: 'Nghiệm thu sự cố #SC-104', detail: 'Khắc phục tín hiệu HDMI, kiểm tra nhiệt độ ổn định' },
      { date: '12/09/2026', action: 'Bảo trì định kỳ', detail: 'Vệ sinh lưới lọc bụi và hiệu chỉnh khung hình' }
    ]
  },
  {
    code: 'TB-AT-G0201', name: 'Bộ micro không dây Shure BLX288', campus: 'CS3', room: 'G.0201',
    status: 'borrowed', warranty: '20/11/2027',
    spec: 'Băng tần UHF · 02 tay micro · Khoảng cách thu 60m',
    history: [
      { date: '22/11/2026', action: 'Bảo trì định kỳ #BT-201', detail: 'Thay 04 pin sạc AA và đồng bộ tần số' }
    ]
  },
  {
    code: 'TB-MH-H0304', name: 'Màn hình tương tác 75 inch', campus: 'CS3', room: 'H.0304',
    status: 'maintenance', warranty: '10/05/2027',
    spec: '4K UHD · Cảm ứng đa điểm · Android 13 / OPS Windows',
    history: [
      { date: '23/11/2026', action: 'Khóa bảo trì (BR3)', detail: 'Hỏng bo nguồn, đã lập phiếu gửi bảo hành hãng' }
    ]
  },
  {
    code: 'TB-SW-LV04', name: 'Switch mạng Cisco Catalyst 24-Port', campus: 'CS3', room: 'LV.0401',
    status: 'ready', warranty: '30/12/2028',
    spec: '24 cổng Gigabit PoE+ · Rack 19 inch · VLAN Phòng Lab',
    history: [
      { date: '18/10/2026', action: 'Điều chuyển vị trí (BR2)', detail: 'Chuyển từ Kho CS3 đến Phòng LV.0401' }
    ]
  },
  {
    code: 'TB-MC-CS102', name: 'Máy chiếu Sony VPL-DX241', campus: 'CS1', room: 'A.0201 (CS1)',
    status: 'ready', warranty: '01/06/2027',
    spec: '3.300 ANSI Lumens · 3LCD · Cổng HDMI kép',
    history: []
  }
];

const REPORT_DATA = {
  month: {
    overview: [
      { label: 'Tổng thiết bị giám sát', val: '342', cls: '' },
      { label: 'Sẵn sàng hoạt động', val: '96,5%', cls: 'ok' },
      { label: 'Sự cố đã xử lý (11/2026)', val: '28 ca', cls: '' },
      { label: 'Đang khóa bảo trì', val: '02 máy', cls: 'alert' }
    ],
    incident: [
      { label: 'Tỷ lệ phản hồi SLA ≤ 15p', val: '98,2%', cls: 'ok' },
      { label: 'Thời gian sửa trung bình', val: '38 phút', cls: '' },
      { label: 'Lỗi máy chiếu / hiển thị', val: '46%', cls: 'alert' },
      { label: 'Lỗi âm thanh / mạng LAN', val: '54%', cls: '' }
    ],
    maintenance: [
      { label: 'Phòng hoàn thành bảo trì', val: '24/26', cls: 'ok' },
      { label: 'Tiến độ tháng 11/2026', val: '92,3%', cls: '' },
      { label: 'Vật tư đề xuất thay thế', val: '05 phiếu', cls: '' },
      { label: 'Lịch bảo trì đang khóa', val: '01 phòng', cls: 'alert' }
    ]
  },
  semester: {
    overview: [
      { label: 'Tổng thiết bị 3 cơ sở', val: '1.120', cls: '' },
      { label: 'Tỷ lệ khả dụng HK1', val: '97,4%', cls: 'ok' },
      { label: 'Tổng phiếu sự cố HK1', val: '145 ca', cls: '' },
      { label: 'Gửi bảo hành ngoài', val: '06 máy', cls: 'alert' }
    ],
    incident: [
      { label: 'Đạt chuẩn SLA khẩn cấp', val: '97,9%', cls: 'ok' },
      { label: 'Thời gian khắc phục TB', val: '42 phút', cls: '' },
      { label: 'Sự cố giảng đường', val: '61%', cls: '' },
      { label: 'Sự cố phòng Lab / Hội trường', val: '39%', cls: '' }
    ],
    maintenance: [
      { label: 'Đợt bảo trì định kỳ HK1', val: '78/80', cls: 'ok' },
      { label: 'Tỷ lệ hoàn tất Checklist', val: '97,5%', cls: '' },
      { label: 'Thiết bị điều chuyển (BR2)', val: '19 lượt', cls: '' },
      { label: 'Cảnh báo cần thay thế', val: '04 máy', cls: 'alert' }
    ]
  }
};

const ST_TEXT  = { ready: 'Sẵn sàng sử dụng', borrowed: 'Đang được mượn', maintenance: 'Đang bảo trì / Hỏng' };
const ST_CLASS = { ready: 'ok', borrowed: 'blue', maintenance: 'rejected' };
const TARGET_ROOMS = ['A.0301', 'A.0502', 'G.0201', 'H.0304', 'LV.0401', 'Kho thiết bị CS3'];

let reportTab = 'overview';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getAsset = code => ASSETS.find(a => a.code === code);

function alertBox(kind, title, text, ic = 'alert') {
  return `<div class="alert ${kind}">${icon(ic)}<div>${title ? `<b>${title}</b>` : ''}${text || ''}</div></div>`;
}

/* ===== Khung Modal & Drawer dùng chung ===== */
function setModal(html) {
  const root = $('modalRoot');
  root.innerHTML = `<div class="overlay"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  document.body.classList.add('no-scroll');
  root.querySelector('.overlay').addEventListener('mousedown', e => { if (e.target.classList.contains('overlay')) closeModal(); });
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
}
function closeModal() { $('modalRoot').innerHTML = ''; document.body.classList.remove('no-scroll'); }
function closeDrawer() { $('drawerRoot').innerHTML = ''; document.body.classList.remove('no-scroll'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

/* ===== Cột trái: Tra cứu danh mục thiết bị (F88, BR1) ===== */
function renderAssets() {
  const campus = $('fCampus').value;
  const status = $('fStatus').value;
  const kw = $('fKeyword').value.trim().toLowerCase();

  const list = ASSETS.filter(a =>
    a.campus === campus &&
    (status === 'all' || a.status === status) &&
    (!kw || a.code.toLowerCase().includes(kw) || a.name.toLowerCase().includes(kw) || a.room.toLowerCase().includes(kw))
  );

  $('assetCount').textContent = `${list.length} thiết bị (${campus})`;
  const grid = $('assetGrid');

  if (!list.length) {
    grid.innerHTML = `<div class="empty">Không tìm thấy thiết bị nào khớp điều kiện tra cứu.</div>`;
    return;
  }

  // Lưu ý BR1: Không hiển thị nút Xóa vĩnh viễn tài sản (quyền thuộc Phòng CSVC/Admin)
  grid.innerHTML = list.map(a => `
    <article class="asset-card ${a.status === 'maintenance' ? 'maint' : ''}">
      <div class="asset-top">
        <span class="asset-code">${esc(a.code)}</span>
        <span class="badge ${ST_CLASS[a.status]}">${ST_TEXT[a.status]}</span>
      </div>
      <h3>${esc(a.name)}</h3>
      <div class="asset-loc">Vị trí: Phòng ${esc(a.room)} · BH đến ${esc(a.warranty)}</div>
      <p class="asset-spec">${esc(a.spec)}</p>
      <div class="asset-actions">
        <button type="button" class="btn btn-outline" data-hist="${a.code}">${icon('history')} Lý lịch</button>
        <button type="button" class="btn btn-outline" data-edit="${a.code}">${icon('sliders')} Thông số</button>
        <button type="button" class="btn btn-primary" data-move="${a.code}">${icon('move')} Điều chuyển</button>
      </div>
    </article>
  `).join('');
}

/* ===== Drawer: Lý lịch sửa chữa, bảo trì & điều chuyển (F88) ===== */
function openAssetHistory(code) {
  const a = getAsset(code);
  const logs = a.history.map(h =>
    `<li class="done"><span class="dot">${icon('check')}</span><div><b>${esc(h.action)} (${esc(h.date)})</b><small>${esc(h.detail)}</small></div></li>`
  ).join('') || '<p class="muted">Chưa ghi nhận lịch sử sửa chữa hay luân chuyển nào.</p>';

  $('drawerRoot').innerHTML = `
    <div class="drawer-overlay" id="dOverlay">
      <aside class="drawer" role="dialog" aria-modal="true">
        <div class="d-head">
          <div><h2>Lý lịch thiết bị ${esc(a.code)}</h2><p>${esc(a.name)}</p></div>
          <button type="button" class="d-x" id="dClose">${icon('x')}</button>
        </div>
        <div class="d-body">
          <div class="sum">
            <p><b>Vị trí hiện tại:</b> Phòng ${esc(a.room)} (${esc(a.campus)})</p>
            <p><b>Trạng thái:</b> ${ST_TEXT[a.status]}</p>
            <p><b>Hạn bảo hành:</b> ${esc(a.warranty)}</p>
            <p><b>Cấu hình:</b> ${esc(a.spec)}</p>
          </div>
          <h4 class="sec">Nhật ký bảo trì &amp; điều chuyển</h4>
          <ol class="tl">${logs}</ol>
        </div>
      </aside>
    </div>`;
  document.body.classList.add('no-scroll');
  $('dClose').onclick = closeDrawer;
  $('dOverlay').addEventListener('mousedown', e => { if (e.target.id === 'dOverlay') closeDrawer(); });
}

/* ===== Modal 1: Cập nhật thông số kỹ thuật & hạn bảo hành (F89, BR1) ===== */
function openEditAsset(code) {
  const a = getAsset(code);
  setModal(`
    <div class="m-head"><div><h2>Cập nhật thông số kỹ thuật</h2><p>${esc(a.code)} · ${esc(a.name)}</p></div><button type="button" class="m-x" data-close>${icon('x')}</button></div>
    <div class="m-body">
      <div class="f-row">
        <div class="f-group">
          <label for="eStatus">Trạng thái vận hành</label>
          <select id="eStatus">
            <option value="ready" ${a.status === 'ready' ? 'selected' : ''}>Sẵn sàng sử dụng</option>
            <option value="maintenance" ${a.status === 'maintenance' ? 'selected' : ''}>Đang bảo trì / Hỏng</option>
          </select>
        </div>
        <div class="f-group">
          <label for="eWarranty">Hạn bảo hành</label>
          <input type="text" id="eWarranty" value="${esc(a.warranty)}">
        </div>
      </div>
      <div class="f-group">
        <label for="eSpec">Thông số cấu hình &amp; ghi chú kỹ thuật *</label>
        <textarea id="eSpec">${esc(a.spec)}</textarea>
      </div>
      ${alertBox('brand', 'Phân quyền BR1', 'Đội ngũ kỹ thuật chỉ cập nhật thông số vận hành; không có quyền xóa tài sản khỏi hệ thống.')}
    </div>
    <div class="m-foot">
      <button type="button" class="btn btn-outline" data-close>Hủy</button>
      <button type="button" class="btn btn-primary" id="eSave">Lưu thông số</button>
    </div>
  `);

  $('eSave').addEventListener('click', () => {
    const spec = $('eSpec').value.trim();
    if (!spec) return;
    a.status = $('eStatus').value;
    a.warranty = $('eWarranty').value.trim() || a.warranty;
    a.spec = spec;
    a.history.unshift({ date: '24/11/2026', action: 'Cập nhật hồ sơ kỹ thuật', detail: `Cấu hình: ${spec}` });
    closeModal();
    renderAssets();
    $('pageNotice').innerHTML = alertBox('ok', `Đã cập nhật hồ sơ ${a.code} (F89)`, 'Thông số kỹ thuật và trạng thái thiết bị đã được lưu vào lý lịch.', 'check');
  });
}

/* ===== Modal 2: Điều chuyển thiết bị giữa các phòng (F89, BR2) ===== */
function openTransferAsset(code) {
  const a = getAsset(code);
  const targets = TARGET_ROOMS.filter(r => r !== a.room);
  setModal(`
    <div class="m-head"><div><h2>Điều chuyển vị trí thiết bị (BR2)</h2><p>${esc(a.code)} · ${esc(a.name)}</p></div><button type="button" class="m-x" data-close>${icon('x')}</button></div>
    <div class="m-body">
      <div class="transfer-box">
        <div><small>Phòng nguồn hiện tại</small><b>${esc(a.room)}</b></div>
        <div class="transfer-arrow">&rarr;</div>
        <div><small>Phòng đích tiếp nhận</small><b id="previewTarget">${esc(targets[0])}</b></div>
      </div>
      <div class="f-group">
        <label for="tTarget">Chọn phòng đích nhận thiết bị *</label>
        <select id="tTarget">
          ${targets.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join('')}
        </select>
      </div>
      <div class="f-group">
        <label for="tReason">Lý do luân chuyển thiết bị *</label>
        <input type="text" id="tReason" placeholder="VD: Bổ sung máy chiếu thay thế cho ca thực hành chiều...">
      </div>
    </div>
    <div class="m-foot">
      <button type="button" class="btn btn-outline" data-close>Hủy</button>
      <button type="button" class="btn btn-primary" id="tConfirm">Xác nhận điều chuyển</button>
    </div>
  `);

  $('tTarget').addEventListener('change', e => { $('previewTarget').textContent = e.target.value; });
  $('tConfirm').addEventListener('click', () => {
    const oldRoom = a.room;
    const newRoom = $('tTarget').value;
    const reason = $('tReason').value.trim() || 'Điều phối phục vụ giảng dạy';
    a.room = newRoom;
    a.history.unshift({ date: '24/11/2026', action: 'Điều chuyển vị trí (BR2)', detail: `${oldRoom} → ${newRoom} (${reason})` });
    closeModal();
    renderAssets();
    $('pageNotice').innerHTML = alertBox('ok', `Đã điều chuyển ${a.code} sang ${newRoom} (BR2)`, `Sơ đồ thiết bị của cả hai phòng ${oldRoom} và ${newRoom} đã cập nhật ngay lập tức.`, 'check');
  });
}

/* ===== Cột phải: Thống kê & Trích xuất báo cáo kỹ thuật (F90, PB-90) ===== */
function renderReport() {
  const range = $('fReportRange').value;
  $('reportPeriodLabel').textContent = range === 'month' ? 'Tháng 11/2026' : 'Học kỳ 1 (26-27)';
  document.querySelectorAll('#reportTabs .tab').forEach(t => t.classList.toggle('active', t.dataset.filter === reportTab));

  const stats = REPORT_DATA[range][reportTab] || [];
  $('reportSummary').innerHTML = stats.map(s => `
    <div class="stat-box ${s.cls}">
      <small>${esc(s.label)}</small>
      <strong>${esc(s.val)}</strong>
    </div>
  `).join('');
}

function exportReport(format) {
  const rangeLabel = $('fReportRange').value === 'month' ? 'Thang_11_2026' : 'Hoc_Ky_1_2026_2027';
  const ext = format === 'excel' ? 'xlsx' : 'pdf';
  const fileName = `Bao_Cao_Ky_Thuat_VLU_${rangeLabel}.${ext}`;
  $('pageNotice').innerHTML = alertBox('ok', `Đã trích xuất báo cáo ${format.toUpperCase()} (F90)`, `Tệp <b>${fileName}</b> đã được tạo theo quy chuẩn gửi Phòng Cơ sở vật chất.`, 'check');
  if (typeof showToast === 'function') showToast(`Đang tải xuống ${fileName}`);
}

/* ===== Khởi tạo trang UA4 ===== */
function initUA4() {
  $('dateChip').innerHTML = `${icon('calendar')} Thứ Ba, 24/11/2026`;
  $('pageAlert').innerHTML = alertBox('brand', 'Quản lý hồ sơ kỹ thuật & giám sát tài sản (BR1 – BR2)', 'Tra cứu lý lịch bảo trì, cập nhật thông số thiết bị và điều chuyển vị trí phòng học theo thời gian thực.');
  $('btnFilter').innerHTML = `${icon('search')} Tra cứu`;
  $('btnExportExcel').innerHTML = `${icon('download')} Xuất Excel`;
  $('btnExportPdf').innerHTML = `${icon('download')} Xuất PDF`;

  renderAssets();
  renderReport();

  $('assetFilterForm').addEventListener('submit', e => { e.preventDefault(); renderAssets(); });
  $('fCampus').addEventListener('change', renderAssets);
  $('fStatus').addEventListener('change', renderAssets);

  $('assetGrid').addEventListener('click', e => {
    const hist = e.target.closest('[data-hist]');
    const edit = e.target.closest('[data-edit]');
    const move = e.target.closest('[data-move]');
    if (hist) openAssetHistory(hist.dataset.hist);
    if (edit) openEditAsset(edit.dataset.edit);
    if (move) openTransferAsset(move.dataset.move);
  });

  $('reportTabs').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) { reportTab = tab.dataset.filter; renderReport(); }
  });
  $('fReportRange').addEventListener('change', renderReport);
  $('btnExportExcel').addEventListener('click', () => exportReport('excel'));
  $('btnExportPdf').addEventListener('click', () => exportReport('pdf'));
}

document.addEventListener('DOMContentLoaded', initUA4);
