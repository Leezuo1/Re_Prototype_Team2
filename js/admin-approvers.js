/* Admin · Phân công người duyệt theo loại phòng (dữ liệu mẫu) */

const TYPES = [
  { type: 'Phòng học', role: 'Phòng Đào tạo', pending: 8, saved: { main: 'Tuyền Quang Minh Nhân', backup: 'Nguyễn Thị Hồng Nhung' } },
  { type: 'Hội trường', role: 'TT Hỗ trợ SV', pending: 3, saved: { main: 'Lê Thị Mỹ Duyên', backup: '' } },
  { type: 'Phòng họp', role: 'Quản lý CSVC', pending: 1, saved: { main: 'Phạm Quốc Toàn', backup: 'Lâm Thị Thu Hà' } }
];
TYPES.forEach(t => t.cur = { ...t.saved });

const candidates = role => ACCOUNTS.filter(a => a.active && a.roles.includes(role)).map(a => a.name);
const roomCount = type => ROOMS.filter(r => r.type === type).length;

function render() {
  $('#assignRows').innerHTML = TYPES.map((t, i) => {
    const names = candidates(t.role);
    const sameErr = t.cur.backup && t.cur.backup === t.cur.main;
    return `
    <div class="assign-row" data-i="${i}">
      <div class="assign-type">
        <h3>${t.type}</h3>
        <p>Đơn vị quản lý: ${t.role}</p>
        <div class="meta"><span class="pill">${roomCount(t.type)} phòng</span><span class="pill">${t.pending} yêu cầu đang chờ</span></div>
      </div>
      <div class="f-field ${sameErr ? 'has-error' : ''}">
        <label for="main${i}" class="sr-only">Người duyệt chính, ${t.type}</label>
        <select class="select" id="main${i}" data-k="main">${names.map(n => `<option ${n === t.cur.main ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
        <p class="help">Chỉ gồm tài khoản vai trò ${t.role} đang hoạt động.</p>
      </div>
      <div class="f-field ${sameErr ? 'has-error' : ''}">
        <label for="backup${i}" class="sr-only">Người duyệt dự phòng, ${t.type}</label>
        <select class="select" id="backup${i}" data-k="backup"><option value="">Chưa gán</option>${names.map(n => `<option ${n === t.cur.backup ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
        <p class="error">Người dự phòng phải khác người duyệt chính.</p>
        ${!t.cur.backup ? `<p class="warn-line">${icon('alert')} Chưa có người dự phòng: yêu cầu có thể bị kẹt khi người duyệt chính vắng mặt.</p>` : ''}
      </div>
    </div>`;
  }).join('');
  syncBar();
}

const isDirty = () => TYPES.some(t => t.cur.main !== t.saved.main || t.cur.backup !== t.saved.backup);
const hasError = () => TYPES.some(t => t.cur.backup && t.cur.backup === t.cur.main);

function syncBar() {
  const d = isDirty();
  $('#savebar').hidden = !d;
  $('#btnSave').disabled = hasError();
  $('#saveText').textContent = hasError() ? 'Sửa lỗi người dự phòng trước khi lưu' : 'Có thay đổi chưa lưu';
}

$('#assignRows').addEventListener('change', e => {
  const sel = e.target.closest('select'); if (!sel) return;
  const t = TYPES[Number(sel.closest('.assign-row').dataset.i)];
  t.cur[sel.dataset.k] = sel.value;
  render();
  const again = $(`#${sel.id}`); if (again) again.focus();
});

$('#btnReset').addEventListener('click', () => { TYPES.forEach(t => t.cur = { ...t.saved }); render(); });

$('#btnSave').addEventListener('click', () => {
  if (hasError()) return;
  const changed = TYPES.filter(t => t.cur.main !== t.saved.main || t.cur.backup !== t.saved.backup);
  const body = changed.map(t => {
    const rows = [];
    if (t.cur.main !== t.saved.main) rows.push(`<div class="diff"><span class="lbl">Người duyệt chính</span><span class="from">${esc(t.saved.main)}</span><span aria-hidden="true">→</span><span class="to">${esc(t.cur.main)}</span></div>`);
    if (t.cur.backup !== t.saved.backup) rows.push(`<div class="diff"><span class="lbl">Người duyệt dự phòng</span><span class="from">${esc(t.saved.backup || 'Chưa gán')}</span><span aria-hidden="true">→</span><span class="to">${esc(t.cur.backup || 'Chưa gán')}</span></div>`);
    return `<h3 class="sec" style="margin-top:0">${t.type}</h3>${rows.join('')}`;
  }).join('');
  const moved = changed.filter(t => t.cur.main !== t.saved.main).reduce((s, t) => s + t.pending, 0);
  confirmDialog({
    title: 'Lưu phân công người duyệt?', confirmText: 'Lưu phân công',
    body: `${body}${moved ? alertBox('info', `${moved} yêu cầu đang chờ sẽ chuyển sang người duyệt mới`, 'Người duyệt cũ và mới đều nhận thông báo.') : ''}`,
    onConfirm: () => {
      changed.forEach(t => t.saved = { ...t.cur });
      render();
      $('#assignBanner').innerHTML = notice('ok', '<b>Đã lưu phân công.</b> Yêu cầu đặt phòng mới sẽ tự chuyển đến người duyệt theo loại phòng. Thay đổi được ghi vào nhật ký hoạt động.', 'check');
      showToast('Đã lưu phân công người duyệt');
    }
  });
});

render();
