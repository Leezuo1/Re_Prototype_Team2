/* Admin · Danh mục phòng & thiết bị (dữ liệu mẫu, thao tác chạy trên bộ nhớ trang) */

const STATUS_BADGE = { active: 'ok', maintenance: 'pending', stopped: 'neutral' };
const view = { tab: location.hash === '#devices' ? 'devices' : 'rooms', q: '', building: '', type: '', status: '' };

const statusBadge = s => badge(STATUS_BADGE[s], ROOM_STATUS[s]);
const statusOptions = () => Object.entries(ROOM_STATUS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');

/* ---------- Thanh công cụ theo từng tab ---------- */
function renderToolbar() {
  const search = `<div class="search"><svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="input" id="q" type="search" value="${esc(view.q)}" placeholder="${view.tab === 'rooms' ? 'Tìm theo mã phòng' : 'Tìm theo mã hoặc tên thiết bị'}" aria-label="Tìm kiếm"></div>`;
  const buildings = [...new Set(ROOMS.map(r => r.building))];
  $('#toolbar').innerHTML = view.tab === 'rooms'
    ? `${search}
       <select class="select" id="fBuilding" aria-label="Tòa nhà"><option value="">Tất cả tòa</option>${buildings.map(b => `<option value="${b}">Tòa ${b}</option>`).join('')}</select>
       <select class="select" id="fType" aria-label="Loại phòng"><option value="">Tất cả loại phòng</option>${ROOM_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
       <select class="select" id="fStatus" aria-label="Trạng thái"><option value="">Mọi trạng thái</option>${statusOptions()}</select>`
    : `${search}
       <select class="select" id="fStatus" aria-label="Trạng thái"><option value="">Mọi trạng thái</option>${statusOptions()}</select>`;
  ['fBuilding', 'fType', 'fStatus'].forEach(id => {
    const el = $('#' + id); if (!el) return;
    el.value = view[{ fBuilding: 'building', fType: 'type', fStatus: 'status' }[id]];
    el.addEventListener('change', () => { view[{ fBuilding: 'building', fType: 'type', fStatus: 'status' }[id]] = el.value; renderTable(); });
  });
  let t; $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { view.q = e.target.value; renderTable(); }, 120); });
}

/* ---------- Bảng ---------- */
function renderTable() {
  const q = fold(view.q.trim());
  $('#nRooms').textContent = ROOMS.length;
  $('#nDevices').textContent = DEVICES.length;

  if (view.tab === 'rooms') {
    const list = ROOMS.filter(r =>
      (!q || fold(r.code).includes(q)) && (!view.building || r.building === view.building) &&
      (!view.type || r.type === view.type) && (!view.status || r.status === view.status));
    $('#tbl').innerHTML = `
      <thead><tr><th scope="col">Mã phòng</th><th scope="col">Loại phòng</th><th scope="col" class="num">Sức chứa</th><th scope="col">Tòa – tầng</th><th scope="col">Đơn vị quản lý</th><th scope="col">Trạng thái</th><th scope="col"><span class="sr-only">Thao tác</span></th></tr></thead>
      <tbody>${list.map(r => `
        <tr class="${r.status === 'active' ? '' : 'is-locked'}">
          <td class="code">${r.code}${r.locked ? ` <span title="Đã có lịch đặt, không sửa được mã" style="color:var(--muted)">${icon('lock')}</span>` : ''}</td>
          <td>${r.type}</td><td class="num">${r.cap}</td><td>Tòa ${r.building} · Tầng ${r.floor}</td>
          <td class="dim">${ROOM_OWNER[r.type]}</td><td>${statusBadge(r.status)}</td>
          <td class="col-actions"><div class="row-actions">
            <button type="button" class="btn btn-outline btn-sm" data-act="edit" data-code="${r.code}">${icon('edit')} Sửa</button>
            <button type="button" class="btn btn-outline btn-sm" data-act="status" data-code="${r.code}">${icon('swap')} Đổi trạng thái</button>
          </div></td>
        </tr>`).join('')}</tbody>`;
    finish(list.length, ROOMS.length, 'phòng');
  } else {
    const list = DEVICES.filter(d => (!q || fold(d.code).includes(q) || fold(d.name).includes(q)) && (!view.status || d.status === view.status));
    $('#tbl').innerHTML = `
      <thead><tr><th scope="col">Mã thiết bị</th><th scope="col">Tên thiết bị</th><th scope="col">Vị trí</th><th scope="col" class="num">Số lượng</th><th scope="col">Trạng thái</th><th scope="col"><span class="sr-only">Thao tác</span></th></tr></thead>
      <tbody>${list.map(d => `
        <tr class="${d.status === 'active' ? '' : 'is-locked'}">
          <td class="code">${d.code}${d.locked ? ` <span title="Đang có phiếu mượn, không sửa được mã" style="color:var(--muted)">${icon('lock')}</span>` : ''}</td>
          <td>${esc(d.name)}</td><td>${esc(d.place)}</td><td class="num">${d.qty}</td><td>${statusBadge(d.status)}</td>
          <td class="col-actions"><div class="row-actions">
            <button type="button" class="btn btn-outline btn-sm" data-act="edit" data-code="${d.code}">${icon('edit')} Sửa</button>
            <button type="button" class="btn btn-outline btn-sm" data-act="status" data-code="${d.code}">${icon('swap')} Đổi trạng thái</button>
          </div></td>
        </tr>`).join('')}</tbody>`;
    finish(list.length, DEVICES.length, 'thiết bị');
  }
}
function finish(n, total, noun) {
  $('#emptyHost').innerHTML = n ? '' : emptyState(`Không có ${noun} khớp bộ lọc`, 'Thử đổi từ khóa hoặc bỏ bớt bộ lọc.');
  $('#countText').textContent = `Hiển thị ${n} / ${total} ${noun}`;
}

function setTab(tab) {
  view.tab = tab; view.q = ''; view.building = ''; view.type = ''; view.status = '';
  $$('#tabs button').forEach(b => { b.classList.toggle('active', b.dataset.tab === tab); b.setAttribute('aria-selected', b.dataset.tab === tab); });
  $('#btnAddText').textContent = tab === 'rooms' ? 'Thêm phòng' : 'Thêm thiết bị';
  renderToolbar(); renderTable();
}
bindTabs($('#tabs'), setTab);

$('#tbl').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const item = (view.tab === 'rooms' ? ROOMS : DEVICES).find(x => x.code === b.dataset.code);
  if (b.dataset.act === 'edit') openForm(item);
  else openStatus(item);
});
$('#btnAdd').addEventListener('click', () => openForm(null));

/* ---------- Form thêm / sửa ---------- */
function openForm(item) {
  const isRoom = view.tab === 'rooms';
  const edit = !!item;
  const locked = edit && item.locked;
  const title = `${edit ? 'Sửa' : 'Thêm'} ${isRoom ? 'phòng' : 'thiết bị'}`;
  const f = (id, label, value, extra = '') => `
    <div class="f-group"><label for="${id}">${label} *</label>
      <input type="${extra.includes('number') ? 'number' : 'text'}" id="${id}" value="${esc(value ?? '')}" ${extra}>
      <p class="err" id="${id}Err" hidden></p></div>`;
  const body = isRoom ? `
      ${locked ? alertBox('info', '', 'Phòng đã phát sinh lịch đặt nên không sửa được mã phòng.', 'lock') : ''}
      ${f('fCode', 'Mã phòng (tòa.tầng.số)', item?.code, `placeholder="VD J.06.04" ${locked ? 'readonly' : ''} ${locked ? '' : 'data-autofocus'}`)}
      <div class="f-row">
        <div class="f-group"><label for="fT">Loại phòng *</label><select id="fT">${ROOM_TYPES.map(t => `<option ${item?.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        ${f('fCap', 'Sức chứa', item?.cap, 'min="1" inputmode="numeric" number')}
      </div>` : `
      ${locked ? alertBox('info', '', 'Thiết bị đang có phiếu mượn nên không sửa được mã thiết bị.', 'lock') : ''}
      ${f('fCode', 'Mã thiết bị', item?.code, `placeholder="VD TB-0015" ${locked ? 'readonly' : ''} ${locked ? '' : 'data-autofocus'}`)}
      ${f('fName', 'Tên thiết bị', item?.name, '')}
      <div class="f-row">
        ${f('fPlace', 'Vị trí / kho', item?.place, '')}
        ${f('fQty', 'Số lượng', item?.qty, 'min="1" inputmode="numeric" number')}
      </div>`;
  const m = setModal(`
    ${mHead(title, edit ? item.code : 'Điền đủ các trường bắt buộc.')}
    <div class="m-body">${body}</div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="fSave">Lưu</button>')}`);

  const setErr = (id, msg) => { const p = $('#' + id + 'Err', m); const inp = $('#' + id, m); p.hidden = !msg; p.textContent = msg || ''; inp.classList.toggle('invalid', !!msg); return !!msg; };
  $('#fSave', m).addEventListener('click', () => {
    let bad = false;
    const code = $('#fCode', m).value.trim().toUpperCase();
    const all = isRoom ? ROOMS : DEVICES;
    if (!edit || !locked) {
      if (isRoom) bad = setErr('fCode', !code ? 'Vui lòng nhập mã phòng.' : !/^[A-Z]\.\d{2}\.\d{2}$/.test(code) ? 'Mã phòng phải có dạng tòa.tầng.số, ví dụ J.06.04.' : all.some(x => x.code === code && x !== item) ? 'Mã đã tồn tại.' : '') || bad;
      else bad = setErr('fCode', !code ? 'Vui lòng nhập mã thiết bị.' : all.some(x => x.code === code && x !== item) ? 'Mã đã tồn tại.' : '') || bad;
    }
    const posInt = v => /^\d+$/.test(v) && Number(v) > 0;
    if (isRoom) {
      bad = setErr('fCap', posInt($('#fCap', m).value) ? '' : 'Sức chứa phải là số nguyên dương.') || bad;
    } else {
      bad = setErr('fName', $('#fName', m).value.trim() ? '' : 'Vui lòng nhập tên thiết bị.') || bad;
      bad = setErr('fPlace', $('#fPlace', m).value.trim() ? '' : 'Vui lòng nhập vị trí hoặc kho.') || bad;
      bad = setErr('fQty', posInt($('#fQty', m).value) ? '' : 'Số lượng phải là số nguyên dương.') || bad;
    }
    if (bad) { $('.invalid', m)?.focus(); return; }

    if (isRoom) {
      const next = { code, type: $('#fT', m).value, cap: Number($('#fCap', m).value) };
      if (edit) Object.assign(item, next);
      else ROOMS.unshift({ ...next, building: code[0], floor: Number(code.split('.')[1]), status: 'active', future: 0, locked: false });
    } else {
      const next = { code, name: $('#fName', m).value.trim(), place: $('#fPlace', m).value.trim(), qty: Number($('#fQty', m).value) };
      if (edit) Object.assign(item, next);
      else DEVICES.unshift({ ...next, status: 'active', locked: false });
    }
    closeModal(); renderTable();
    showToast(edit ? `Đã cập nhật ${code}` : `Đã thêm ${code} vào danh mục`);
  });
}

/* ---------- Đổi trạng thái ---------- */
function openStatus(item) {
  const isRoom = view.tab === 'rooms';
  const m = setModal(`
    ${mHead('Đổi trạng thái', `${item.code}${isRoom ? '' : ' · ' + esc(item.name)}`)}
    <div class="m-body">
      <div class="check-list" id="stList">
        ${Object.entries(ROOM_STATUS).map(([k, v]) => `<label class="check-item"><input type="radio" name="st" value="${k}" ${item.status === k ? 'checked' : ''}> ${v}<small>${k === 'active' ? 'Hiện trong tìm phòng, cho đặt / mượn' : k === 'maintenance' ? 'Ẩn khỏi tìm kiếm và cho mượn' : 'Ẩn khỏi tìm kiếm và cho mượn'}</small></label>`).join('')}
      </div>
      <div id="stWarn" style="margin-top:14px"></div>
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="stSave">Cập nhật</button>')}`);
  const showWarn = () => {
    const v = $('#stList input:checked', m).value;
    const affected = isRoom && v !== 'active' && v !== item.status ? item.future : 0;
    $('#stWarn', m).innerHTML = affected
      ? alertBox('warn', `${affected} lịch đặt trong tương lai bị ảnh hưởng`, 'Người đã đặt sẽ nhận thông báo. Các lịch này không bị xóa, chỉ chuyển trạng thái phòng.', 'alert')
      : (!isRoom && v !== 'active' && v !== item.status ? alertBox('info', '', 'Thiết bị ở trạng thái này không cho mượn nữa. Phiếu đang mượn không bị ảnh hưởng.') : '');
  };
  $('#stList', m).addEventListener('change', showWarn);
  $('#stSave', m).addEventListener('click', () => {
    const v = $('#stList input:checked', m).value;
    item.status = v; closeModal(); renderTable();
    showToast(`${item.code} chuyển sang “${ROOM_STATUS[v]}”`);
  });
}

/* ---------- Import Excel ---------- */
const IMPORT_ERRORS = [
  { row: 12, code: 'J.06.4', reason: 'Sai định dạng mã phòng (cần tòa.tầng.số)' },
  { row: 19, code: 'A.02.03', reason: 'Mã đã tồn tại' },
  { row: 27, code: 'K.03.01', reason: 'Thiếu trường bắt buộc: sức chứa' },
  { row: 31, code: 'B.02.07', reason: 'Mã đã tồn tại' }
];
$('#btnImport').addEventListener('click', () => {
  let picked = null;
  const m = setModal('', '', true);
  const draw = () => {
    m.innerHTML = `
      ${mHead('Import danh mục từ Excel', 'Chỉ nhận file .xlsx hoặc .xls đúng theo file mẫu.')}
      <div class="m-body">
        <button type="button" class="drop-lg ${picked ? 'has' : ''}" id="pick" data-autofocus>
          ${icon(picked ? 'sheet' : 'upload')}
          <span>${picked ? picked.name : 'Chọn file Excel hoặc kéo thả vào đây'}</span>
          <small>${picked ? `${picked.size} · sẵn sàng import` : 'Cột phòng: mã phòng, loại phòng, sức chứa, tòa, tầng · Cột thiết bị: mã, tên, vị trí, số lượng'}</small>
        </button>
        <p class="muted" style="margin-top:12px">Dòng hợp lệ vẫn được nhập. Dòng lỗi được liệt kê để bạn tải về sửa và import lại.</p>
      </div>
      ${mFoot(`<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="go" ${picked ? '' : 'disabled'}>Import</button>`)}`;
    m.querySelector('[data-close]').addEventListener('click', closeModal);
    m.querySelector('.m-x').addEventListener('click', closeModal);
    m.querySelector('#pick').addEventListener('click', () => { picked = { name: 'danh-muc-hoc-ky-1-2026.xlsx', size: '38 KB · 50 dòng' }; draw(); m.querySelector('#go').focus(); });
    m.querySelector('#go').addEventListener('click', e => {
      const btn = e.currentTarget; btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Đang kiểm tra...';
      setTimeout(result, 900);
    });
  };
  const result = () => {
    m.innerHTML = `
      ${mHead('Kết quả import', picked.name)}
      <div class="m-body">
        ${alertBox('ok', '46 dòng thành công', 'Các dòng hợp lệ đã được thêm vào danh mục.', 'check')}
        ${alertBox('err', `${IMPORT_ERRORS.length} dòng lỗi chưa được nhập`, 'Tải file lỗi, sửa rồi import lại.', 'alert')}
        <div class="tbl-wrap" style="border:1px solid var(--border);border-radius:12px">
          <table class="tbl"><thead><tr><th scope="col" class="num">Dòng</th><th scope="col">Mã</th><th scope="col">Lý do lỗi</th></tr></thead>
          <tbody>${IMPORT_ERRORS.map(e => `<tr><td class="num">${e.row}</td><td class="code">${e.code}</td><td>${e.reason}</td></tr>`).join('')}</tbody></table>
        </div>
      </div>
      ${mFoot(`<button type="button" class="btn btn-outline" id="dlErr">${icon('download')} Tải file dòng lỗi</button><button type="button" class="btn btn-primary" data-close>Xong</button>`)}`;
    m.querySelector('[data-close]').addEventListener('click', () => { closeModal(); $('#importBanner').innerHTML = notice('ok', '<b>Đã import 46 dòng, 4 dòng lỗi.</b> Thao tác được ghi vào nhật ký hoạt động.', 'check'); });
    m.querySelector('.m-x').addEventListener('click', closeModal);
    m.querySelector('#dlErr').addEventListener('click', () => showToast('Đã tải file dòng lỗi (mẫu)'));
  };
  draw();
});
$('#btnTemplate').addEventListener('click', e => fakeExport(e.currentTarget, 'Đã tải file mẫu danh-muc-mau.xlsx (mẫu)'));

setTab(view.tab);
