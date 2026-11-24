/* Phòng CSVC · Danh mục phòng & thiết bị theo cơ sở
   PB-38 xem và lọc · PB-39 thêm mới · PB-40 sửa · PB-41 đổi trạng thái · PB-42 điều chuyển thiết bị
   Dữ liệu mẫu, thao tác chạy trên bộ nhớ trang */

const STATUS_BADGE = { active: 'ok', maintenance: 'pending', stopped: 'neutral' };
const statusBadge = s => badge(STATUS_BADGE[s], ROOM_STATUS[s]);
const view = { tab: location.hash === '#devices' ? 'devices' : 'rooms', campus: '', q: '', building: '', type: '', status: '' };
const DEVICE_LOANS = {
  'TB-0001': [['Lê Hoài An', 2, '25/11/2026'], ['Lý Tuấn Kiệt', 1, '24/11/2026']],
  'TB-0002': [['ThS. Lê Quốc Bảo', 4, '23/11/2026']],
  'TB-0004': [['Lê Hoài An', 2, '21/11/2026']],
  'TB-0006': [['TS. Nguyễn Văn Phúc', 5, '23/11/2026']]
};
let nextDeviceNo = 15;

const listOf = tab => (tab === 'rooms' ? ROOMS : DEVICES);
const buildingsOf = campus => [...new Set(ROOMS.filter(r => !campus || r.campus === campus).map(r => r.building))].sort();
/* Vị trí có thể chọn trong một cơ sở: kho theo tòa + từng phòng */
function placesOf(campus) {
  const bs = buildingsOf(campus);
  return [...bs.map(b => `Kho CSVC – Tòa ${b}`), ...ROOMS.filter(r => r.campus === campus).map(r => r.code)];
}
const logChange = (item, text) => { (item.log = item.log || []).unshift({ at: `${NOW_TIME} · ${fmtDate(TODAY)}`, text: `${text} · ${ME}` }); };

/* ---------- Dải chọn cơ sở + tab ---------- */
function renderCampus() {
  const counts = countBy(listOf(view.tab));
  $('#campusHost').innerHTML = campusChipsHtml(view.campus, counts);
  $('#nRooms').textContent = ROOMS.length;
  $('#nDevices').textContent = DEVICES.length;
}
bindChips($('#campusHost'), v => { view.campus = v; view.building = ''; renderCampus(); renderToolbar(); renderTable(); });

/* ---------- Thanh công cụ ---------- */
function statusOptions() { return Object.entries(ROOM_STATUS).map(([k, v]) => `<option value="${k}">${v}</option>`).join(''); }
function renderToolbar() {
  const search = `<div class="search"><svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="input" id="q" type="search" value="${esc(view.q)}" placeholder="${view.tab === 'rooms' ? 'Tìm theo mã phòng' : 'Tìm theo mã hoặc tên thiết bị'}" aria-label="Tìm kiếm"></div>`;
  $('#toolbar').innerHTML = view.tab === 'rooms'
    ? `${search}
       <select class="select" id="fBuilding" aria-label="Tòa nhà"><option value="">Tất cả tòa</option>${buildingsOf(view.campus).map(b => `<option value="${b}">Tòa ${b}</option>`).join('')}</select>
       <select class="select" id="fType" aria-label="Loại phòng"><option value="">Tất cả loại phòng</option>${ROOM_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
       <select class="select" id="fStatus" aria-label="Trạng thái"><option value="">Mọi trạng thái</option>${statusOptions()}</select>`
    : `${search}
       <select class="select" id="fStatus" aria-label="Trạng thái"><option value="">Mọi trạng thái</option>${statusOptions()}</select>`;
  const map = { fBuilding: 'building', fType: 'type', fStatus: 'status' };
  Object.keys(map).forEach(id => {
    const el = $('#' + id); if (!el) return;
    el.value = view[map[id]];
    el.addEventListener('change', () => { view[map[id]] = el.value; renderTable(); });
  });
  let t; $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { view.q = e.target.value; renderTable(); }, 120); });
}

/* ---------- Bảng ---------- */
function filtered() {
  const q = fold(view.q.trim());
  if (view.tab === 'rooms') {
    return ROOMS.filter(r => (!q || fold(r.code).includes(q)) && (!view.campus || r.campus === view.campus) && (!view.building || r.building === view.building) &&
      (!view.type || r.type === view.type) && (!view.status || r.status === view.status));
  }
  return DEVICES.filter(d => (!q || fold(d.code).includes(q) || fold(d.name).includes(q)) && (!view.campus || d.campus === view.campus) && (!view.status || d.status === view.status));
}
function renderTable() {
  const list = filtered();
  const rooms = view.tab === 'rooms';
  const lockIc = t => ` <span title="${t}" style="color:var(--muted)">${icon('lock')}</span>`;
  $('#tbl').innerHTML = rooms ? `
    <thead><tr><th scope="col">Mã phòng</th><th scope="col">Loại phòng</th><th scope="col" class="num">Sức chứa</th><th scope="col">Cơ sở</th><th scope="col">Tòa – tầng</th><th scope="col">Trạng thái</th><th scope="col"><span class="sr-only">Thao tác</span></th></tr></thead>
    <tbody>${list.map(r => `
      <tr class="${r.status === 'active' ? '' : 'is-locked'}">
        <td class="code"><button type="button" class="link-btn" data-act="view" data-code="${r.code}">${r.code}</button>${r.locked ? lockIc('Đã có lịch đặt, không sửa được mã') : ''}</td>
        <td>${r.type}</td><td class="num">${r.cap}</td><td>${CAMPUS_NAME[r.campus]}</td><td>Tòa ${r.building} · Tầng ${r.floor}</td><td>${statusBadge(r.status)}</td>
        <td class="col-actions"><div class="row-actions">
          <button type="button" class="btn btn-outline btn-sm" data-act="edit" data-code="${r.code}">${icon('edit')} Sửa</button>
          <button type="button" class="btn btn-outline btn-sm" data-act="status" data-code="${r.code}">${icon('swap')} Đổi trạng thái</button>
        </div></td>
      </tr>`).join('')}</tbody>` : `
    <thead><tr><th scope="col">Mã thiết bị</th><th scope="col">Tên thiết bị</th><th scope="col">Phòng / kho</th><th scope="col">Cơ sở</th><th scope="col" class="num">Số lượng</th><th scope="col" class="num">Đang mượn</th><th scope="col">Trạng thái</th><th scope="col"><span class="sr-only">Thao tác</span></th></tr></thead>
    <tbody>${list.map(d => `
      <tr class="${d.status === 'active' ? '' : 'is-locked'}">
        <td class="code"><button type="button" class="link-btn" data-act="view" data-code="${d.code}">${d.code}</button></td>
        <td>${esc(d.name)}</td><td>${esc(d.place)}</td><td>${CAMPUS_NAME[d.campus]}</td><td class="num">${d.qty}</td><td class="num">${d.lent || '–'}</td><td>${statusBadge(d.status)}</td>
        <td class="col-actions"><div class="row-actions">
          <button type="button" class="btn btn-outline btn-sm" data-act="edit" data-code="${d.code}">${icon('edit')} Sửa</button>
          <button type="button" class="btn btn-outline btn-sm" data-act="status" data-code="${d.code}">${icon('swap')} Đổi trạng thái</button>
          <button type="button" class="btn btn-outline btn-sm" data-act="move" data-code="${d.code}">${icon('mapPin')} Điều chuyển</button>
        </div></td>
      </tr>`).join('')}</tbody>`;
  const noun = rooms ? 'phòng' : 'thiết bị';
  $('#emptyHost').innerHTML = list.length ? '' : emptyState(`Không có ${noun} khớp bộ lọc`, 'Thử đổi từ khóa, đổi cơ sở hoặc bỏ bớt bộ lọc.');
  $('#countText').textContent = `Hiển thị ${list.length} / ${listOf(view.tab).length} ${noun}`;
}

function setTab(tab) {
  view.tab = tab; view.q = ''; view.building = ''; view.type = ''; view.status = '';
  $$('#tabs button').forEach(b => { b.classList.toggle('active', b.dataset.tab === tab); b.setAttribute('aria-selected', b.dataset.tab === tab); });
  renderCampus(); renderToolbar(); renderTable();
}
bindTabs($('#tabs'), setTab);

$('#tbl').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const item = listOf(view.tab).find(x => x.code === b.dataset.code);
  ({ view: openDetail, edit: openForm, status: openStatus, move: openTransfer })[b.dataset.act](item);
});
$('#btnAdd').addEventListener('click', () => openForm(null));

/* ---------- Ngăn chi tiết (PB-38) ---------- */
function dayLine(code) {
  const segs = DAY_SCHEDULE[code] || [];
  const a = 7, b = 18, kind = { class: 'class', makeup: 'class', loan: 'loan', event: 'event', pending: 'req' };
  const bars = segs.map(([s, e, k, title]) => `<div class="seg-b ${kind[k]}" style="left:${(s - a) / (b - a) * 100}%;width:${(e - s) / (b - a) * 100}%" title="${esc(title)} · ${hm(s)} – ${hm(e)}">${esc(title)}</div>`).join('');
  const ticks = [7, 9, 11, 13, 15, 17].map(h => `<span style="left:${(h - a) / (b - a) * 100}%">${h}h</span>`).join('');
  return `<div class="day-line" role="img" aria-label="Lịch sử dụng phòng ${code} hôm nay">${bars}</div><div class="day-ticks">${ticks}</div>
    ${segs.length ? `<ul class="pair-list" style="margin-top:12px">${segs.map(([s, e, k, title, who]) => `<li><span>${esc(title)}<br><small>${esc(who)}</small></span><span>${hm(s)} – ${hm(e)}</span></li>`).join('')}</ul>` : '<p class="muted" style="margin-top:10px">Hôm nay chưa có lịch sử dụng.</p>'}`;
}
function openDetail(item) {
  const isRoom = view.tab === 'rooms';
  let body;
  if (isRoom) {
    const devs = DEVICES.filter(d => d.place === item.code);
    body = `
      <dl class="dl">
        <div><dt>Loại phòng</dt><dd>${item.type}</dd></div><div><dt>Sức chứa</dt><dd>${item.cap} người</dd></div>
        <div><dt>Cơ sở</dt><dd>${CAMPUS_NAME[item.campus]}</dd></div><div><dt>Tòa – tầng</dt><dd>Tòa ${item.building} · Tầng ${item.floor}</dd></div>
        <div><dt>Đơn vị duyệt</dt><dd>${ROOM_OWNER[item.type]}</dd></div><div><dt>Lịch đặt sắp tới</dt><dd>${item.future} lịch</dd></div>
        ${item.note ? `<div class="full"><dt>Ghi chú</dt><dd>${esc(item.note)}</dd></div>` : ''}
      </dl>
      <h3 class="sect-title">Thiết bị có sẵn trong phòng</h3>
      ${devs.length ? `<ul class="pair-list">${devs.map(d => `<li class="${d.status === 'active' ? '' : 'bad'}"><span>${esc(d.name)} <small>${d.code}</small></span>${statusBadge(d.status)}</li>`).join('')}</ul>` : '<p class="muted">Không có thiết bị gắn cố định. Thiết bị mượn thêm lấy từ kho.</p>'}
      <h3 class="sect-title">Lịch sử dụng hôm nay <small>${fmtDate(TODAY)}</small></h3>
      ${dayLine(item.code)}`;
  } else {
    const loans = DEVICE_LOANS[item.code] || [];
    const incs = INCIDENTS.filter(i => i.place === item.place && fold(item.name).includes(fold(i.target.split(' ')[0])));
    body = `
      <dl class="dl">
        <div><dt>Tên thiết bị</dt><dd>${esc(item.name)}</dd></div><div><dt>Phòng / kho</dt><dd>${esc(item.place)}</dd></div>
        <div><dt>Cơ sở</dt><dd>${CAMPUS_NAME[item.campus]}</dd></div><div><dt>Số lượng</dt><dd>${item.qty} (khả dụng ${Math.max(0, item.qty - item.lent)})</dd></div>
        ${item.note ? `<div class="full"><dt>Ghi chú</dt><dd>${esc(item.note)}</dd></div>` : ''}
      </dl>
      <h3 class="sect-title">Người đang mượn</h3>
      ${loans.length ? `<ul class="pair-list">${loans.map(([n, q, due]) => `<li><span>${esc(n)} <small>× ${q}</small></span><small>hẹn trả ${due}</small></li>`).join('')}</ul>` : '<p class="muted">Hiện không có ai đang mượn.</p>'}
      <h3 class="sect-title">Lịch sử mượn – trả</h3>
      <ul class="log"><li><time>22/11/2026</time><span>Lý Tuấn Kiệt trả đủ, tình trạng bình thường</span></li><li><time>20/11/2026</time><span>ThS. Mai Thị Lan trả đủ, tình trạng bình thường</span></li></ul>
      <h3 class="sect-title">Sự cố</h3>
      ${incs.length ? `<ul class="pair-list">${incs.map(i => `<li><span>${i.code} · ${esc(i.desc)}</span>${badge(INC_BADGE[i.status], INC_TEXT[i.status])}</li>`).join('')}</ul>` : '<p class="muted">Chưa có sự cố nào được ghi nhận.</p>'}
      <h3 class="sect-title">Lịch sử điều chuyển</h3>
      ${item.moves.length ? `<ul class="log">${item.moves.map(m => `<li><time>${m.at}</time><span>${m.qty} chiếc: ${esc(m.from)} → ${esc(m.to)}<br><small class="muted">${esc(m.by)} · ${esc(m.reason)}</small></span></li>`).join('')}</ul>` : '<p class="muted">Chưa có lần điều chuyển nào.</p>'}`;
  }
  const hist = (item.log || []).length ? `<h3 class="sect-title">Nhật ký thay đổi</h3><ul class="log">${item.log.map(l => `<li><time>${l.at}</time><span>${esc(l.text)}</span></li>`).join('')}</ul>` : '';
  setModal(`
    ${mHead(`${item.code}${isRoom ? '' : ' · ' + esc(item.name)}`, `${isRoom ? 'Phòng' : 'Thiết bị'} · ${CAMPUS_NAME[item.campus]}`)}
    <div class="m-body">${statusBadge(item.status)}<div style="margin-top:16px">${body}${hist}</div></div>
    ${mFoot(`<button type="button" class="btn btn-outline" data-close>Đóng</button>`)}`, 'drawer');
}

/* ---------- Thêm / sửa (PB-39, PB-40) ---------- */
function openForm(item) {
  const isRoom = view.tab === 'rooms';
  const edit = !!item;
  const campusSel = (sel, dis) => `<select id="fCampus" ${dis ? 'disabled' : ''}>${CAMPUSES.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.name}</option>`).join('')}</select>`;
  const field = (id, label, value, extra = '', help = '') => `
    <div class="f-group"><label for="${id}">${label}</label>
      <input type="${extra.includes('number') ? 'number' : 'text'}" id="${id}" value="${esc(value ?? '')}" ${extra.replace('number', '')}>
      ${help ? `<p class="muted" style="font-size:12px;margin-top:4px">${help}</p>` : ''}<p class="err" id="${id}Err" hidden></p></div>`;
  const note = `<div class="f-group"><label for="fNote">Ghi chú (không bắt buộc)</label><textarea id="fNote">${esc(item?.note || '')}</textarea></div>`;
  let body;
  if (isRoom) {
    body = edit ? `
      ${alertBox('info', '', 'Mã phòng và cơ sở không sửa trực tiếp.', 'lock')}
      <div class="f-row"><div class="f-group"><label for="fCode">Mã phòng</label><input type="text" id="fCode" value="${item.code}" readonly></div>
        <div class="f-group"><label for="fCampus">Cơ sở</label>${campusSel(item.campus, true)}</div></div>
      <div class="f-row"><div class="f-group"><label for="fT">Loại phòng *</label><select id="fT">${ROOM_TYPES.map(t => `<option ${item.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        ${field('fCap', 'Sức chứa *', item.cap, 'min="1" inputmode="numeric" number')}</div>
      ${field('fFloor', 'Tầng *', item.floor, 'min="1" inputmode="numeric" number', `Tòa ${item.building}`)}
      ${note}` : `
      <div class="f-group"><label for="fCampus">Cơ sở *</label>${campusSel(view.campus || 'cs1')}</div>
      ${field('fCode', 'Mã phòng (tòa.tầng.số) *', '', 'placeholder="VD J.06.04" data-autofocus')}
      <div class="f-row"><div class="f-group"><label for="fT">Loại phòng *</label><select id="fT">${ROOM_TYPES.map(t => `<option>${t}</option>`).join('')}</select></div>
        ${field('fCap', 'Sức chứa *', '', 'min="1" inputmode="numeric" number')}</div>
      ${note}`;
  } else {
    body = edit ? `
      ${alertBox('info', '', 'Mã thiết bị, cơ sở và vị trí không sửa trực tiếp. Muốn đổi vị trí, dùng chức năng Điều chuyển.', 'lock')}
      <div class="f-row"><div class="f-group"><label for="fCode">Mã thiết bị</label><input type="text" id="fCode" value="${item.code}" readonly></div>
        <div class="f-group"><label for="fCampus">Cơ sở</label>${campusSel(item.campus, true)}</div></div>
      ${field('fName', 'Tên thiết bị *', item.name, 'data-autofocus')}
      ${field('fQty', 'Số lượng *', item.qty, 'min="1" inputmode="numeric" number', item.lent ? `Đang cho mượn ${item.lent}, số lượng mới không được thấp hơn.` : '')}
      ${note}` : `
      <div class="f-group"><label for="fCampus">Cơ sở *</label>${campusSel(view.campus || 'cs1')}</div>
      ${field('fCode', 'Mã thiết bị *', '', `placeholder="VD TB-${String(nextDeviceNo).padStart(4, '0')}" data-autofocus`)}
      ${field('fName', 'Tên thiết bị *', '')}
      <div class="f-row"><div class="f-group"><label for="fPlace">Phòng hoặc kho *</label><select id="fPlace"></select></div>
        ${field('fQty', 'Số lượng *', '', 'min="1" inputmode="numeric" number')}</div>
      ${note}`;
  }
  const m = setModal(`
    ${mHead(`${edit ? 'Sửa' : 'Thêm'} ${isRoom ? 'phòng' : 'thiết bị'}`, edit ? item.code : 'Điền đủ các trường có dấu *.')}
    <div class="m-body">${body}</div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="fSave">Lưu</button>')}`);

  const fillPlaces = () => { const s = $('#fPlace', m); if (s) s.innerHTML = placesOf($('#fCampus', m).value).map(p => `<option>${p}</option>`).join(''); };
  if (!isRoom && !edit) { fillPlaces(); $('#fCampus', m).addEventListener('change', fillPlaces); }

  const setErr = (id, msg) => { const p = $('#' + id + 'Err', m), inp = $('#' + id, m); p.hidden = !msg; p.textContent = msg || ''; inp.classList.toggle('invalid', !!msg); return !!msg; };
  const posInt = v => /^\d+$/.test(v) && Number(v) > 0;
  $('#fSave', m).addEventListener('click', () => {
    let bad = false;
    const code = $('#fCode', m).value.trim().toUpperCase();
    if (!edit) {
      bad = setErr('fCode', isRoom
        ? (!code ? 'Vui lòng nhập mã phòng.' : !/^[A-Z]\.\d{2}\.\d{2}$/.test(code) ? 'Mã phòng phải có dạng tòa.tầng.số, ví dụ J.06.04.' : ROOMS.some(x => x.code === code) ? 'Mã đã tồn tại.' : '')
        : (!code ? 'Vui lòng nhập mã thiết bị.' : DEVICES.some(x => x.code === code) ? 'Mã đã tồn tại.' : '')) || bad;
    }
    if (isRoom) {
      bad = setErr('fCap', posInt($('#fCap', m).value) ? '' : 'Sức chứa phải là số nguyên dương.') || bad;
      if (edit) bad = setErr('fFloor', posInt($('#fFloor', m).value) ? '' : 'Tầng phải là số nguyên dương.') || bad;
    } else {
      bad = setErr('fName', $('#fName', m).value.trim() ? '' : 'Vui lòng nhập tên thiết bị.') || bad;
      const qv = $('#fQty', m).value;
      bad = setErr('fQty', !posInt(qv) ? 'Số lượng phải là số nguyên dương.' : (edit && Number(qv) < item.lent ? `Số lượng không được thấp hơn số đang cho mượn (${item.lent}).` : '')) || bad;
    }
    if (bad) { $('.invalid', m)?.focus(); return; }

    const note = $('#fNote', m).value.trim();
    if (isRoom) {
      if (edit) { Object.assign(item, { type: $('#fT', m).value, cap: Number($('#fCap', m).value), floor: Number($('#fFloor', m).value), note }); logChange(item, 'Sửa thông tin phòng'); }
      else {
        ROOMS.unshift({ code, type: $('#fT', m).value, cap: Number($('#fCap', m).value), building: code[0], floor: Number(code.split('.')[1]), status: 'active', future: 0, locked: false, campus: $('#fCampus', m).value, note, log: [] });
        logChange(ROOMS[0], 'Thêm phòng mới');
      }
    } else if (edit) {
      Object.assign(item, { name: $('#fName', m).value.trim(), qty: Number($('#fQty', m).value), note }); logChange(item, 'Sửa thông tin thiết bị');
    } else {
      const d = { code, name: $('#fName', m).value.trim(), place: $('#fPlace', m).value, qty: Number($('#fQty', m).value), status: 'active', locked: false, campus: $('#fCampus', m).value, lent: 0, note, moves: [], log: [] };
      DEVICES.unshift(d); nextDeviceNo++; logChange(d, 'Thêm thiết bị mới');
    }
    closeModal(); renderCampus(); renderTable();
    showToast(edit ? `Đã cập nhật ${code}` : `Đã thêm ${code} vào danh mục`);
  });
}

/* ---------- Đổi trạng thái (PB-41) ---------- */
function affectedList(item, isRoom) {
  if (isRoom) {
    const rows = (DAY_SCHEDULE[item.code] || []).filter(s => s[2] !== 'event').slice(0, 3).map(s => `${esc(s[3])} · ${hm(s[0])} – ${hm(s[1])}`);
    const more = Math.max(0, item.future - rows.length);
    return `<ul class="pair-list" style="margin-top:8px">${rows.map(r => `<li>${r}</li>`).join('')}${more ? `<li><small>và ${more} lịch khác trong các ngày tới</small></li>` : ''}</ul>`;
  }
  return `<ul class="pair-list" style="margin-top:8px">${(DEVICE_LOANS[item.code] || []).map(([n, q, due]) => `<li>${esc(n)} · ${q} chiếc <small>hẹn trả ${due}</small></li>`).join('')}</ul>`;
}
function openStatus(item) {
  const isRoom = view.tab === 'rooms';
  const m = setModal(`
    ${mHead('Đổi trạng thái', `${item.code}${isRoom ? '' : ' · ' + esc(item.name)}`)}
    <div class="m-body">
      <div class="check-list" id="stList">
        ${Object.entries(ROOM_STATUS).map(([k, v]) => `<label class="check-item"><input type="radio" name="st" value="${k}" ${item.status === k ? 'checked' : ''}> ${v}<small>${k === 'active' ? 'Hiện trong tìm phòng, cho đặt / mượn' : 'Ẩn khỏi tìm kiếm và không cho đặt / mượn'}</small></label>`).join('')}
      </div>
      <div id="stWarn" style="margin-top:14px"></div>
      <div class="f-group" id="stReasonBox" style="margin-top:14px" hidden>
        <label for="stReason">Lý do *</label><textarea id="stReason" placeholder="VD Điều hòa hỏng, chờ kỹ thuật sửa."></textarea>
        <p class="err" id="stReasonErr" hidden>Vui lòng nhập lý do khi chuyển sang trạng thái này.</p>
      </div>
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="stSave">Cập nhật</button>')}`);
  const cur = () => $('#stList input:checked', m).value;
  const refresh = () => {
    const v = cur(), changing = v !== item.status, off = v !== 'active';
    const n = isRoom ? item.future : (DEVICE_LOANS[item.code] || []).length;
    $('#stReasonBox', m).hidden = !(off && changing);
    $('#stWarn', m).innerHTML = off && changing && n
      ? alertBox('warn', isRoom ? `${item.future} lịch đặt bị ảnh hưởng` : `${n} phiếu mượn đang mở`, `Người đặt, người mượn sẽ nhận thông báo. Không xóa lịch hay phiếu, chỉ chuyển trạng thái. ${affectedList(item, isRoom)}`, 'alert')
      : (off && changing ? alertBox('info', '', 'Chưa có lịch hay phiếu nào bị ảnh hưởng.') : '');
  };
  $('#stList', m).addEventListener('change', refresh);
  $('#stSave', m).addEventListener('click', () => {
    const v = cur();
    if (v === item.status) { closeModal(); return; }
    if (v !== 'active' && !$('#stReason', m).value.trim()) {
      $('#stReasonErr', m).hidden = false; $('#stReason', m).classList.add('invalid'); $('#stReason', m).focus(); return;
    }
    const reason = $('#stReason', m).value.trim();
    item.status = v; logChange(item, `Đổi trạng thái sang ${ROOM_STATUS[v]}${reason ? ': ' + reason : ''}`);
    closeModal(); renderTable();
    showToast(`${item.code} chuyển sang “${ROOM_STATUS[v]}”`);
  });
}

/* ---------- Điều chuyển thiết bị (PB-42) ---------- */
function openTransfer(item) {
  const avail = Math.max(0, item.qty - item.lent);
  if (item.status !== 'active') {
    setModal(`${mHead('Không điều chuyển được', `${item.code} · ${esc(item.name)}`)}
      <div class="m-body">${alertBox('warn', 'Thiết bị đang hỏng hoặc ngưng sử dụng', `Thiết bị ở trạng thái “${ROOM_STATUS[item.status]}” không được điều chuyển. Hãy đưa về “Hoạt động” sau khi xử lý xong.`, 'alert')}</div>
      ${mFoot('<button type="button" class="btn btn-primary" data-close>Đã hiểu</button>')}`);
    return;
  }
  if (!avail) {
    setModal(`${mHead('Không điều chuyển được', `${item.code} · ${esc(item.name)}`)}
      <div class="m-body">${alertBox('warn', 'Toàn bộ thiết bị đang cho mượn', `Cả ${item.lent} chiếc đang có người mượn. Chờ thiết bị được trả rồi điều chuyển.`, 'alert')}</div>
      ${mFoot('<button type="button" class="btn btn-primary" data-close>Đã hiểu</button>')}`);
    return;
  }
  let qty = 1;
  const m = setModal(`
    ${mHead('Điều chuyển thiết bị', `${item.code} · ${esc(item.name)} · đang ở ${esc(item.place)}`)}
    <div class="m-body">
      ${item.lent ? alertBox('info', '', `Đang cho mượn ${item.lent} chiếc, chỉ điều chuyển được tối đa ${avail} chiếc khả dụng.`) : ''}
      <div class="f-row">
        <div class="f-group"><label for="tCampus">Cơ sở đích *</label><select id="tCampus">${CAMPUSES.map(c => `<option value="${c.id}" ${c.id === item.campus ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
        <div class="f-group"><label for="tPlace">Phòng hoặc kho đích *</label><select id="tPlace"></select></div>
      </div>
      <div class="f-group"><label>Số lượng điều chuyển * <span class="muted" style="font-weight:400">(tối đa ${avail})</span></label>${qtyHtml('tQty', 1, avail)}</div>
      <div class="f-group"><label for="tReason">Lý do *</label><textarea id="tReason" placeholder="VD Cân đối thiết bị cho Cơ sở 3."></textarea><p class="err" id="tErr" hidden></p></div>
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="tSave">Xác nhận điều chuyển</button>')}`);
  const fill = () => {
    $('#tPlace', m).innerHTML = placesOf($('#tCampus', m).value).filter(p => p !== item.place).map(p => `<option>${p}</option>`).join('');
  };
  fill(); $('#tCampus', m).addEventListener('change', fill);
  bindQty(m, (_, v) => { qty = v; });
  qty = 1;
  $('#tSave', m).addEventListener('click', () => {
    const err = $('#tErr', m);
    const reason = $('#tReason', m).value.trim();
    const msg = !$('#tPlace', m).value ? 'Chọn phòng hoặc kho đích.' : qty < 1 ? 'Số lượng điều chuyển phải từ 1 trở lên.' : !reason ? 'Vui lòng nhập lý do điều chuyển.' : '';
    err.hidden = !msg; err.textContent = msg;
    if (msg) { $('#tReason', m).classList.toggle('invalid', !reason); return; }
    const to = $('#tPlace', m).value, toCampus = $('#tCampus', m).value, from = item.place;
    const move = { at: `${NOW_TIME} · ${fmtDate(TODAY)}`, from: `${from} (${CAMPUS_NAME[item.campus]})`, to: `${to} (${CAMPUS_NAME[toCampus]})`, qty, by: ME, reason };
    if (qty === item.qty) { item.place = to; item.campus = toCampus; item.moves.unshift(move); }
    else {
      item.qty -= qty; item.moves.unshift(move);
      const code = 'TB-' + String(nextDeviceNo++).padStart(4, '0');
      DEVICES.unshift({ code, name: item.name, place: to, qty, status: 'active', locked: false, campus: toCampus, lent: 0, note: '', moves: [{ ...move }], log: [] });
    }
    logChange(item, `Điều chuyển ${qty} chiếc sang ${to}`);
    closeModal(); renderCampus(); renderTable();
    showToast(`Đã điều chuyển ${qty} chiếc ${item.name} sang ${to}`);
  });
}

setTab(view.tab);
