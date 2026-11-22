/* Người quản lý phòng · Lịch phòng theo ngày (dữ liệu mẫu, thao tác chạy trên bộ nhớ trang) */

const H0 = 7, H1 = 21;            // trục giờ 07:00 – 21:00
const KIND_LABEL = { class: 'Lịch học', loan: 'Lịch mượn', event: 'Sự kiện của trường', makeup: 'Dạy bù', pending: 'Chờ duyệt' };
const cv = { date: TODAY, building: '', type: '', onlyFree: false, from: '09:00', to: '11:00' };
const EXTRA = {};                  // lịch thêm theo `${ngày}|${phòng}`
const HIDDEN = new Set();          // lịch bị hủy / dời theo `${ngày}|${id}`
let uid = 0;

const t2s = t => `${String(Math.floor(t)).padStart(2, '0')}:${t % 1 ? '30' : '00'}`;
const s2t = s => { const [h, m] = s.split(':').map(Number); return h + m / 60; };
const dayIdx = iso => new Date(iso + 'T00:00:00').getDay();

/* Các khối lịch của một phòng trong một ngày */
function blocksOn(date, room) {
  const base = (DAY_SCHEDULE[room] || []).map((b, i) => ({ id: `${room}|${i}`, room, s: b[0], e: b[1], kind: b[2], title: b[3], sub: b[4], base: true }));
  const ri = ROOMS.findIndex(r => r.code === room);
  const visible = base.filter((b, i) => {
    if (HIDDEN.has(`${date}|${b.id}`)) return false;
    if (b.kind === 'pending') return date >= TODAY;
    if (dayIdx(date) === 0) return b.kind === 'event';          // Chủ nhật: chỉ còn sự kiện
    if (date === TODAY) return true;
    return (dayIdx(date) + ri + i) % 4 !== 0;                   // các ngày khác: lịch mẫu thưa hơn
  });
  return visible.concat((EXTRA[`${date}|${room}`] || []).filter(b => !HIDDEN.has(`${date}|${b.id}`)));
}
const overlaps = (list, s, e, skipId) => list.filter(b => b.id !== skipId && b.kind !== 'pending' && s < b.e && e > b.s);
const anyOverlap = (list, s, e) => list.some(b => s < b.e && e > b.s);

function visibleRooms() {
  let rooms = ROOMS.filter(r => r.status === 'active' && (!cv.type || r.type === cv.type) && (!cv.building || r.building === cv.building));
  if (cv.onlyFree) {
    const s = s2t(cv.from), e = s2t(cv.to);
    rooms = rooms.filter(r => !anyOverlap(blocksOn(cv.date, r.code), s, e));
  }
  return rooms;
}

/* ---------- Vẽ ---------- */
function weekOf(iso) {
  const d = dayIdx(iso); const mon = addDays(iso, d === 0 ? -6 : 1 - d);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}
const SHORT = ['CN', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

function renderBar() {
  $('#dayLabel').textContent = `${weekdayOf(cv.date)}, ${fmtDate(cv.date)}`;
  $('#dayTabs').innerHTML = weekOf(cv.date).map(d => `
    <button type="button" class="day-tab ${d === cv.date ? 'active' : ''}" role="tab" aria-selected="${d === cv.date}" data-d="${d}">
      <b>${fmtDate(d).slice(0, 5)}</b>${SHORT[dayIdx(d)]}${d === TODAY ? ' · Hôm nay' : ''}
    </button>`).join('');
  $('#freeBar').hidden = !cv.onlyFree;
  $('#typeChips').innerHTML = [['', 'Tất cả loại phòng'], ...ROOM_TYPES.map(t => [t, t])].map(([v, l]) =>
    `<button type="button" class="chip ${cv.type === v ? 'active' : ''}" data-v="${v}" aria-pressed="${cv.type === v}">${l}</button>`).join('');
}

function renderGantt() {
  const rooms = visibleRooms();
  const hours = Array.from({ length: H1 - H0 }, (_, i) => `<span>${String(H0 + i).padStart(2, '0')}:00</span>`).join('');
  const rows = rooms.map(r => {
    const bars = blocksOn(cv.date, r.code).map(b => {
      const left = (b.s - H0) / (H1 - H0) * 100, w = (b.e - b.s) / (H1 - H0) * 100;
      return `<button type="button" class="g-bar ${b.kind}" style="left:${left}%;width:${w}%" data-room="${r.code}" data-id="${b.id}" title="${esc(b.title)} · ${t2s(b.s)}–${t2s(b.e)}">${esc(b.title)}<small>${t2s(b.s)}–${t2s(b.e)} · ${esc(b.sub)}</small></button>`;
    }).join('');
    return `<div class="g-row"><div class="g-label"><b>${r.code}</b><small>${r.type} · ${r.cap} chỗ</small></div><div class="g-track">${bars}</div></div>`;
  }).join('');
  const off = ROOMS.filter(r => r.status !== 'active' && (!cv.type || r.type === cv.type) && (!cv.building || r.building === cv.building)).length;
  $('#gantt').innerHTML = `
    <div class="g-row g-head"><div class="g-label">Phòng</div><div class="g-hours">${hours}</div></div>
    ${rows || `<div class="g-row" style="display:block">${emptyState('Không có phòng trống trong khung giờ này', 'Thử chọn khung giờ khác hoặc bỏ chọn “Chỉ hiện phòng trống”.', 'calendar')}</div>`}
    ${off ? `<div class="table-foot"><span>${off} phòng đang bảo trì hoặc ngưng sử dụng không hiển thị trên lịch.</span></div>` : ''}`;
}
const redraw = () => { renderBar(); renderGantt(); };

/* ---------- Điều hướng ---------- */
$('#prevDay').addEventListener('click', () => { cv.date = addDays(cv.date, -1); redraw(); });
$('#nextDay').addEventListener('click', () => { cv.date = addDays(cv.date, 1); redraw(); });
$('#btnToday').addEventListener('click', () => { cv.date = TODAY; redraw(); });
$('#dayTabs').addEventListener('click', e => { const b = e.target.closest('.day-tab'); if (b) { cv.date = b.dataset.d; redraw(); } });
bindChips($('#typeChips'), v => { cv.type = v; redraw(); });
[...new Set(ROOMS.map(r => r.building))].forEach(b => $('#fBuilding').insertAdjacentHTML('beforeend', `<option value="${b}">Tòa ${b}</option>`));
$('#fBuilding').addEventListener('change', e => { cv.building = e.target.value; redraw(); });
$('#onlyFree').addEventListener('change', e => { cv.onlyFree = e.target.checked; redraw(); });
$('#freeFrom').addEventListener('change', e => { cv.from = e.target.value; renderGantt(); });
$('#freeTo').addEventListener('change', e => { cv.to = e.target.value; renderGantt(); });

/* ---------- Chi tiết một ô lịch (ngăn bên phải) ---------- */
$('#gantt').addEventListener('click', e => {
  const bar = e.target.closest('.g-bar'); if (!bar) return;
  const b = blocksOn(cv.date, bar.dataset.room).find(x => x.id === bar.dataset.id);
  if (b) openBlock(b);
});

function openBlock(b) {
  const editable = b.kind === 'loan' || b.kind === 'event' || b.kind === 'makeup';
  const foot = editable
    ? `<button type="button" class="btn btn-danger-outline" id="bCancel">Hủy lịch</button><button type="button" class="btn btn-primary" id="bMove">Đổi lịch</button>`
    : b.kind === 'pending'
      ? `<a class="btn btn-primary" href="manager-requests.html">Mở yêu cầu để duyệt</a>`
      : `<button type="button" class="btn btn-outline" data-close>Đóng</button>`;
  const m = setModal(`
    ${mHead(esc(b.title), `${b.room} · ${weekdayOf(cv.date)}, ${fmtDate(cv.date)}`)}
    <div class="m-body">
      <div style="margin-bottom:14px">${badge(b.kind === 'pending' ? 'pending' : b.kind === 'class' ? 'info' : b.kind === 'loan' ? 'soon' : b.kind === 'makeup' ? 'ok' : 'neutral', KIND_LABEL[b.kind])}</div>
      <dl class="dl" style="margin-bottom:0">
        <div><dt>Thời gian</dt><dd>${t2s(b.s)} – ${t2s(b.e)}</dd></div>
        <div><dt>Phòng</dt><dd>${b.room} · ${ROOMS.find(r => r.code === b.room).type}</dd></div>
        <div class="full"><dt>${b.kind === 'class' || b.kind === 'makeup' ? 'Giảng viên' : 'Người mượn / đơn vị'}</dt><dd>${esc(b.sub)}</dd></div>
      </dl>
      ${b.kind === 'class' ? `<div style="margin-top:16px">${alertBox('gray', '', 'Lịch học đến từ thời khóa biểu và được ưu tiên hơn lịch mượn. Muốn thay đổi, nhập lại thời khóa biểu ở mục Thời khóa biểu.', 'info')}</div>` : ''}
    </div>
    <div class="m-foot">${foot}</div>`, 'drawer');
  if (editable) {
    m.querySelector('#bCancel').addEventListener('click', () => reasonDialog({
      title: 'Hủy lịch đã duyệt', sub: `${esc(b.title)} · ${b.room} · ${t2s(b.s)}–${t2s(b.e)}`, label: 'Lý do hủy', confirmText: 'Hủy lịch', placeholder: 'Người mượn sẽ nhận thông báo kèm lý do này',
      onConfirm: () => { HIDDEN.add(`${cv.date}|${b.id}`); renderGantt(); showToast('Đã hủy lịch, phòng được giải phóng ngay'); }
    }));
    m.querySelector('#bMove').addEventListener('click', () => openMove(b));
  }
}

function openMove(b) {
  const type = ROOMS.find(r => r.code === b.room).type;
  const rooms = ROOMS.filter(r => r.type === type && r.status === 'active');
  const m = setModal(`
    ${mHead('Đổi lịch', `${esc(b.title)} · hiện tại ${b.room} · ${t2s(b.s)}–${t2s(b.e)}`)}
    <div class="m-body">
      <div id="mvWarn"></div>
      <div class="f-group"><label for="mvRoom">Phòng *</label><select id="mvRoom">${rooms.map(r => `<option ${r.code === b.room ? 'selected' : ''}>${r.code}</option>`).join('')}</select></div>
      <div class="f-row">
        <div class="f-group"><label for="mvS">Từ giờ *</label><input type="time" id="mvS" step="1800" value="${t2s(b.s)}"></div>
        <div class="f-group"><label for="mvE">Đến giờ *</label><input type="time" id="mvE" step="1800" value="${t2s(b.e)}"></div>
      </div>
      <div class="f-group"><label for="mvWhy">Lý do đổi lịch *</label><textarea id="mvWhy" placeholder="Người mượn sẽ nhận thông báo kèm lý do này"></textarea></div>
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="mvOk">Đổi lịch</button>')}`);
  $('#mvOk', m).addEventListener('click', () => {
    const room = $('#mvRoom', m).value, s = s2t($('#mvS', m).value || '0:0'), e = s2t($('#mvE', m).value || '0:0'), why = $('#mvWhy', m).value.trim();
    const warn = msg => { $('#mvWarn', m).innerHTML = alertBox('err', '', msg, 'alert'); };
    if (!$('#mvS', m).value || !$('#mvE', m).value || e <= s) return warn('Giờ kết thúc phải sau giờ bắt đầu.');
    if (s < H0 || e > H1) return warn('Chỉ đổi trong khung 07:00 – 21:00.');
    const hit = overlaps(blocksOn(cv.date, room), s, e, b.id);
    if (hit.length) return warn(`${room} đã có lịch trong khung giờ này: ${esc(hit[0].title)} (${t2s(hit[0].s)} – ${t2s(hit[0].e)}). Chỉ chọn được phòng và giờ còn trống.`);
    if (!why) { $('#mvWhy', m).classList.add('invalid'); return warn('Vui lòng nhập lý do đổi lịch.'); }
    HIDDEN.add(`${cv.date}|${b.id}`);
    (EXTRA[`${cv.date}|${room}`] = EXTRA[`${cv.date}|${room}`] || []).push({ ...b, id: 'x' + (++uid), room, s, e, base: false });
    closeModal(); renderGantt();
    showToast(`Đã đổi lịch sang ${room}, ${t2s(s)}–${t2s(e)}`);
  });
}

/* ---------- Giữ chỗ phòng cho sự kiện / họp định kỳ của trường ---------- */
$('#btnHold').addEventListener('click', () => {
  let confirmedConflict = false;
  const types = ROOM_TYPES;
  const m = setModal(`
    ${mHead('Giữ chỗ phòng', 'Khung giờ giữ chỗ hiển thị là sự kiện của trường và không cho người khác đặt.')}
    <div class="m-body">
      <div id="hWarn"></div>
      <div class="f-row">
        <div class="f-group"><label for="hType">Loại phòng *</label><select id="hType">${types.map(t => `<option ${t === 'Phòng họp' ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="f-group"><label for="hRoom">Phòng *</label><select id="hRoom"></select></div>
      </div>
      <div class="f-row">
        <div class="f-group"><label for="hDate">Ngày *</label><input type="date" id="hDate" value="${cv.date}"></div>
        <div class="f-row" style="gap:8px">
          <div class="f-group"><label for="hS">Từ *</label><input type="time" id="hS" step="1800" value="09:00"></div>
          <div class="f-group"><label for="hE">Đến *</label><input type="time" id="hE" step="1800" value="10:30"></div>
        </div>
      </div>
      <div class="f-group"><label for="hName">Tên sự kiện / cuộc họp *</label><input type="text" id="hName" placeholder="VD Họp giao ban tuần"><p class="err" id="hNameErr" hidden>Vui lòng nhập tên.</p></div>
      <div class="f-group"><label for="hUnit">Đơn vị tổ chức *</label><input type="text" id="hUnit" placeholder="VD Phòng CSVC"><p class="err" id="hUnitErr" hidden>Vui lòng nhập đơn vị.</p></div>
      <label class="check-item" style="margin-bottom:10px"><input type="checkbox" id="hRep"> Lặp lại hằng tuần <small>họp định kỳ</small></label>
      <div class="f-group" id="hRepWrap" hidden><label for="hUntil">Lặp đến ngày *</label><input type="date" id="hUntil" value="${addDays(cv.date, 28)}"></div>
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="hOk">Giữ chỗ</button>')}`);
  const fillRooms = () => { $('#hRoom', m).innerHTML = ROOMS.filter(r => r.type === $('#hType', m).value && r.status === 'active').map(r => `<option>${r.code}</option>`).join(''); };
  fillRooms();
  $('#hType', m).addEventListener('change', () => { fillRooms(); reset(); });
  $('#hRep', m).addEventListener('change', e => { $('#hRepWrap', m).hidden = !e.target.checked; reset(); });
  const reset = () => { confirmedConflict = false; $('#hOk', m).textContent = 'Giữ chỗ'; $('#hWarn', m).innerHTML = ''; };
  ['hRoom', 'hDate', 'hS', 'hE', 'hUntil'].forEach(id => $('#' + id, m).addEventListener('change', reset));

  $('#hOk', m).addEventListener('click', () => {
    const name = $('#hName', m).value.trim(), unit = $('#hUnit', m).value.trim();
    let bad = false;
    [['hName', name], ['hUnit', unit]].forEach(([id, v]) => { $('#' + id + 'Err', m).hidden = !!v; $('#' + id, m).classList.toggle('invalid', !v); bad = bad || !v; });
    const room = $('#hRoom', m).value, date = $('#hDate', m).value, s = s2t($('#hS', m).value || '0:0'), e = s2t($('#hE', m).value || '0:0');
    const warn = msg => { $('#hWarn', m).innerHTML = alertBox('err', '', msg, 'alert'); };
    if (bad) return;
    if (!date || !$('#hS', m).value || !$('#hE', m).value || e <= s) return warn('Giờ kết thúc phải sau giờ bắt đầu.');
    if (s < H0 || e > H1) return warn('Chỉ giữ chỗ trong khung 07:00 – 21:00.');
    const dates = [date];
    if ($('#hRep', m).checked) {
      const until = $('#hUntil', m).value;
      if (!until || until < date) return warn('Ngày kết thúc lặp phải sau hoặc bằng ngày bắt đầu.');
      for (let d = addDays(date, 7); d <= until && dates.length < 26; d = addDays(d, 7)) dates.push(d);
    }
    const hits = dates.map(d => [d, overlaps(blocksOn(d, room), s, e)]).filter(([, h]) => h.length);
    if (hits.length && !confirmedConflict) {
      confirmedConflict = true; $('#hOk', m).textContent = 'Vẫn giữ chỗ';
      $('#hWarn', m).innerHTML = alertBox('warn', `${hits.length} buổi trùng lịch hiện có`,
        hits.slice(0, 4).map(([d, h]) => `${fmtDate(d)}: ${esc(h[0].title)} (${t2s(h[0].s)}–${t2s(h[0].e)})`).join('<br>') + (hits.length > 4 ? `<br>… và ${hits.length - 4} buổi khác` : '') + '<br>Bấm “Vẫn giữ chỗ” để giữ chỗ và thông báo người mượn bị ảnh hưởng.', 'alert');
      return;
    }
    dates.forEach(d => (EXTRA[`${d}|${room}`] = EXTRA[`${d}|${room}`] || []).push({ id: 'x' + (++uid), room, s, e, kind: 'event', title: name, sub: $('#hRep', m).checked ? `Họp định kỳ · ${unit}` : `Sự kiện của trường · ${unit}`, base: false }));
    closeModal(); cv.date = date; redraw();
    showToast(dates.length > 1 ? `Đã giữ chỗ ${room} cho ${dates.length} buổi` : `Đã giữ chỗ ${room} ngày ${fmtDate(date)}`);
  });
});

redraw();
