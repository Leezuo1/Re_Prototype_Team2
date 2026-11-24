/* Phòng CSVC · Mượn – trả thiết bị
   PB-43 danh sách và chi tiết phiếu · PB-44 bàn giao bằng QR · PB-45 nhận trả bằng QR
   Dữ liệu mẫu, thao tác chạy trên bộ nhớ trang */

const f = { campus: '', status: '', q: '', date: '' };
const STATUS_KEYS = ['', 'wait', 'borrowed', 'returned', 'issue'];
const STATUS_LABEL = { '': 'Tất cả', wait: 'Chờ nhận', borrowed: 'Đang mượn', returned: 'Đã trả', issue: 'Có vấn đề' };
const COND_OPTS = { ok: 'Bình thường', broken: 'Hỏng', lost: 'Thiếu hoặc mất' };
const loanBadge = t => badge(LOAN_BADGE[t.status], LOAN_TEXT[t.status]) + (loanLateMin(t) ? ` ${badge('bad', 'Trả trễ ' + loanLateMin(t) + ' phút', true)}` : '');
const slotText = t => `${t.b.time} – ${t.d.time}${t.b.date !== TODAY ? ' · ' + fmtDate(t.b.date) : ''}`;

/* ---------- Danh sách ---------- */
function matches(t, ignoreStatus) {
  const q = fold(f.q.trim());
  return (!f.campus || t.campus === f.campus) && (ignoreStatus || !f.status || t.status === f.status) && (!f.date || t.b.date === f.date) &&
    (!q || fold(t.code).includes(q) || fold(t.who.name).includes(q) || fold(t.who.code).includes(q));
}
bindChips($('#campusHost'), v => { f.campus = v; renderAll(); });

function renderStatusChips() {
  const base = LOANS.filter(t => matches(t, true));
  $('#statusChips').innerHTML = STATUS_KEYS.map(k => {
    const n = k ? base.filter(t => t.status === k).length : base.length;
    return `<button type="button" class="chip ${f.status === k ? 'active' : ''}" data-v="${k}" aria-pressed="${f.status === k}">${STATUS_LABEL[k]}<span class="n">${n}</span></button>`;
  }).join('');
}
bindChips($('#statusChips'), v => { f.status = v; renderAll(); });

function renderTable() {
  const list = LOANS.filter(t => matches(t)).sort((a, b) => Number(b.code.slice(2)) - Number(a.code.slice(2)));
  $('#tbl').innerHTML = `
    <thead><tr><th scope="col">Mã phiếu</th><th scope="col">Người mượn</th><th scope="col">Thiết bị × số lượng</th><th scope="col">Phòng sử dụng</th><th scope="col">Mượn – trả dự kiến</th><th scope="col">Cơ sở</th><th scope="col">Trạng thái</th><th scope="col"><span class="sr-only">Thao tác</span></th></tr></thead>
    <tbody>${list.map(t => `
      <tr id="row-${t.code}">
        <td class="code">${t.code}</td>
        <td><div class="cell-user" style="min-width:0"><div><b>${esc(t.who.name)}</b><small>${t.who.kind} · ${esc(t.who.code)}</small></div></div></td>
        <td>${t.items.map(i => `<div>${esc(eqType(i.id).name)} <span class="muted">× ${i.qty}</span></div>`).join('')}</td>
        <td>${t.room}</td><td class="nowrap">${slotText(t)}</td><td class="nowrap">${CAMPUS_NAME[t.campus]}</td>
        <td>${loanBadge(t)}</td>
        <td class="col-actions"><button type="button" class="btn btn-outline btn-sm" data-code="${t.code}">Chi tiết</button></td>
      </tr>`).join('')}</tbody>`;
  $('#emptyHost').innerHTML = list.length ? '' : emptyState('Chưa có phiếu phù hợp', 'Thử đổi trạng thái, cơ sở hoặc từ khóa tìm kiếm.', 'inbox');
  $('#countText').textContent = `Hiển thị ${list.length} / ${LOANS.length} phiếu`;
}
function renderAll() {
  $('#campusHost').innerHTML = campusChipsHtml(f.campus, countBy(LOANS.filter(t => !f.status || t.status === f.status)));
  renderStatusChips(); renderTable();
}
$('#q').addEventListener('input', e => { f.q = e.target.value; renderAll(); });
$('#fDate').addEventListener('change', e => { f.date = e.target.value; renderAll(); });
$('#tbl').addEventListener('click', e => { const b = e.target.closest('button[data-code]'); if (b) openLoan(b.dataset.code); });

/* ---------- Ngăn chi tiết phiếu (PB-43) ---------- */
function loanTimeline(t) {
  const step = (cls, title, sub) => `<li class="${cls}"><span class="dot">${cls.includes('done') || cls.includes('stop') ? icon('check') : ''}</span><div><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div></li>`;
  const out = [step('done', 'Đã tạo phiếu', `${t.created} · ${fmtDate(t.b.date)} · hệ thống sinh mã QR`)];
  out.push(t.handed ? step('done', 'Đã nhận thiết bị', `${fmtDT(t.handed)} · bàn giao bởi ${esc(t.handedBy)}`) : step(t.status === 'wait' ? 'now' : 'todo', 'Đã nhận thiết bị', t.status === 'wait' ? 'Chờ người mượn đến Phòng CSVC' : ''));
  if (t.returned) out.push(step(t.status === 'issue' ? 'stop' : 'done', t.status === 'issue' ? 'Đã trả, thiết bị có vấn đề' : 'Đã trả', `${fmtDT(t.returned)} · nhận bởi ${esc(t.returnedBy)}${t.late ? ` · trả trễ ${t.late} phút` : ''}`));
  else out.push(step(t.status === 'borrowed' ? 'now' : 'todo', 'Đã trả', t.status === 'borrowed' ? `Hẹn trả ${t.d.time}${loanLateMin(t) ? ` · đã quá ${loanLateMin(t)} phút` : ''}` : ''));
  return `<ol class="tl">${out.join('')}</ol>`;
}
function openLoan(code) {
  const t = getLoan(code);
  if (!t) return;
  const condLine = id => t.cond && t.cond[id] ? t.cond[id] : '–';
  const retLine = id => { const r = t.retCond && t.retCond[id]; return r ? `${COND_OPTS[r.state]} (${r.qty})${r.note ? ' · ' + esc(r.note) : ''}` : '–'; };
  const m = setModal(`
    ${mHead(`Phiếu ${t.code}`, `${CAMPUS_NAME[t.campus]} · ${t.room}`)}
    <div class="m-body">
      <div>${loanBadge(t)}</div>
      <dl class="dl" style="margin-top:16px">
        <div><dt>Người mượn</dt><dd>${esc(t.who.name)}<br><small class="muted">${t.who.kind} · ${esc(t.who.code)}</small></dd></div>
        <div><dt>Đơn vị</dt><dd>${esc(t.who.dept)}</dd></div>
        <div><dt>Phòng sử dụng</dt><dd>${t.room}</dd></div>
        <div><dt>Mượn – trả dự kiến</dt><dd>${slotText(t)}</dd></div>
      </dl>
      <h3 class="sect-title">Thiết bị mượn</h3>
      <div class="tbl-wrap" style="border:1px solid var(--border);border-radius:12px"><table class="tbl" style="min-width:0">
        <thead><tr><th scope="col">Thiết bị</th><th scope="col" class="num">SL</th><th scope="col">Lúc giao</th><th scope="col">Lúc trả</th></tr></thead>
        <tbody>${t.items.map(i => `<tr><td>${esc(eqType(i.id).name)}</td><td class="num">${i.qty}</td><td>${condLine(i.id)}</td><td>${retLine(i.id)}</td></tr>`).join('')}</tbody></table></div>
      ${t.incident ? `<div style="margin-top:14px">${alertBox('warn', `Đã tạo phiếu sự cố ${t.incident}`, 'Thiết bị có vấn đề không được cộng lại vào số lượng khả dụng.', 'alert')}</div>` : ''}
      <h3 class="sect-title">Tiến trình phiếu</h3>
      ${loanTimeline(t)}
    </div>
    ${mFoot(`<button type="button" class="btn btn-outline" data-close>Đóng</button>${t.status === 'wait' ? `<button type="button" class="btn btn-primary" id="goGive">${icon('qr')} Quét QR bàn giao</button>` : t.status === 'borrowed' ? `<button type="button" class="btn btn-primary" id="goBack">${icon('qr')} Quét QR nhận trả</button>` : ''}`)}`, 'drawer');
  $('#goGive', m)?.addEventListener('click', () => openScan('give', t.code));
  $('#goBack', m)?.addEventListener('click', () => openScan('back', t.code));
}

/* ---------- Quét QR (PB-44, PB-45) ---------- */
const stateOfCode = (mode, t) => {
  if (!t) return null;
  if (mode === 'give') {
    if (t.status === 'wait') return null;
    return t.status === 'borrowed' ? `Phiếu ${t.code} đã bàn giao lúc ${fmtDT(t.handed)}. Không bàn giao lần hai.` : `Phiếu ${t.code} đã ${t.status === 'issue' ? 'trả (có vấn đề)' : 'trả'} lúc ${fmtDT(t.returned)}, không còn ở trạng thái Chờ nhận.`;
  }
  if (t.status === 'borrowed') return null;
  return t.status === 'wait' ? `Phiếu ${t.code} chưa được bàn giao nên chưa thể nhận trả.` : `Phiếu ${t.code} đã trả lúc ${fmtDT(t.returned)}.`;
};
function openScan(mode, presetCode) {
  const give = mode === 'give';
  const m = setModal('', '', true);
  const drawScan = (error = '') => {
    m.innerHTML = `
      ${mHead(give ? 'Quét QR bàn giao' : 'Quét QR nhận trả', give ? 'Người mượn xuất trình mã QR của phiếu tại Phòng CSVC. Không cần để thẻ sinh viên, không ghi sổ tay.' : 'Người trả xuất trình mã QR của phiếu tại Phòng CSVC cùng thiết bị.')}
      <div class="m-body">
        <div class="qr-box" role="img" aria-label="Khung quét mã QR">${icon('scan')}<span>Đưa mã QR vào khung</span><small>Mã hiển thị trên điện thoại hoặc phiếu của người mượn</small></div>
        <div class="qr-sim">
          <button type="button" class="btn btn-outline btn-sm" id="simOk">${icon('qr')} Quét thử mã hợp lệ</button>
          <button type="button" class="btn btn-ghost btn-sm" id="simBad">Quét thử mã không hợp lệ</button>
        </div>
        <div class="qr-or">hoặc nhập mã phiếu</div>
        <div class="code-row"><input class="input" id="manual" type="text" placeholder="VD TB1048" aria-label="Mã phiếu" value="${esc(presetCode || '')}" autocomplete="off"><button type="button" class="btn btn-primary" id="lookup">Tra cứu</button></div>
        <div id="scanErr" style="margin-top:14px">${error ? alertBox('err', 'Không bàn giao được', error, 'alert') : ''}</div>
      </div>
      ${mFoot('<button type="button" class="btn btn-outline" data-close>Đóng</button>')}`;
    m.querySelector('.m-x').addEventListener('click', closeModal);
    m.querySelector('[data-close]').addEventListener('click', closeModal);
    $('#simOk', m).addEventListener('click', () => {
      const want = give ? 'wait' : 'borrowed';
      const t = LOANS.find(x => x.status === want && (!f.campus || x.campus === f.campus)) || LOANS.find(x => x.status === want);
      t ? resolve(t.code) : drawScan(`Không còn phiếu ${give ? 'Chờ nhận' : 'Đang mượn'} nào để quét thử.`);
    });
    $('#simBad', m).addEventListener('click', () => resolve('TB9999'));
    const go = () => resolve($('#manual', m).value);
    $('#lookup', m).addEventListener('click', go);
    $('#manual', m).addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    setTimeout(() => $('#manual', m).focus(), 0);
  };
  const resolve = raw => {
    const code = String(raw).trim().toUpperCase();
    if (!code) { drawScan('Nhập mã phiếu hoặc quét mã QR.'); return; }
    const t = getLoan(code);
    if (!t) { drawScan(`Mã ${code} không khớp phiếu nào trong hệ thống.`); return; }
    const bad = stateOfCode(mode, t);
    if (bad) { drawScan(bad); return; }
    give ? drawGive(t) : drawBack(t);
  };

  /* ---- Bàn giao ---- */
  const drawGive = t => {
    m.innerHTML = `
      ${mHead(`Bàn giao phiếu ${t.code}`, `${esc(t.who.name)} · ${t.room} · ${slotText(t)}`)}
      <div class="m-body">
        ${alertBox('ok', 'Mã QR hợp lệ', `Phiếu ở trạng thái Chờ nhận, ${CAMPUS_NAME[t.campus]}. Đối chiếu người mượn và thiết bị đã chuẩn bị.`, 'check')}
        <div class="cond-list" id="gList">
          ${t.items.map(i => `
            <div class="cond-row" data-id="${i.id}">
              <div class="cond-head"><b>${esc(eqType(i.id).name)}<small>Số lượng ${i.qty}</small></b></div>
              <div class="cond-fields">
                <div><label for="gs-${i.id}">Tình trạng lúc giao *</label><select class="select" id="gs-${i.id}"><option value="">Chọn tình trạng</option><option value="ok">Bình thường</option><option value="bad">Có vấn đề</option></select></div>
                <div><label for="gn-${i.id}">Ghi chú</label><input class="input" id="gn-${i.id}" type="text" placeholder="VD Trầy xước nhẹ"></div>
                <p class="err" id="ge-${i.id}" hidden></p>
              </div>
            </div>`).join('')}
        </div>
        <div id="gErr" style="margin-top:12px"></div>
      </div>
      ${mFoot('<button type="button" class="btn btn-outline" id="gBack">Quét mã khác</button><button type="button" class="btn btn-primary" id="gOk">Xác nhận bàn giao</button>')}`;
    m.querySelector('.m-x').addEventListener('click', closeModal);
    $('#gBack', m).addEventListener('click', () => drawScan());
    $$('.cond-row select', m).forEach(s => s.addEventListener('change', () => s.closest('.cond-row').classList.toggle('bad', s.value === 'bad')));
    $('#gOk', m).addEventListener('click', () => {
      let bad = false; const rows = [];
      t.items.forEach(i => {
        const s = $('#gs-' + i.id, m), n = $('#gn-' + i.id, m), e = $('#ge-' + i.id, m);
        const msg = !s.value ? 'Chọn tình trạng của thiết bị này.' : (s.value === 'bad' && !n.value.trim() ? 'Ghi chú vấn đề của thiết bị.' : '');
        e.hidden = !msg; e.textContent = msg; s.classList.toggle('invalid', !s.value); n.classList.toggle('invalid', s.value === 'bad' && !n.value.trim());
        if (msg) bad = true; else rows.push({ ...i, state: s.value, note: n.value.trim() });
      });
      if (bad) { $('.invalid', m)?.focus(); return; }
      const good = rows.filter(r => r.state === 'ok'), flagged = rows.filter(r => r.state === 'bad');
      const codes = [];
      flagged.forEach(r => {
        const c = nextIncCode(); codes.push(c);
        INCIDENTS.unshift({ code: c, kind: 'device', target: eqType(r.id).name, place: t.room, desc: `${r.note} (phát hiện lúc bàn giao phiếu ${t.code})`, source: 'Nhận trả thiết bị', by: 'Phòng CSVC', status: 'received', priority: 'normal', tech: null, inUse: null, times: { sent: { date: TODAY, time: NOW_TIME }, received: { date: TODAY, time: NOW_TIME } }, img: null, campus: t.campus, log: [{ at: { date: TODAY, time: NOW_TIME }, text: 'Phòng CSVC tạo phiếu từ bàn giao thiết bị, duyệt sẵn' }] });
        STOCK[t.campus][r.id] += r.qty;   // thiết bị không bàn giao được trả về kho
      });
      if (!good.length) { t.status = 'issue'; t.incident = codes.join(', '); closeModal(); renderAll(); showToast(`Không bàn giao ${t.code}: mọi thiết bị đều có vấn đề, đã tạo phiếu sự cố ${t.incident}`); return; }
      t.items = good.map(({ id, qty }) => ({ id, qty }));
      t.cond = Object.fromEntries(good.map(r => [r.id, 'Bình thường' + (r.note ? ' · ' + r.note : '')]));
      t.status = 'borrowed'; t.handed = { date: TODAY, time: NOW_TIME }; t.handedBy = ME;
      closeModal(); renderAll();
      showToast(flagged.length ? `Đã bàn giao ${t.code}; ${flagged.length} thiết bị có vấn đề chuyển sự cố ${codes.join(', ')}` : `Đã bàn giao ${t.code}, người mượn nhận thông báo`);
    });
  };

  /* ---- Nhận trả ---- */
  const drawBack = t => {
    const lateReal = Math.max(0, minsSince(t.d));
    m.innerHTML = `
      ${mHead(`Nhận trả phiếu ${t.code}`, `${esc(t.who.name)} · ${t.room} · hẹn trả ${t.d.time}`)}
      <div class="m-body">
        ${alertBox('ok', 'Mã QR hợp lệ', `Phiếu đang mượn, bàn giao lúc ${fmtDT(t.handed)}. Đối chiếu từng thiết bị với tình trạng lúc giao.`, 'check')}
        ${lateReal > 0 ? alertBox('warn', `Trả trễ ${lateReal} phút`, `Giờ trả dự kiến ${t.d.time}, bây giờ ${NOW_TIME}. Hệ thống đánh dấu “Trả trễ” và lưu vào lịch sử người mượn.`, 'clock') : ''}
        <div class="cond-list">
          ${t.items.map(i => `
            <div class="cond-row" data-id="${i.id}" data-qty="${i.qty}">
              <div class="cond-head"><b>${esc(eqType(i.id).name)}<small>Đã mượn ${i.qty} · lúc giao: ${esc(t.cond[i.id] || 'Bình thường')}</small></b></div>
              <div class="cond-fields">
                <div><label for="rq-${i.id}">Số lượng thực nhận *</label><input class="input" id="rq-${i.id}" type="number" min="0" max="${i.qty}" value="${i.qty}" inputmode="numeric"></div>
                <div><label for="rs-${i.id}">Tình trạng khi trả *</label><select class="select" id="rs-${i.id}"><option value="">Chọn tình trạng</option>${Object.entries(COND_OPTS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
                <div class="full" id="rd-box-${i.id}" hidden>
                  <label for="rd-${i.id}">Mô tả vấn đề *</label><textarea id="rd-${i.id}" placeholder="VD Đầu cáp bị gãy, thiếu 1 chiếc."></textarea>
                  <div class="attach" style="margin-top:8px"><button type="button" class="btn btn-outline btn-sm" data-attach="${i.id}">${icon('paperclip')} Đính kèm ảnh</button><span class="muted" style="font-size:12px" id="ra-${i.id}">JPG, PNG, tối đa 10 MB (không bắt buộc)</span></div>
                </div>
                <p class="err" id="re-${i.id}" hidden></p>
              </div>
            </div>`).join('')}
        </div>
        ${lateReal > 0 ? `<div class="f-group" style="margin-top:14px"><label for="lateNote">Lý do trả trễ (không bắt buộc)</label><textarea id="lateNote"></textarea></div>` : ''}
        <div id="bErr" style="margin-top:12px"></div>
      </div>
      ${mFoot('<button type="button" class="btn btn-outline" id="bBack">Quét mã khác</button><button type="button" class="btn btn-primary" id="bOk">Xác nhận trả</button>')}`;
    m.querySelector('.m-x').addEventListener('click', closeModal);
    $('#bBack', m).addEventListener('click', () => drawScan());
    $$('.cond-row', m).forEach(row => {
      const id = row.dataset.id, s = $('#rs-' + id, m);
      s.addEventListener('change', () => { $('#rd-box-' + id, m).hidden = !(s.value && s.value !== 'ok'); row.classList.toggle('bad', s.value && s.value !== 'ok'); });
    });
    const picked = {};
    $$('[data-attach]', m).forEach(b => b.addEventListener('click', () => { const n = nextSampleImage(); picked[b.dataset.attach] = n; $('#ra-' + b.dataset.attach, m).textContent = n + ' · 1,1 MB'; }));
    $('#bOk', m).addEventListener('click', () => {
      let bad = false; const rows = [];
      t.items.forEach(i => {
        const q = $('#rq-' + i.id, m), s = $('#rs-' + i.id, m), d = $('#rd-' + i.id, m), e = $('#re-' + i.id, m);
        const n = q.value === '' ? NaN : Number(q.value);
        let msg = '';
        if (!Number.isInteger(n) || n < 0 || n > i.qty) msg = `Số lượng nhận phải từ 0 đến ${i.qty}.`;
        else if (!s.value) msg = 'Chọn tình trạng của thiết bị này.';
        else if (s.value === 'ok' && n < i.qty) msg = 'Nhận thiếu so với số đã mượn: chọn “Thiếu hoặc mất”.';
        else if (s.value !== 'ok' && !d.value.trim()) msg = 'Mô tả vấn đề để xác định trách nhiệm.';
        e.hidden = !msg; e.textContent = msg; q.classList.toggle('invalid', !Number.isInteger(n) || n < 0 || n > i.qty); s.classList.toggle('invalid', !s.value); d.classList.toggle('invalid', s.value && s.value !== 'ok' && !d.value.trim());
        if (msg) bad = true; else rows.push({ ...i, got: n, state: s.value, note: d.value.trim() });
      });
      if (bad) { $('.invalid', m)?.focus(); return; }
      const problems = rows.filter(r => r.state !== 'ok');
      t.retCond = Object.fromEntries(rows.map(r => [r.id, { qty: r.got, state: r.state, note: r.note }]));
      t.returned = { date: TODAY, time: NOW_TIME }; t.returnedBy = ME;
      if (lateReal > 0) t.late = lateReal;
      rows.filter(r => r.state === 'ok').forEach(r => { STOCK[t.campus][r.id] += r.got; });
      if (!problems.length) {
        t.status = 'returned';
        closeModal(); renderAll();
        showToast(`Trả thiết bị thành công: đã hoàn ${rows.reduce((s, r) => s + r.got, 0)} thiết bị vào số lượng khả dụng${lateReal > 0 ? `, ghi nhận trả trễ ${lateReal} phút` : ''}`);
        return;
      }
      t.status = 'issue';
      const codes = problems.map(r => {
        const c = nextIncCode();
        INCIDENTS.unshift({ code: c, kind: 'device', target: eqType(r.id).name, place: t.room, desc: `${COND_OPTS[r.state]}: ${r.note} (phiếu ${t.code})`, source: 'Nhận trả thiết bị', by: 'Phòng CSVC', status: 'received', priority: 'normal', tech: null, inUse: null, times: { sent: { date: TODAY, time: NOW_TIME }, received: { date: TODAY, time: NOW_TIME } }, img: picked[r.id] || null, campus: t.campus, loan: t.code, log: [{ at: { date: TODAY, time: NOW_TIME }, text: `Phòng CSVC tạo phiếu từ nhận trả thiết bị (${t.code}), duyệt sẵn` }] });
        return c;
      });
      t.incident = codes.join(', ');
      closeModal(); renderAll();
      showToast(`Phiếu ${t.code} chuyển “Thiết bị có vấn đề”, đã tạo phiếu sự cố ${t.incident} gửi Đội ngũ Kỹ thuật`);
    });
  };

  presetCode ? resolve(presetCode) : drawScan();
}
$('#btnGive').addEventListener('click', () => openScan('give'));
$('#btnBack').addEventListener('click', () => openScan('back'));

/* ---------- Mở theo #hash (từ chuông thông báo, từ tổng quan) ---------- */
function applyHash() {
  const h = hashKey();
  if (!h) return;
  if (getLoan(h)) { openLoan(h); document.getElementById('row-' + h)?.scrollIntoView({ block: 'center' }); return; }
  if (STATUS_KEYS.includes(h)) { f.status = h; renderAll(); }
}
window.addEventListener('hashchange', applyHash);
renderAll(); applyHash();
