/* Admin · Tài khoản & phân quyền (dữ liệu mẫu, thao tác chạy trên bộ nhớ trang) */

const PAGE_SIZE = 10;
const state = { q: '', role: '', dept: '', status: '', page: 1 };

/* Đổ lựa chọn vào bộ lọc */
$('#fRole').insertAdjacentHTML('beforeend', ROLES.map(r => `<option>${r}</option>`).join(''));
$('#fDept').insertAdjacentHTML('beforeend', DEPTS.map(d => `<option>${d}</option>`).join(''));

function filtered() {
  const q = fold(state.q.trim());
  return ACCOUNTS.filter(a =>
    (!q || fold(a.name).includes(q) || fold(a.email).includes(q) || fold(a.code).includes(q)) &&
    (!state.role || a.roles.includes(state.role)) &&
    (!state.dept || a.dept === state.dept) &&
    (!state.status || (state.status === 'active') === a.active)
  );
}

function roleCell(a) {
  const shown = a.roles.slice(0, 2).map(r => `<span class="pill ${r === 'Admin' ? 'brand' : ''}">${esc(r)}</span>`).join('');
  const more = a.roles.length > 2 ? `<span class="pill more" title="${esc(a.roles.slice(2).join(', '))}">+${a.roles.length - 2}</span>` : '';
  return `<div class="role-list">${shown}${more}</div>`;
}

function render() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const slice = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

  $('#rows').innerHTML = slice.map(a => `
    <tr class="${a.active ? '' : 'is-locked'}">
      <td><div class="cell-user"><div class="avatar ${a.active ? '' : 'gray'}">${esc(initials(a.name.replace(/^(TS\.|ThS\.|PGS\.TS\.)\s*/, '')))}</div><div><b>${esc(a.name)}</b><small>${esc(a.email)}</small></div></div></td>
      <td class="nowrap">${esc(a.code)}</td>
      <td class="dept">${esc(a.dept)}</td>
      <td>${roleCell(a)}</td>
      <td>${a.active ? badge('ok', 'Hoạt động') : badge('neutral', 'Đã khóa')}</td>
      <td class="col-actions"><div class="row-actions">
        <button type="button" class="btn btn-outline btn-sm" data-act="roles" data-id="${a.id}">${icon('shield')} Phân quyền</button>
        ${a.active
          ? `<button type="button" class="btn btn-danger-outline btn-sm" data-act="lock" data-id="${a.id}">${icon('lock')} Khóa</button>`
          : `<button type="button" class="btn btn-outline btn-sm" data-act="unlock" data-id="${a.id}">${icon('unlock')} Mở khóa</button>`}
      </div></td>
    </tr>`).join('');

  $('#emptyHost').innerHTML = list.length ? '' : emptyState('Không có tài khoản khớp bộ lọc', 'Thử đổi từ khóa hoặc bỏ bớt bộ lọc.');
  $('#countText').textContent = list.length
    ? `Hiển thị ${slice.length} trong ${list.length} tài khoản${list.length !== ACCOUNTS.length ? ` (tổng ${ACCOUNTS.length})` : ''}`
    : `0 / ${ACCOUNTS.length} tài khoản`;
  renderPager($('#pager'), { page: state.page, pages, onGo: p => { state.page = p; render(); } });
}

/* ---- Bộ lọc ---- */
let qTimer;
$('#q').addEventListener('input', e => { clearTimeout(qTimer); qTimer = setTimeout(() => { state.q = e.target.value; state.page = 1; render(); }, 120); });
[['fRole', 'role'], ['fDept', 'dept'], ['fStatus', 'status']].forEach(([id, key]) =>
  $('#' + id).addEventListener('change', e => { state[key] = e.target.value; state.page = 1; render(); }));

/* ---- Hành động trên từng dòng ---- */
$('#rows').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const a = ACCOUNTS.find(x => x.id === Number(b.dataset.id));
  if (b.dataset.act === 'roles') openRoles(a);
  if (b.dataset.act === 'lock') openLock(a);
  if (b.dataset.act === 'unlock') openUnlock(a);
});

function openRoles(a) {
  const m = setModal(`
    ${mHead('Phân quyền', `${esc(a.name)} · ${esc(a.email)}`)}
    <div class="m-body">
      <p class="muted" style="margin:0 0 12px">Chọn một hoặc nhiều vai trò. Mỗi tài khoản phải có ít nhất 1 vai trò.</p>
      <p class="err" style="margin:0 0 10px" id="roleErr" role="alert" hidden>Mỗi tài khoản phải có ít nhất 1 vai trò.</p>
      <div class="check-list" id="roleList">
        ${ROLES.map((r, i) => `
          <label class="check-item"><input type="checkbox" value="${esc(r)}" ${a.roles.includes(r) ? 'checked' : ''} ${i === 0 ? 'data-autofocus' : ''}> ${esc(r)}</label>`).join('')}
      </div>
      <p class="muted" style="margin-top:12px">Người dùng nhận thông báo khi vai trò thay đổi, và thay đổi được ghi vào nhật ký hoạt động.</p>
    </div>
    ${mFoot(`<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="roleSave">Lưu phân quyền</button>`)}
  `);
  m.querySelector('#roleSave').addEventListener('click', () => {
    const picked = $$('#roleList input:checked', m).map(i => i.value);
    if (!picked.length) { $('#roleErr', m).hidden = false; return; }
    a.roles = ROLES.filter(r => picked.includes(r));
    closeModal(); render();
    showToast(`Đã cập nhật vai trò cho ${a.name}`);
  });
}

function openLock(a) {
  const warn = a.open
    ? alertBox('warn', 'Tài khoản còn lịch đặt phòng hoặc phiếu mượn chưa hoàn tất', 'Các mục này vẫn giữ nguyên và sẽ xuất hiện trong mục “Cần chú ý” trên trang Tổng quan.', 'alert')
    : '';
  confirmDialog({
    title: 'Khóa tài khoản?', sub: `${esc(a.name)} · ${esc(a.email)}`, danger: true, confirmText: 'Khóa tài khoản',
    body: `${warn}<p style="font-size:14px">Tài khoản bị khóa sẽ không đăng nhập được. Lịch sử mượn – trả và đặt phòng vẫn được giữ. Hệ thống không có chức năng xóa tài khoản.</p>`,
    onConfirm: () => { a.active = false; render(); showToast(`Đã khóa tài khoản ${a.name}`); }
  });
}
function openUnlock(a) {
  confirmDialog({
    title: 'Mở khóa tài khoản?', sub: `${esc(a.name)} · ${esc(a.email)}`, confirmText: 'Mở khóa',
    body: '<p style="font-size:14px">Người dùng sẽ đăng nhập lại được với các vai trò hiện có.</p>',
    onConfirm: () => { a.active = true; render(); showToast(`Đã mở khóa tài khoản ${a.name}`); }
  });
}

/* ---- Đồng bộ tài khoản từ email trường ---- */
const SYNC_POOL = [
  ['Mạc Tuyết Nhi', '2474801010512', 0], ['Bạch Gia Huy', '2474801060233', 1], ['Ông Thế Vinh', '2474801040419', 3]
];
let synced = false;
$('#btnSync').addEventListener('click', e => {
  const btn = e.currentTarget;
  if (btn.disabled) return;
  const label = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Đang đồng bộ...';
  setTimeout(() => {
    btn.disabled = false; btn.innerHTML = label;
    if (synced) {
      $('#syncBanner').innerHTML = notice('gray', '<b>Không có tài khoản mới.</b> Danh sách đã khớp với hệ thống email Microsoft của trường.', 'info');
    } else {
      synced = true;
      SYNC_POOL.forEach(([name, code, dept], i) => {
        const parts = name.split(' ');
        ACCOUNTS.unshift({
          id: 100 + i, name, code, dept: DEPTS[dept], roles: ['Sinh viên'], active: true, open: false,
          email: `${fold(parts[parts.length - 1])}.${code}@vanlanguni.vn`
        });
      });
      state.page = 1; render();
      $('#syncBanner').innerHTML = notice('ok', `<b>Đã thêm ${SYNC_POOL.length} tài khoản mới.</b> Vai trò mặc định là Sinh viên, bạn có thể chỉnh lại ở mục Phân quyền. Chỉ nhận email @vanlanguni.vn và đã ghi vào nhật ký hoạt động.`, 'check');
    }
  }, 1100);
});

render();
