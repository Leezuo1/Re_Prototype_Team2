/* ===== Khung modal dùng chung ===== */
// variant = 'drawer' => ngăn trượt từ bên phải (dùng cho chi tiết đơn)
function setModal(html, variant = '') {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="overlay ${variant}"><div class="modal ${variant}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">${html}</div></div>`;
  document.body.classList.add('no-scroll');
  root.querySelector('.overlay').addEventListener('mousedown', e => {
    if (e.target.classList.contains('overlay')) closeModal();
  });
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  const dialog = root.querySelector('.modal');
  trapDialog(dialog, closeModal);
  return dialog;
}

function closeModal() {
  if (typeof dialogCleanup === 'function') dialogCleanup();
  document.getElementById('modalRoot').innerHTML = '';
  document.body.classList.remove('no-scroll');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

const mHead = (title, sub) => `
  <div class="m-head">
    <div><h2 id="modalTitle">${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>
    <button type="button" class="m-x" data-close aria-label="Đóng">${icon('x')}</button>
  </div>`;
const mFoot = (html, cls = '') => `<div class="m-foot ${cls}">${html}</div>`;
const val = id => document.getElementById(id).value;
const getOrder = code => ORDERS.find(o => o.code === code);
const nextCode = () => 'MT' + (Math.max(...ORDERS.map(o => Number(o.code.slice(2)))) + 1);

function sumBox(title, o, extra) {
  return `
    <div class="sum">
      <h3>${title}</h3>
      <p>${icon('calendar')} ${fmtDate(o.date)}</p>
      <p>${icon('clock')} ${o.start} – ${o.end}</p>
      ${extra ? `<small>${extra}</small>` : ''}
    </div>`;
}

/* =====================================================
   1. ĐẶT PHÒNG
   ===================================================== */
const ROOM_TYPES = ['Phòng học', 'Hội trường', 'Phòng họp'];

function openBooking(roomName) {
  const r = getRoom(roomName);
  renderBooking({
    type: r.type, room: r.name, purpose: '',
    date: val('fDate'), start: val('fStart'), end: val('fEnd'),
    file: null, errors: {}, conflict: null
  });
}

function renderBooking(st) {
  const r = getRoom(st.room);
  const rooms = ROOMS.filter(x => x.type === st.type);
  const needFile = st.type === 'Hội trường';
  const e = st.errors;

  const dropHtml = st.file
    ? `<button type="button" class="drop has" id="bDrop" aria-labelledby="bFileLabel bDropText" aria-describedby="${e.file ? 'bFileHint bFileError' : 'bFileHint'}" aria-invalid="${e.file ? 'true' : 'false'}">${icon('file')}<span class="drop-copy"><span id="bDropText">Đổi tệp: ${esc(st.file.name)}</span><small id="bFileHint">${esc(st.file.ext)} · ${st.file.size} MB · Đã tải lên</small></span></button>`
    : `<button type="button" class="drop ${e.file ? 'invalid' : ''}" id="bDrop" aria-labelledby="bFileLabel bDropText" aria-describedby="${e.file ? 'bFileHint bFileError' : 'bFileHint'}" aria-invalid="${e.file ? 'true' : 'false'}">${icon('upload')}<span class="drop-copy"><span id="bDropText">Nhấn để tải lên hoặc kéo thả tệp</span><small id="bFileHint">PDF, DOC, DOCX · Tối đa 10 MB</small></span></button>`;

  const m = setModal(`
    ${mHead('Đặt phòng', `${r.name} · ${r.cap} chỗ · ${r.building}, ${r.floor.toLowerCase()}`)}
    <div class="m-body">
      ${st.conflict ? alertBox('err', 'Khung giờ vừa được đặt',
          `${st.room} có lịch trùng ${st.conflict.slot.start} – ${st.conflict.slot.end}, ngày ${fmtDate(st.date)}. Vui lòng chọn thời gian khác.`) : ''}
      ${e.time ? alertBox('err', '', e.time) : ''}

      <div class="f-group" role="group" aria-labelledby="bTypeLabel">
        <label id="bTypeLabel">Loại phòng *</label>
        <div class="seg">
          ${ROOM_TYPES.map(t => `<button type="button" class="${t === st.type ? 'active' : ''}" aria-pressed="${t === st.type}" data-type="${t}">${t}</button>`).join('')}
        </div>
      </div>

      <div class="f-group">
        <label for="bRoom">Phòng *</label>
        <select id="bRoom">
          ${rooms.map(x => `<option value="${x.name}" ${x.name === st.room ? 'selected' : ''}>${x.name}</option>`).join('')}
        </select>
      </div>

      <div class="f-group">
        <label for="bPurpose">Mục đích sử dụng *</label>
        <textarea id="bPurpose" class="${e.purpose ? 'invalid' : ''}" aria-invalid="${e.purpose ? 'true' : 'false'}" ${e.purpose ? 'aria-describedby="bPurposeError"' : ''} required placeholder="Nhập mục đích sử dụng phòng">${esc(st.purpose)}</textarea>
        ${e.purpose ? `<p class="err" id="bPurposeError" role="alert">${e.purpose}</p>` : ''}
      </div>

      <div class="f-group">
        <label for="bDate">Ngày mượn *</label>
        <input type="date" id="bDate" value="${esc(st.date)}" required>
      </div>

      <div class="f-row">
        <div class="f-group"><label for="bStart">Giờ bắt đầu *</label><input type="time" id="bStart" value="${esc(st.start)}" required></div>
        <div class="f-group"><label for="bEnd">Giờ kết thúc *</label><input type="time" id="bEnd" value="${esc(st.end)}" required></div>
      </div>

      ${needFile ? `
        <div class="f-group">
          <label id="bFileLabel" for="bFile">Tệp quyết định phê duyệt *</label>
          ${dropHtml}
          <input type="file" id="bFile" accept=".pdf,.doc,.docx" hidden>
          ${e.file ? `<p class="err" id="bFileError" role="alert">${e.file}</p>` : ''}
        </div>` : ''}

      ${st.conflict && st.conflict.free
        ? alertBox('info', `Khung giờ còn trống: ${st.conflict.free}`, 'Đổi giờ bắt đầu và kết thúc trước khi gửi lại.', 'info') : ''}
      ${alertBox('brand', 'Hệ thống tự chuyển đơn đến đúng bộ phận duyệt', '', 'info')}
      <p class="req-note">* Thông tin bắt buộc. Lịch trống được kiểm tra khi gửi yêu cầu.</p>
    </div>
    ${mFoot(`
      <button type="button" class="btn btn-outline" data-close>Quay lại</button>
      <button type="button" class="btn btn-primary" id="bSubmit">${st.conflict ? 'Kiểm tra & gửi lại' : 'Gửi yêu cầu'}</button>`)}
  `);

  // Đổi loại phòng / phòng
  m.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => {
    st.type = b.dataset.type;
    st.room = ROOMS.find(x => x.type === st.type).name;
    st.conflict = null;
    renderBooking(st);
  }));
  m.querySelector('#bRoom').addEventListener('change', ev => { st.room = ev.target.value; st.conflict = null; renderBooking(st); });

  // Lưu giá trị đang nhập
  m.querySelector('#bPurpose').addEventListener('input', ev => { st.purpose = ev.target.value; });
  m.querySelector('#bDate').addEventListener('change', ev => { st.date = ev.target.value; });
  m.querySelector('#bStart').addEventListener('change', ev => { st.start = ev.target.value; });
  m.querySelector('#bEnd').addEventListener('change', ev => { st.end = ev.target.value; });

  // Tải tệp
  if (needFile) {
    const input = m.querySelector('#bFile'), drop = m.querySelector('#bDrop');
    const takeFile = f => {
      if (!f) return;
      const ext = f.name.split('.').pop().toUpperCase();
      if (!['PDF', 'DOC', 'DOCX'].includes(ext)) {
        st.file = null;
        st.errors.file = 'Chỉ nhận tệp PDF, DOC hoặc DOCX.';
        renderBooking(st);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        st.file = null;
        st.errors.file = 'Tệp vượt quá giới hạn 10 MB.';
        renderBooking(st);
        return;
      }
      st.file = { name: f.name, ext, size: (f.size / 1024 / 1024).toFixed(1).replace('.', ',') };
      delete st.errors.file;
      renderBooking(st);
    };
    drop.addEventListener('click', () => input.click());
    input.addEventListener('change', () => takeFile(input.files[0]));
    drop.addEventListener('dragover', ev => ev.preventDefault());
    drop.addEventListener('drop', ev => { ev.preventDefault(); takeFile(ev.dataTransfer.files[0]); });
  }

  // Gửi yêu cầu
  const sendBtn = m.querySelector('#bSubmit');
  sendBtn.addEventListener('click', () => submitBooking(st, needFile, sendBtn));
}

function submitBooking(st, needFile, btn) {
  st.errors = {};
  st.conflict = null;
  if (!st.purpose.trim()) st.errors.purpose = 'Vui lòng nhập mục đích sử dụng.';
  if (needFile && !st.file) st.errors.file = 'Vui lòng tải tệp quyết định phê duyệt.';
  if (!st.date || !st.start || !st.end || toMin(st.end) <= toMin(st.start)) {
    st.errors.time = 'Vui lòng chọn ngày và giờ hợp lệ (giờ kết thúc phải sau giờ bắt đầu).';
  }
  if (Object.keys(st.errors).length) return renderBooking(st);

  // Thông tin đủ -> khóa nút, hiện loading rồi gửi (mô phỏng máy chủ)
  submitWithLoading(btn, () => {
    // Kiểm tra trùng lịch tại thời điểm gửi
    const c = findConflict(st.room, st.date, st.start, st.end);
    if (c) {
      const dur = toMin(st.end) - toMin(st.start);
      const fs = c.end, fe = toTime(toMin(c.end) + dur);
      st.conflict = { slot: c, free: findConflict(st.room, st.date, fs, fe) ? null : `${fs} – ${fe}` };
      return renderBooking(st);
    }

    const code = nextCode();
    ORDERS.unshift({
      code, room: st.room, date: st.date, start: st.start, end: st.end,
      purpose: st.purpose.trim(), status: 'pending', sent: '10:52', file: st.file ? st.file.name : null
    });
    closeModal();
    highlightCode = code;
    setOrderFilter('all');
    renderRooms();
    showOrderBanner('ok', 'Gửi yêu cầu thành công', `Đơn #${code} đã được thêm vào Đơn của tôi.`);
  });
}

/* =====================================================
   2. THEO DÕI YÊU CẦU (chi tiết đơn)
   flash: kết quả vừa thực hiện { type: 'reschedule', old: {...} }
   ===================================================== */
function timeline(o) {
  const lg = logOf(o), d = fmtDate(TODAY);
  const step = (cls, ic, title, sub) =>
    `<li class="${cls}"><span class="dot">${ic ? icon(ic) : ''}</span><div><b>${title}</b><small>${sub}</small></div></li>`;
  let items = step('done', 'check', 'Đã gửi', `${d} · ${lg.sent}`);
  if (o.status === 'pending') {
    items += step('done', 'clock', 'Đang xét duyệt', 'Yêu cầu đang được xử lý');
    items += step('todo', '', 'Đã duyệt / Bị từ chối', 'Bạn sẽ nhận được thông báo kết quả');
  } else {
    items += step('done', 'check', 'Đang xét duyệt', `${d} · ${lg.review}`);
    items += o.status === 'rejected'
      ? step('bad', 'x', 'Bị từ chối', `${d} · ${lg.result}`)
      : step('done', 'check', 'Đã duyệt', `${d} · ${lg.result}`);
  }
  return `<h4 class="sec">Tiến trình yêu cầu</h4><ol class="tl">${items}</ol>`;
}

function openDetail(code, flash) {
  const o = getOrder(code);
  const r = getRoom(o.room);
  const isOk = o.status === 'approved' || o.status === 'soon';
  const lg = logOf(o);

  let sub = `#${o.code} · Gửi lúc ${lg.sent}, ${fmtDate(TODAY)}`;
  if (flash && flash.type === 'reschedule') sub = `#${o.code} · Lịch mượn đã được cập nhật`;

  let body = '';
  if (flash && flash.type === 'reschedule') {
    body += alertBox('ok', 'Đổi lịch thành công', `Đơn #${o.code} đã được cập nhật sang ${o.room}.`, 'check');
  }

  body += `<div class="status-line"><span class="badge ${STATUS_CLASS[o.status]}">${STATUS_TEXT[o.status]}</span></div>`;

  if (isOk && !flash) {
    body += alertBox('ok', 'Lịch mượn đã được xác nhận', `Phòng ${o.room} đã được giữ cho bạn theo thời gian bên dưới.`, 'check');
  }

  body += sumBox(`${o.room} · ${r.type}`, o, `${esc(o.purpose)} · ${r.cap} chỗ`);

  if (o.file) {
    body += `<div class="file-row">${icon('file')} ${esc(o.file)}</div>`;
  }
  if (o.status === 'rejected') {
    body += alertBox('err', 'Lý do từ chối', esc(o.reason || 'Không có lý do cụ thể.'));
  }

  if (isOk) {
    body += `<div class="kv"><p><b>Mã xác nhận: ${o.code}</b></p><p>Người mượn: Nguyễn Đình Thuần</p><p>${r.eq}</p></div>`;
  }
  if (flash && flash.type === 'reschedule') {
    const old = flash.old;
    body += `<hr class="line"><h4 class="sec">Thay đổi vừa thực hiện</h4>`;
    body += old.room !== o.room
      ? `<div class="chg muted"><span>${old.room}</span><span>→</span><b>${o.room}</b></div>`
      : `<p class="muted">Giữ nguyên phòng ${o.room}</p>`;
    body += old.date !== o.date
      ? `<p class="muted">Ngày ${fmtShort(old.date)} → ${fmtShort(o.date)}</p>`
      : `<p class="muted">Giữ nguyên ngày ${fmtShort(o.date)}</p>`;
    body += (old.start !== o.start || old.end !== o.end)
      ? `<p class="muted">Thời gian ${old.start} – ${old.end} → ${o.start} – ${o.end}</p>`
      : `<p class="muted">Giữ nguyên thời gian ${o.start} – ${o.end}</p>`;
    body += alertBox('ok', 'Lịch cũ đã được giải phóng', `${old.room} · ${fmtDate(old.date)} · ${old.start} – ${old.end}`, 'check');
  } else if (o.status !== 'cancelled') {
    body += `<hr class="line">`;
  }

  if (o.status === 'cancelled') {
    body += alertBox('gray', '', 'Không còn lịch mượn cho yêu cầu này.', 'info');
  } else {
    body += timeline(o);
  }

  if (o.status === 'pending') body += alertBox('brand', 'Hệ thống tự chuyển đơn đến đúng bộ phận duyệt', '', 'info');
  if (isOk) body += alertBox('brand', 'Nhận và trả phòng trực tiếp tại Phòng CSVC', 'Vui lòng cung cấp mã xác nhận khi nhận phòng.', 'info');
  if (o.status === 'rejected') {
    body += `<hr class="line"><h4 class="sec">Tìm một khung giờ phù hợp hơn</h4>
             <p class="muted">Chọn lại để trở về bộ lọc Tìm phòng. Điều chỉnh ngày, giờ hoặc sức chứa và gửi một yêu cầu mới.</p>`;
    body += alertBox('info', 'Đơn này không giữ phòng', 'Chỉ các phòng còn trống trong thời gian mới được hiển thị.', 'info');
  }

  let foot = '';
  if (o.status === 'approved') foot = mFoot(`<button class="btn btn-outline" id="dCancel">Hủy lịch</button><button class="btn btn-primary" id="dResched">${icon('calendar')} Đổi lịch</button>`);
  else if (o.status === 'soon') foot = mFoot('<button class="btn btn-outline" data-close>Đóng</button>', 'full');
  else if (o.status === 'rejected') foot = mFoot(`<button class="btn btn-primary" id="dRetry">${icon('search')} Chọn lại phòng/thời gian</button>`, 'full');
  else if (o.status === 'cancelled') foot = mFoot('<button class="btn btn-outline" data-close>Đóng</button>', 'full');

  const m = setModal(`${mHead('Chi tiết yêu cầu', sub)}<div class="m-body">${body}</div>${foot}`, 'drawer');

  const on = (id, fn) => { const el = m.querySelector(id); if (el) el.addEventListener('click', fn); };
  on('#dCancel', () => openCancel(o.code));
  on('#dResched', () => openReschedule(o.code));
  on('#dRetry', () => { closeModal(); reSearchFrom(o); });
}

/* =====================================================
   3. ĐỔI LỊCH
   ===================================================== */
function openReschedule(code) {
  const o = getOrder(code);
  renderReschedule(o, { date: o.date, start: o.start, end: o.end, room: null });
}

function renderReschedule(o, st) {
  const validTime = st.date && st.start && st.end && toMin(st.end) > toMin(st.start);
  const same = st.date === o.date && st.start === o.start && st.end === o.end;
  const list = validTime
    ? ROOMS.filter(r => !findConflict(r.name, st.date, st.start, st.end, o.code) && !(same && r.name === o.room))
    : [];
  if (!list.find(r => r.name === st.room)) st.room = list.length ? list[0].name : null;
  const pick = st.room ? getRoom(st.room) : null;

  const m = setModal(`
    ${mHead('Đổi lịch mượn phòng', `Đơn #${o.code} · ${esc(o.purpose)}`)}
    <div class="m-body">
      ${sumBox(`Lịch hiện tại · ${o.room}`, o)}
      <hr class="line">
      <h4 class="sec">Lịch mượn mới</h4>
      <div class="f-group"><label>Ngày mượn mới *</label><input type="date" id="rDate" value="${st.date}"></div>
      <div class="f-row">
        <div class="f-group"><label>Giờ bắt đầu *</label><input type="time" id="rStart" value="${st.start}"></div>
        <div class="f-group"><label>Giờ kết thúc *</label><input type="time" id="rEnd" value="${st.end}"></div>
      </div>
      ${!validTime ? alertBox('err', '', 'Giờ kết thúc phải sau giờ bắt đầu.') : ''}
      <div class="f-group">
        <label>Phòng còn trống *</label>
        <select id="rRoom" ${list.length ? '' : 'disabled'}>
          ${list.length
            ? list.map(r => `<option value="${r.name}" ${r.name === st.room ? 'selected' : ''}>${r.name} · ${r.type} · ${r.cap} chỗ</option>`).join('')
            : '<option>Không có phòng trống</option>'}
        </select>
      </div>
      ${pick ? alertBox('ok', `${pick.name} còn trống trong thời gian đã chọn`, pick.eq, 'check') : ''}
      ${validTime && !list.length ? alertBox('err', 'Không có phòng trống', 'Hãy chọn ngày hoặc khung giờ khác.') : ''}
      <p class="req-note">Hệ thống kiểm tra lịch trùng khi xác nhận. Lịch hiện tại chỉ được thay thế khi đổi lịch thành công.</p>
    </div>
    ${mFoot(`
      <button class="btn btn-outline" data-close>Quay lại</button>
      <button class="btn btn-primary" id="rOk" ${pick ? '' : 'disabled'}>Xác nhận đổi lịch</button>`)}
  `);

  const upd = (key, id) => m.querySelector(id).addEventListener('change', ev => { st[key] = ev.target.value; renderReschedule(o, st); });
  upd('date', '#rDate'); upd('start', '#rStart'); upd('end', '#rEnd');
  m.querySelector('#rRoom').addEventListener('change', ev => { st.room = ev.target.value; renderReschedule(o, st); });

  m.querySelector('#rOk').addEventListener('click', () => {
    if (!pick) return;
    const old = { room: o.room, date: o.date, start: o.start, end: o.end };
    Object.assign(o, { room: st.room, date: st.date, start: st.start, end: st.end });
    renderOrders(); renderRooms(); renderNotifs();
    openDetail(o.code, { type: 'reschedule', old });
  });
}

/* =====================================================
   4. HỦY LỊCH
   ===================================================== */
function openCancel(code) {
  const o = getOrder(code);
  const r = getRoom(o.room);
  const m = setModal(`
    ${mHead('Hủy lịch mượn phòng?', `Đơn #${o.code}`)}
    <div class="m-body">
      <div class="cancel-ico">${icon('calx')}</div>
      ${sumBox(`${o.room} · ${r.type}`, o, esc(o.purpose))}
      <p class="cancel-text">Sau khi hủy, phòng sẽ được giải phóng cho người khác. Bạn cần gửi yêu cầu mới nếu muốn mượn lại.</p>
    </div>
    ${mFoot(`<button class="btn btn-outline" data-close>Giữ lịch</button><button class="btn btn-danger" id="cOk">Xác nhận hủy</button>`)}
  `);

  const okBtn = m.querySelector('#cOk');
  okBtn.addEventListener('click', () => submitWithLoading(okBtn, () => {
    o.status = 'cancelled';
    dropNotif(o.code);
    renderOrders(); renderNotifs(); renderRooms();

    const res = setModal(`
      ${mHead('Hủy lịch thành công', `Đơn #${o.code}`)}
      <div class="m-body">
        ${alertBox('ok', 'Hủy lịch thành công', `Đã hủy đơn #${o.code}. Phòng ${o.room} ngày ${fmtDate(o.date)}, ${o.start} – ${o.end} không còn được giữ.`, 'check')}
        <div class="mini">
          <div class="mini-top"><b>#${o.code} · ${o.room}</b><span class="badge cancelled">Đã hủy</span></div>
          <p>Không còn lịch mượn cho yêu cầu này.</p>
        </div>
        <button class="btn btn-outline" id="cBack" style="width:100%">${icon('search')} Trở về tìm phòng</button>
      </div>
    `);
    res.querySelector('#cBack').addEventListener('click', () => {
      closeModal();
      document.getElementById('searchCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }));
}