/* ===== Icon bổ sung (dùng chung hàm icon() trong main.js) ===== */
Object.assign(ICONS, {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01"/><path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56z"/>',
  plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  imagePlus: '<path d="M16 5h6M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  clipboardCheck: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'
});

/* ===== Dữ liệu mock ===== */
const TODAY = '2026-10-26';
const ROOMS = ['Phòng A.301', 'Phòng A.302'];
const DEVICES = ['Máy chiếu B.205', 'Ổ điện kéo dài số 07', 'Hub USB-C số 03', 'Dây cáp HDMI số 05'];

// Các bước xử lý theo thứ tự
const STAGES = ['sent', 'received', 'repairing', 'done'];
const STAGE_TITLE = { sent: 'Đã gửi', received: 'Đã tiếp nhận', repairing: 'Đang sửa', done: 'Đã xử lý' };
const STAGE_CLASS = { sent: 'gray', received: 'pending', repairing: 'blue', done: 'ok' };
const OFFSET = { received: 10, repairing: 30, done: 210 }; // phút kể từ lúc gửi (dùng khi giả lập)

// kind: 'room' | 'device'; result (khi xong): 'repair' | 'replace'
const INCIDENTS = [
  { code: 'SC1040', kind: 'device', title: 'Dây cáp HDMI số 05',   desc: 'Đầu cáp lỏng, hình ảnh bị ngắt khi trình chiếu.',   status: 'sent',
    times: { sent: { date: '2026-10-26', time: '10:05' } } },
  { code: 'SC1039', kind: 'room',   title: 'Phòng A.301',          desc: 'Điều hòa không làm mát dù đã bật khoảng 20 phút.', status: 'received',
    times: { sent: { date: '2026-10-26', time: '09:10' }, received: { date: '2026-10-26', time: '09:25' } } },
  { code: 'SC1038', kind: 'device', title: 'Máy chiếu B.205',      desc: 'Máy chiếu không lên nguồn khi bật công tắc.',       status: 'repairing',
    times: { sent: { date: '2026-10-26', time: '08:20' }, received: { date: '2026-10-26', time: '08:40' }, repairing: { date: '2026-10-26', time: '09:00' } } },
  { code: 'SC1037', kind: 'room',   title: 'Phòng A.302',          desc: 'Tay nắm cửa bị lỏng, khó đóng cửa phòng.',          status: 'done', result: 'repair',
    times: { sent: { date: '2026-10-23', time: '14:00' }, received: { date: '2026-10-23', time: '14:20' }, repairing: { date: '2026-10-23', time: '15:00' }, done: { date: '2026-10-23', time: '16:00' } } },
  { code: 'SC1036', kind: 'device', title: 'Ổ điện kéo dài số 07', desc: 'Công tắc không sáng, các ổ cắm không có điện.',     status: 'done', result: 'replace',
    img: { name: 'o-dien-07.jpg', size: '1,1 MB', url: null },
    times: { sent: { date: '2026-10-22', time: '09:00' }, received: { date: '2026-10-22', time: '09:20' }, repairing: { date: '2026-10-22', time: '10:00' }, done: { date: '2026-10-23', time: '15:00' } } }
];

const NOTIFS = [
  { code: 'SC1039', stage: 'received',  title: 'Đã tiếp nhận · Phòng A.301',   text: 'Phòng CSVC đã tiếp nhận báo cáo điều hòa không làm mát.',   time: '09:25 · 26/10/2026', unread: true },
  { code: 'SC1038', stage: 'repairing', title: 'Đang sửa · Máy chiếu B.205',   text: 'Sự cố máy chiếu không lên nguồn đang được khắc phục.',      time: '09:00 · 26/10/2026', unread: true },
  { code: 'SC1037', stage: 'done',      title: 'Đã xử lý · Phòng A.302',       text: 'Sự cố đã được xử lý, bạn có thể sử dụng lại',               time: '16:00 · 23/10/2026', unread: true }
];

const f = { kind: 'device', target: '', otherName: '', desc: '', file: null, show: false };   // biểu mẫu
let tab = 'all';       // all | doing | done
let hl = null;         // phiếu vừa gửi

/* ===== Tiện ích ===== */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
const fmtDT = o => `${o.time} · ${fmtDate(o.date)}`;
const num = c => Number(c.slice(2));
const sorted = () => [...INCIDENTS].sort((a, b) => num(b.code) - num(a.code));
const getInc = code => INCIDENTS.find(i => i.code === code);
const nextCode = () => 'SC' + (Math.max(...INCIDENTS.map(i => num(i.code))) + 1);
const addMin = (t, m) => {
  const n = Math.min(Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) + m, 23 * 60 + 59);
  return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
};

function alertBox(kind, title, text, ic = 'info') {
  return `<div class="alert ${kind}">${icon(ic)}<div>${title ? `<b>${title}</b>` : ''}${text || ''}</div></div>`;
}

const sentText = i => i.kind === 'device'
  ? 'Hệ thống đã tạo phiếu sự cố, đánh dấu thiết bị Đang hỏng và thông báo Phòng CSVC'
  : 'Hệ thống đã tạo phiếu sự cố và thông báo Phòng CSVC';

/* ===== Biểu mẫu báo cáo (cột trái) ===== */
function renderForm() {
  const dev = f.kind === 'device';
  const opts = dev ? DEVICES : ROOMS;
  $('formCard').innerHTML = `
    <h2>Báo cáo sự cố mới</h2>

    <div class="fl">
      <label>Đối tượng báo sự cố <span class="req">*</span></label>
      <div class="kinds">
        <button type="button" class="kind ${dev ? '' : 'on'}" data-kind="room"><span class="rad"></span>${icon('door')} Phòng</button>
        <button type="button" class="kind ${dev ? 'on' : ''}" data-kind="device"><span class="rad"></span>${icon('plug')} Thiết bị</button>
      </div>
    </div>

    <div class="fl">
      <label for="fSel">${dev ? 'Thiết bị gặp sự cố' : 'Phòng gặp sự cố'} <span class="req">*</span></label>
      <select id="fSel" aria-describedby="eSel">
        <option value="">${dev ? 'Chọn thiết bị gặp sự cố' : 'Chọn phòng gặp sự cố'}</option>
        ${opts.map(o => `<option value="${o}" ${f.target === o ? 'selected' : ''}>${o}</option>`).join('')}
        ${dev ? `<option value="other" ${f.target === 'other' ? 'selected' : ''}>Khác</option>` : ''}
      </select>
      <div id="otherDeviceField" ${dev && f.target === 'other' ? '' : 'hidden'}>
        <label for="otherDeviceName">Tên thiết bị gặp sự cố <span class="req">*</span></label>
        <input id="otherDeviceName" type="text" required aria-describedby="otherDeviceError" value="${esc(f.otherName)}" placeholder="Ví dụ: Micro không dây">
        <p id="otherDeviceError" class="err" hidden>Vui lòng nhập tên thiết bị.</p>
      </div>
      <p class="err" id="eSel" hidden>Vui lòng chọn phòng hoặc thiết bị gặp sự cố.</p>
    </div>

    <div class="fl">
      <label for="fDesc">Mô tả sự cố <span class="req">*</span></label>
      <textarea id="fDesc" maxlength="1000" aria-describedby="eDesc" placeholder="Mô tả hiện tượng, vị trí và tình trạng bạn quan sát được...">${esc(f.desc)}</textarea>
      <p class="err" id="eDesc" hidden>Vui lòng nhập mô tả sự cố.</p>
    </div>

    <div class="fl">
      <div class="lbl-row"><label>Ảnh đính kèm</label><small>Không bắt buộc</small></div>
      <div class="drop" id="fDrop" role="button" tabindex="0" aria-label="Chọn ảnh đính kèm">
        ${icon('imagePlus')}
        <p>Kéo thả ảnh vào đây hoặc <b>Chọn ảnh</b></p>
      </div>
      <input type="file" id="fFile" accept="image/*" hidden>
      ${f.file ? `
        <div class="file-card">
          <div class="thumb">${f.file.url ? `<img src="${f.file.url}" alt="">` : icon('image')}</div>
          <div class="fc-info"><b>${esc(f.file.name)}</b><small>Đã thêm · ${f.file.size}</small></div>
          <button type="button" class="fc-x" id="fRemove" aria-label="Xóa ảnh">${icon('x')}</button>
        </div>` : ''}
    </div>

    <div id="fAlert" hidden>${alertBox('err', '', 'Chưa thể gửi báo cáo. Vui lòng bổ sung các thông tin bắt buộc ở trên.', 'alert')}</div>
    <button type="button" class="btn btn-primary btn-block" id="fBtn">${icon('send')} Gửi báo cáo</button>
    <p class="note">${icon('info')} Phiếu sự cố được tự động chuyển đến Phòng CSVC. Bạn không cần liên hệ người xử lý.</p>`;

  const sel = $('fSel'), desc = $('fDesc');
  const nameInput = $('otherDeviceName');
  sel.addEventListener('change', () => {
    f.target = sel.value;
    $('otherDeviceField').hidden = sel.value !== 'other';
    if (sel.value === 'other') nameInput.focus();
    syncForm();
  });
  nameInput.addEventListener('input', () => { f.otherName = nameInput.value; syncForm(); });
  desc.addEventListener('input', () => { f.desc = desc.value; syncForm(); });
  document.querySelectorAll('[data-kind]').forEach(b => b.addEventListener('click', () => {
    if (f.kind === b.dataset.kind) return;
    f.kind = b.dataset.kind; f.target = '';
    renderForm(); syncForm();
  }));

  const input = $('fFile'), drop = $('fDrop');
  const take = file => {
    if (!file) return;
    if (!/^image\//.test(file.type || 'image/')) { showToast('Chỉ nhận tệp ảnh'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('Ảnh tối đa 10 MB'); return; }
    const url = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : null;
    f.file = { name: file.name, size: (file.size / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB', url };
    renderForm(); syncForm();
  };
  drop.addEventListener('click', () => input.click());
  drop.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });
  input.addEventListener('change', () => take(input.files[0]));
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); take(e.dataTransfer.files[0]); });
  if ($('fRemove')) $('fRemove').addEventListener('click', () => { f.file = null; renderForm(); syncForm(); });

  $('fBtn').addEventListener('click', submitForm);
  syncForm();
}

function deviceOrRoomName() {
  return f.kind === 'device' && f.target === 'other' ? f.otherName.trim() : f.target;
}

function syncForm() {
  if (!f.show) return;
  const okS = !!f.target, okD = !!f.desc.trim();
  $('eSel').hidden = okS;   $('fSel').classList.toggle('invalid', !okS);
  $('eDesc').hidden = okD;  $('fDesc').classList.toggle('invalid', !okD);
  const okName = f.target !== 'other' || !!deviceOrRoomName();
  $('otherDeviceError').hidden = okName;
  $('otherDeviceName').setAttribute('aria-invalid', String(!okName));
  $('fAlert').hidden = okS && okD && okName;
  $('fBtn').classList.toggle('is-disabled', !(okS && okD && okName));
}

function submitForm() {
  const title = deviceOrRoomName();
  if (!title || !f.desc.trim()) { f.show = true; syncForm(); return; }

  // Thông tin đủ -> khóa nút, hiện loading rồi tạo phiếu (mô phỏng máy chủ)
  const report = { kind: f.kind, title, desc: f.desc.trim(), img: f.file ? { ...f.file } : null };
  submitWithLoading($('fBtn'), () => {
    const code = nextCode();
    const inc = {
      code, ...report, status: 'sent',
      times: { sent: { date: TODAY, time: '10:30' } }
    };
    INCIDENTS.push(inc);
    NOTIFS.unshift({ code, stage: 'sent', title: `Đã gửi · ${inc.title}`, text: sentText(inc), time: fmtDT(inc.times.sent), unread: true });
    hl = code; tab = 'all';
    f.target = ''; f.otherName = ''; f.desc = ''; f.file = null; f.show = false;
    $('pageNotice').innerHTML = `
      <div class="alert ok with-x">${icon('check')}<div><b>Gửi báo cáo thành công · #${code}</b>${sentText(inc)}</div>
        <button type="button" class="notice-x" id="noticeX" aria-label="Đóng">${icon('x')}</button></div>`;
    $('noticeX').onclick = () => { $('pageNotice').innerHTML = ''; };
    renderForm(); renderList(); renderNotifs();
  });
}

/* ===== Sự cố của tôi (cột phải) ===== */
function renderList() {
  const all = sorted();
  const list = tab === 'all' ? all : all.filter(i => (tab === 'done') === (i.status === 'done'));
  $('incCount').textContent = tab === 'all' ? `${all.length} sự cố` : `${list.length} phù hợp`;
  document.querySelectorAll('#incTabs .tab').forEach(t => t.classList.toggle('active', t.dataset.filter === tab));

  if (!list.length) {
    $('incList').innerHTML = !all.length
      ? `<div class="empty-block"><div class="empty-ico">${icon('clipboard')}</div><h3>Bạn chưa gửi báo cáo sự cố nào</h3><p>Khi gặp vấn đề với phòng học hoặc thiết bị, hãy gửi báo cáo ở biểu mẫu bên cạnh.</p></div>`
      : `<div class="empty-block"><div class="empty-ico">${icon('clipboardCheck')}</div><h3>Không có sự cố ${tab === 'done' ? 'đã' : 'đang'} xử lý</h3><p>Hiện không có phiếu trong trạng thái này. Chọn Tất cả để xem các sự cố của bạn.</p><button type="button" class="btn btn-outline" data-all>Xem tất cả sự cố</button></div>`;
    return;
  }

  $('incList').innerHTML = list.map(i => `
    <article class="inc ${i.code === hl ? 'new' : ''}">
      <div class="inc-top">
        <span class="order-code">#${i.code}${i.code === hl ? ' · Vừa gửi' : ''}</span>
        <span class="badge ${STAGE_CLASS[i.status]}">${STAGE_TITLE[i.status]}</span>
      </div>
      <div class="inc-title"><h3>${esc(i.title)}</h3><button type="button" class="detail-link" data-detail="${i.code}">Chi tiết ${icon('chevron')}</button></div>
      <p class="inc-desc">${esc(i.desc)}</p>
      <p class="inc-time">${icon('clock')} Đã gửi: ${fmtDT(i.times.sent)}</p>
      ${i.status === 'done' && i.result === 'replace' ? `<div class="inc-res"><span>Kết quả xử lý</span><span class="badge orange">Thay thế / bảo hành</span></div>` : ''}
    </article>`).join('');
}

/* =====================================================
   NGĂN CHI TIẾT SỰ CỐ (trượt từ bên phải)
   ===================================================== */
function closeDrawer() { $('drawerRoot').innerHTML = ''; document.body.classList.remove('no-scroll'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeSim(); } });

function noteOf(i) {
  const dev = i.kind === 'device';
  if (i.status === 'sent') return 'Phiếu sự cố đã được tạo và chuyển đến Phòng CSVC.';
  if (i.status === 'received') return 'Phòng CSVC đã tiếp nhận và đang kiểm tra sự cố.';
  if (i.status === 'repairing') return dev ? 'Đang khắc phục sự cố của thiết bị.' : 'Đang khắc phục sự cố tại phòng.';
  return i.result === 'replace' ? 'Đã thay thiết bị và thông báo kết quả cho giảng viên.' : 'Đã khắc phục sự cố và kiểm tra hoạt động ổn định.';
}

function openDetail(code) {
  const i = getInc(code);
  const idx = STAGES.indexOf(i.status);

  const steps = STAGES.map((s, n) => {
    const done = n <= idx;
    const link = done && n < idx ? 'line-on' : '';
    return `<li class="${done ? 'done' : 'todo'} ${link}"><span class="dot">${done ? icon('check') : ''}</span>
      <div><b>${STAGE_TITLE[s]}</b><small>${done ? fmtDT(i.times[s]) : 'Chờ cập nhật'}</small></div></li>`;
  }).join('');

  let doneBox = '';
  if (i.status === 'done') {
    doneBox = i.result === 'replace'
      ? `<div class="alert ok flat">${icon('check')}<div><b>Sự cố đã được xử lý, bạn có thể sử dụng lại</b><span class="orange-text">Thiết bị được thay thế, vui lòng nhận tại Phòng CSVC</span></div></div>`
      : `<div class="alert ok flat">${icon('check')}<div><b>Sự cố đã được xử lý, bạn có thể sử dụng lại</b>Đã sửa chữa · ${i.kind === 'device' ? 'Thiết bị' : 'Phòng'} hoạt động bình thường.</div></div>`;
  }

  $('drawerRoot').innerHTML = `
    <div class="drawer-overlay" id="dOverlay">
      <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
        <div class="d-head">
          <div><h2 id="drawerTitle">Chi tiết sự cố</h2><p>#${i.code}</p></div>
          <button type="button" class="d-x" id="dClose" aria-label="Đóng">${icon('x')}</button>
        </div>
        <div class="d-body">
          <h3 class="d-title">${esc(i.title)}</h3>
          <div class="d-badges">
            <span class="badge ${STAGE_CLASS[i.status]}">${STAGE_TITLE[i.status]}</span>
            ${i.status === 'done' && i.result === 'replace' ? '<span class="badge orange">Thay thế / bảo hành</span>' : ''}
          </div>
          <p class="d-sent">Đã gửi: ${fmtDT(i.times.sent)}</p>
          ${doneBox}
          <h4 class="d-sec">Mô tả sự cố</h4>
          <p class="d-desc">${esc(i.desc)}</p>
          <h4 class="d-sec">Ảnh đính kèm · ${i.img ? '1 ảnh' : '0 ảnh'}</h4>
          ${i.img ? `
            <div class="file-card">
              <div class="thumb">${i.img.url ? `<img src="${i.img.url}" alt="">` : icon('image')}</div>
              <div class="fc-info"><b>${esc(i.img.name)}</b><small>Ảnh đã gửi · ${i.img.size}</small></div>
            </div>` : '<p class="muted small">Không có ảnh đính kèm.</p>'}
          <h3 class="d-prog">Tiến độ xử lý</h3>
          <ol class="tl4">${steps}</ol>
          <div class="d-note"><b>Ghi chú xử lý</b><p>${noteOf(i)}</p></div>
          ${i.status !== 'done' ? `<button type="button" class="btn btn-outline btn-block" id="dSim">Giả lập tiến độ</button>
            <p class="d-foot">Minh họa: bấm để chuyển sang bước xử lý tiếp theo.</p>` : ''}
        </div>
      </aside>
    </div>`;
  document.body.classList.add('no-scroll');
  trapDialog($('drawerRoot').querySelector('.drawer'), closeDrawer);
  $('dClose').onclick = closeDrawer;
  $('dOverlay').addEventListener('mousedown', e => { if (e.target.id === 'dOverlay') closeDrawer(); });
  if ($('dSim')) $('dSim').onclick = () => simulate(i.code);
}

/* ===== Giả lập tiến độ xử lý ===== */
function closeSim() { $('simRoot').innerHTML = ''; }

function simulate(code) {
  const i = getInc(code);
  const next = STAGES[STAGES.indexOf(i.status) + 1];
  // Bước cuối của thiết bị: 2 kết quả thay thế nhau
  if (next === 'done' && i.kind === 'device') {
    $('simRoot').innerHTML = `
      <div class="sim-overlay" id="sOverlay"><div class="sim-box">
        <h3>Giả lập kết quả xử lý</h3>
        <p>#${i.code} · ${esc(i.title)}. Chọn một trong hai kết quả hoàn tất (thay thế nhau).</p>
        <div class="sim-btns">
          <button type="button" class="btn btn-primary" id="sRepair">Sửa chữa xong</button>
          <button type="button" class="btn btn-outline" id="sReplace">Thay thế / bảo hành</button>
          <button type="button" class="btn btn-outline" id="sCancel">Quay lại</button>
        </div></div></div>`;
    $('sRepair').onclick = () => { closeSim(); advance(i, next, 'repair'); };
    $('sReplace').onclick = () => { closeSim(); advance(i, next, 'replace'); };
    $('sCancel').onclick = closeSim;
    $('sOverlay').addEventListener('mousedown', e => { if (e.target.id === 'sOverlay') closeSim(); });
    return;
  }
  advance(i, next, next === 'done' ? 'repair' : null);
}

function advance(i, next, result) {
  const s = i.times.sent;
  i.times[next] = { date: s.date, time: addMin(s.time, OFFSET[next]) };
  i.status = next;
  if (result) i.result = result;

  const dev = i.kind === 'device';
  const text = {
    received: 'Phòng CSVC đã tiếp nhận và đang kiểm tra sự cố.',
    repairing: dev ? 'Đang khắc phục sự cố của thiết bị.' : 'Đang khắc phục sự cố tại phòng.',
    done: result === 'replace' ? 'Thiết bị được thay thế, vui lòng nhận tại Phòng CSVC' : 'Sự cố đã được xử lý, bạn có thể sử dụng lại'
  }[next];
  NOTIFS.unshift({ code: i.code, stage: next, title: `${STAGE_TITLE[next]} · ${i.title}`, text, time: fmtDT(i.times[next]), unread: true });

  renderList(); renderNotifs();
  openDetail(i.code);
}

/* =====================================================
   THÔNG BÁO (chuông)
   ===================================================== */
const N_ICON = { sent: 'send', received: 'clipboard', repairing: 'wrench', done: 'check' };

function renderNotifs() {
  const panel = $('notifPanel');
  if (!panel) return;
  const unread = NOTIFS.filter(n => n.unread).length;
  const badge = document.querySelector('.bell-badge');
  if (badge) { badge.textContent = unread; badge.style.display = unread ? 'flex' : 'none'; }

  panel.innerHTML = `
    <div class="np-head">
      <h3>Thông báo ${unread ? `<span class="np-pill">${unread} mới</span>` : ''}</h3>
      <button type="button" class="m-x" data-np-close aria-label="Đóng">${icon('x')}</button>
    </div>
    ${NOTIFS.length ? NOTIFS.map((n, k) => `
      <div class="n4 ${n.unread ? 'unread' : ''}" data-n="${k}">
        <div class="n4-ico ${n.stage}">${icon(N_ICON[n.stage])}</div>
        <div class="n4-main">
          <b>${esc(n.title)}</b>
          <p>${esc(n.text)}</p>
          <div class="n4-bot"><small>${n.time}</small><span class="n4-link">#${n.code} · Chi tiết ›</span></div>
        </div>
        ${n.unread ? '<i class="n4-dot"></i>' : ''}
      </div>`).join('') : `
      <div class="np-empty4">${icon('bell')}<b>Chưa có thông báo</b><p>Các cập nhật về báo cáo sự cố sẽ hiển thị tại đây.</p></div>`}`;
}

function initBell() {
  const bell = document.querySelector('.bell');
  const holder = document.querySelector('.header-inner');
  if (!bell || !holder) return;

  const panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.className = 'notif-panel wide';
  panel.hidden = true;
  holder.appendChild(panel);
  renderNotifs();

  bell.addEventListener('click', e => { e.stopPropagation(); panel.hidden = !panel.hidden; });
  document.addEventListener('click', e => { if (!panel.contains(e.target)) panel.hidden = true; });
  panel.addEventListener('click', e => {
    if (e.target.closest('[data-np-close]')) { panel.hidden = true; return; }
    const item = e.target.closest('[data-n]');
    if (item) {
      const n = NOTIFS[Number(item.dataset.n)];
      n.unread = false;
      panel.hidden = true;
      renderNotifs();
      openDetail(n.code);
    }
  });
}

/* =====================================================
   KHỞI TẠO
   ===================================================== */
function initUA3() {
  $('dateChip').innerHTML = `${icon('calendar')} Thứ Hai, 26/10/2026`;
  $('noteInc').innerHTML = `${icon('bell')} Bạn sẽ nhận thông báo khi sự cố được tiếp nhận, đang sửa hoặc đã xử lý.`;

  const fr = document.querySelector('.footer-inner span:last-child');
  if (fr) fr.textContent = 'Theo dõi kết quả trực tiếp trên hệ thống';

  // Quét mã QR dán tại phòng: trang mở với ?room=A.301 -> chọn sẵn "Phòng" và phòng đó
  const qrRoom = new URLSearchParams(location.search).get('room');
  const matched = qrRoom && ROOMS.find(r => r === qrRoom || r === 'Phòng ' + qrRoom);
  if (matched) {
    f.kind = 'room';
    f.target = matched;
    $('pageNotice').innerHTML = alertBox('info', `Bạn đang báo sự cố cho ${matched}`, 'Phòng được chọn sẵn từ mã QR dán tại phòng. Bạn vẫn có thể đổi nếu cần.');
  }

  renderForm();
  renderList();

  $('incTabs').addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (t) { tab = t.dataset.filter; renderList(); }
  });
  $('incList').addEventListener('click', e => {
    const d = e.target.closest('[data-detail]');
    if (d) openDetail(d.dataset.detail);
    if (e.target.closest('[data-all]')) { tab = 'all'; renderList(); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initUA3();
  layoutReady.then(initBell);
});
