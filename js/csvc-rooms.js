/* Phòng CSVC · Phòng đang sử dụng và biên bản trả phòng
   PB-46 theo dõi phòng đang sử dụng · PB-47 xem biên bản trả phòng của Bảo vệ · PB-48 tạo phiếu sự cố từ biên bản
   Phòng CSVC chỉ xem lịch; việc duyệt, hủy lịch do người quản lý theo loại phòng thực hiện.
   Dữ liệu mẫu, thao tác chạy trên bộ nhớ trang */

const view = { tab: 'use', campus: '', building: '', type: '', status: '', date: TODAY, rDate: '', result: '', handled: '' };
const USE_TEXT = { using: 'Đang sử dụng', soon: 'Sắp hết giờ', over: 'Quá giờ', returned: 'Đã trả' };
const USE_BADGE = { using: 'info', soon: 'soon', over: 'rejected', returned: 'ok' };
/* ---------- Thanh chọn cơ sở và tab ---------- */
function renderCampus() {
  const base = view.tab === 'use' ? USAGE : REPORTS;
  $('#campusHost').innerHTML = campusChipsHtml(view.campus, countBy(base));
  $('#nUse').textContent = USAGE.length;
  $('#nRep').textContent = REPORTS.filter(r => !r.handled).length || REPORTS.length;
  $('#nRep').title = 'Biên bản chưa xử lý';
}
bindChips($('#campusHost'), v => { view.campus = v; view.building = ''; renderAll(); });
bindTabs($('#tabs'), t => { view.tab = t; renderAll(); });
const buildingsOf = () => [...new Set(ROOMS.filter(r => !view.campus || r.campus === view.campus).map(r => r.building))].sort();

function renderToolbar() {
  if (view.tab === 'use') {
    $('#toolbar').innerHTML = `
      <label class="mono-note" for="fDate">Ngày</label><input class="input" type="date" id="fDate" value="${view.date}">
      <select class="select" id="fBuilding" aria-label="Tòa nhà"><option value="">Tất cả tòa</option>${buildingsOf().map(b => `<option value="${b}">Tòa ${b}</option>`).join('')}</select>
      <select class="select" id="fType" aria-label="Loại phòng"><option value="">Tất cả loại phòng</option>${ROOM_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
      <select class="select" id="fStatus" aria-label="Trạng thái"><option value="">Mọi trạng thái</option>${Object.entries(USE_TEXT).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>`;
    const map = { fDate: 'date', fBuilding: 'building', fType: 'type', fStatus: 'status' };
    Object.entries(map).forEach(([id, key]) => { const el = $('#' + id); el.value = view[key]; el.addEventListener('change', () => { view[key] = el.value; renderTable(); }); });
  } else {
    $('#toolbar').innerHTML = `
      <label class="mono-note" for="rDate">Ngày</label><input class="input" type="date" id="rDate" value="${view.rDate}">
      <select class="select" id="rResult" aria-label="Kết quả"><option value="">Mọi kết quả</option><option value="full">Đủ thiết bị</option><option value="missing">Thiếu hoặc hỏng thiết bị</option></select>
      <select class="select" id="rHandled" aria-label="Trạng thái xử lý"><option value="">Mọi trạng thái xử lý</option><option value="no">Chưa xử lý</option><option value="yes">Đã xử lý</option></select>`;
    const map = { rDate: 'rDate', rResult: 'result', rHandled: 'handled' };
    Object.entries(map).forEach(([id, key]) => { const el = $('#' + id); el.value = view[key]; el.addEventListener('change', () => { view[key] = el.value; renderTable(); }); });
  }
}

/* ---------- Bảng ---------- */
function renderTable() {
  if (view.tab === 'use') renderUse(); else renderReports();
}
function renderUse() {
  const list = view.date !== TODAY ? [] : USAGE.filter(u => (!view.campus || u.campus === view.campus) && (!view.building || u.building === view.building) && (!view.type || u.type === view.type) && (!view.status || u.st === view.status));
  $('#tbl').innerHTML = `
    <thead><tr><th scope="col">Phòng</th><th scope="col">Cơ sở · tòa</th><th scope="col">Người mượn</th><th scope="col">Khung giờ</th><th scope="col">Mục đích</th><th scope="col">Trạng thái</th><th scope="col"><span class="sr-only">Thao tác</span></th></tr></thead>
    <tbody>${list.map((u, k) => `
      <tr id="use-${u.room}-${hm(u.s)}">
        <td class="code">${u.room}</td><td>${CAMPUS_NAME[u.campus]} · Tòa ${u.building}</td><td>${esc(u.who)}</td><td class="nowrap">${hm(u.s)} – ${hm(u.e)}</td><td>${esc(u.title)}</td>
        <td>${badge(USE_BADGE[u.st], USE_TEXT[u.st])}${u.st === 'over' ? `<div class="muted" style="font-size:12px;margin-top:4px">Quá ${-u.left} phút</div>` : u.st === 'soon' ? `<div class="muted" style="font-size:12px;margin-top:4px">Còn ${u.left} phút</div>` : u.rep && u.rep.late ? `<div class="muted" style="font-size:12px;margin-top:4px">Trả trễ ${u.rep.late} phút</div>` : ''}</td>
        <td class="col-actions"><button type="button" class="btn btn-outline btn-sm" data-use="${k}">Chi tiết</button></td>
      </tr>`).join('')}</tbody>`;
  $('#tbl').dataset.list = 'use'; window.__useList = list;
  $('#emptyHost').innerHTML = list.length ? '' : emptyState(view.date !== TODAY ? 'Chưa có dữ liệu cho ngày này' : 'Không có phòng khớp bộ lọc', view.date !== TODAY ? 'Dữ liệu mẫu chỉ có cho hôm nay, 23/11/2026.' : 'Thử đổi cơ sở, tòa nhà hoặc trạng thái.', 'door');
  $('#countText').textContent = `Hiển thị ${list.length} / ${USAGE.length} lượt sử dụng hôm nay`;
  $('#noteText').textContent = 'Phòng CSVC chỉ xem lịch. Duyệt hoặc hủy lịch do Phòng Đào tạo, TT Hỗ trợ SV, Quản lý CSVC thực hiện.';
}
const reportBadge = r => r.result === 'full' ? badge('ok', 'Đủ thiết bị') : badge('rejected', 'Thiếu hoặc hỏng');
function renderReports() {
  const list = REPORTS.filter(r => (!view.campus || r.campus === view.campus) && (!view.rDate || r.date === view.rDate) && (!view.result || r.result === view.result) &&
    (!view.handled || (view.handled === 'yes' ? r.handled : !r.handled)));
  list.sort((a, b) => b.date.localeCompare(a.date) || toMin(b.back) - toMin(a.back));
  window.__repList = list;
  $('#tbl').innerHTML = `
    <thead><tr><th scope="col">Mã biên bản</th><th scope="col">Phòng</th><th scope="col">Cơ sở</th><th scope="col">Người mượn</th><th scope="col">Giờ kết thúc → trả</th><th scope="col">Kết quả</th><th scope="col">Xử lý</th><th scope="col"><span class="sr-only">Thao tác</span></th></tr></thead>
    <tbody>${list.map((r, k) => `
      <tr id="rep-${r.id}" class="${r.result === 'missing' && !r.handled ? 'row-warn' : ''}">
        <td class="code">${r.id}<div class="muted" style="font-size:12px;font-weight:400">${fmtDate(r.date)}</div></td>
        <td>${r.room}</td><td>${CAMPUS_NAME[r.campus]}</td><td>${esc(r.who)}</td>
        <td class="nowrap">${r.end} → ${r.back}${r.late ? `<div style="margin-top:4px">${badge('bad', 'Trả trễ ' + r.late + ' phút', true)}</div>` : ''}</td>
        <td>${reportBadge(r)}</td><td>${r.handled ? badge('ok', 'Đã xử lý') : badge('pending', 'Chưa xử lý')}</td>
        <td class="col-actions"><div class="row-actions"><button type="button" class="btn btn-outline btn-sm" data-rep="${k}">Chi tiết</button>${r.result === 'missing' && !r.handled ? `<button type="button" class="btn btn-primary btn-sm" data-mk="${k}">${icon('tool')} Tạo phiếu sự cố</button>` : ''}</div></td>
      </tr>`).join('')}</tbody>`;
  $('#emptyHost').innerHTML = list.length ? '' : emptyState('Không có biên bản phù hợp', 'Thử bỏ bớt bộ lọc.', 'clipboard');
  $('#countText').textContent = `Hiển thị ${list.length} / ${REPORTS.length} biên bản`;
  $('#noteText').textContent = 'Biên bản do Bảo vệ lập khi kiểm tra phòng; chỉ xem, không sửa hoặc xóa.';
}
function renderAll() {
  $$('#tabs button').forEach(b => { b.classList.toggle('active', b.dataset.tab === view.tab); b.setAttribute('aria-selected', b.dataset.tab === view.tab); });
  renderCampus(); renderToolbar(); renderTable();
}
$('#tbl').addEventListener('click', e => {
  const u = e.target.closest('[data-use]'); if (u) { openUse(window.__useList[Number(u.dataset.use)]); return; }
  const r = e.target.closest('[data-rep]'); if (r) { openReport(window.__repList[Number(r.dataset.rep)]); return; }
  const mk = e.target.closest('[data-mk]'); if (mk) openMakeIncident(window.__repList[Number(mk.dataset.mk)]);
});

/* ---------- Chi tiết lượt sử dụng ---------- */
function openUse(u) {
  const info = ROOMS.find(r => r.code === u.room);
  const devs = DEVICES.filter(d => d.place === u.room);
  setModal(`
    ${mHead(`${u.room} · ${esc(u.title)}`, `${CAMPUS_NAME[u.campus]} · Tòa ${u.building} · ${info.type}`)}
    <div class="m-body">
      <div>${badge(USE_BADGE[u.st], USE_TEXT[u.st])}</div>
      <dl class="dl" style="margin-top:16px">
        <div><dt>Người mượn</dt><dd>${esc(u.who)}</dd></div><div><dt>Khung giờ</dt><dd>${hm(u.s)} – ${hm(u.e)}, ${fmtDate(TODAY)}</dd></div>
        <div><dt>Mục đích</dt><dd>${esc(u.title)}</dd></div><div><dt>Đơn vị duyệt</dt><dd>${ROOM_OWNER[info.type]}</dd></div>
      </dl>
      ${u.st === 'over' ? alertBox('err', `Quá giờ ${-u.left} phút`, 'Chưa có biên bản trả phòng từ Bảo vệ. Phòng CSVC đã nhận thông báo.', 'clock') : ''}
      ${u.st === 'soon' ? alertBox('warn', `Còn ${u.left} phút là hết giờ`, 'Hệ thống đã nhắc người mượn trước giờ kết thúc.', 'clock') : ''}
      ${u.rep ? `<div style="margin-top:10px">${alertBox(u.rep.result === 'full' ? 'ok' : 'warn', `Biên bản ${u.rep.id}: ${u.rep.result === 'full' ? 'đủ thiết bị' : 'thiếu hoặc hỏng thiết bị'}`, `Bảo vệ ${esc(u.rep.guard)} xác nhận trả lúc ${u.rep.back}.`, u.rep.result === 'full' ? 'check' : 'alert')}</div>` : ''}
      <h3 class="sect-title">Tình trạng thiết bị trong phòng</h3>
      ${devs.length ? `<ul class="pair-list">${devs.map(d => `<li class="${d.status === 'active' ? '' : 'bad'}"><span>${esc(d.name)} <small>${d.code}</small></span>${badge(d.status === 'active' ? 'ok' : 'pending', ROOM_STATUS[d.status])}</li>`).join('')}</ul>` : '<p class="muted">Phòng không có thiết bị gắn cố định.</p>'}
      <div style="margin-top:16px">${alertBox('gray', '', 'Phòng CSVC chỉ xem lịch. Duyệt hoặc hủy lịch do người quản lý theo loại phòng thực hiện.', 'info')}</div>
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Đóng</button>')}`, 'drawer');
}

/* ---------- Chi tiết biên bản trả phòng (PB-47) ---------- */
function openReport(r) {
  const m = setModal(`
    ${mHead(`Biên bản ${r.id}`, `${r.room} · ${CAMPUS_NAME[r.campus]} · ${fmtDate(r.date)}`)}
    <div class="m-body">
      <div>${reportBadge(r)} ${r.handled ? badge('ok', 'Đã xử lý') : badge('pending', 'Chưa xử lý')}</div>
      <dl class="dl" style="margin-top:16px">
        <div><dt>Người mượn</dt><dd>${esc(r.who)}</dd></div><div><dt>Mục đích</dt><dd>${esc(r.purpose)}</dd></div>
        <div><dt>Giờ kết thúc theo lịch</dt><dd>${r.end}</dd></div><div><dt>Giờ trả thực tế</dt><dd>${r.back}</dd></div>
        <div><dt>Bảo vệ lập biên bản</dt><dd>${esc(r.guard)}</dd></div><div><dt>Phòng</dt><dd>${r.room}</dd></div>
      </dl>
      ${r.late ? alertBox('warn', `Trả trễ ${r.late} phút`, 'Hệ thống đã ghi nhận vi phạm vào lịch sử người mượn.', 'clock') : ''}
      <h3 class="sect-title">Thiết bị thiếu hoặc hỏng</h3>
      ${r.missing.length ? `<ul class="pair-list">${r.missing.map(i => `<li class="bad"><span>${esc(i.name)} <small>× ${i.qty}</small></span><b>${i.state}</b></li>`).join('')}</ul>` : '<p class="muted">Bảo vệ xác nhận đủ thiết bị, không có vấn đề.</p>'}
      <h3 class="sect-title">Ghi chú của Bảo vệ</h3>
      <p>${r.note ? esc(r.note) : '<span class="muted">Không có ghi chú.</span>'}</p>
      ${r.incident ? `<div style="margin-top:16px">${alertBox('ok', `Đã tạo phiếu sự cố ${r.incident}`, 'Phiếu đã chuyển Đội ngũ Kỹ thuật.', 'check')} <a class="no-print-link" href="csvc-incidents.html#${r.incident.split(',')[0]}">Xem sự cố</a></div>` : ''}
      <p class="mono-note" style="margin-top:16px">${icon('lock')} Biên bản chỉ xem, không sửa hoặc xóa.</p>
    </div>
    ${mFoot(`<button type="button" class="btn btn-outline" data-close>Đóng</button>${r.result === 'missing' && !r.handled ? `<button type="button" class="btn btn-primary" id="mkInc">${icon('tool')} Tạo phiếu sự cố</button>` : ''}`)}`, 'drawer');
  $('#mkInc', m)?.addEventListener('click', () => openMakeIncident(r));
}

/* ---------- Tạo phiếu sự cố từ biên bản (PB-48) ---------- */
function openMakeIncident(r) {
  if (r.handled) return;
  const m = setModal(`
    ${mHead('Tạo phiếu sự cố', `Từ biên bản ${r.id} · ${r.room}`)}
    <div class="m-body">
      <div class="f-row">
        <div class="f-group"><label>Phòng</label><input type="text" value="${r.room}" readonly></div>
        <div class="f-group"><label>Cơ sở</label><input type="text" value="${CAMPUS_NAME[r.campus]}" readonly></div>
      </div>
      <div class="f-group"><label>Thiết bị có vấn đề *</label>
        <div class="check-list" id="mkItems">${r.missing.map((i, k) => `<label class="check-item"><input type="checkbox" value="${k}" checked> ${esc(i.name)}<small>× ${i.qty} · ${i.state}</small></label>`).join('')}</div>
        <p class="err" id="mkErr" hidden>Chọn ít nhất một thiết bị.</p></div>
      <div class="f-group"><label for="mkDesc">Mô tả *</label><textarea id="mkDesc">${esc(r.note)}</textarea><p class="err" id="mkDescErr" hidden>Vui lòng nhập mô tả.</p></div>
      <div class="attach"><button type="button" class="btn btn-outline btn-sm" id="mkAttach">${icon('paperclip')} Đính kèm ảnh</button><span class="muted" style="font-size:12px" id="mkImg">JPG, PNG, tối đa 10 MB (không bắt buộc)</span></div>
      ${r.missing.some(i => i.state === 'Thiếu') ? `<div style="margin-top:14px">${alertBox('info', '', 'Thiết bị thiếu hoặc mất được ghi vào lịch sử của người mượn để xác định trách nhiệm.')}</div>` : ''}
    </div>
    ${mFoot('<button type="button" class="btn btn-outline" data-close>Hủy</button><button type="button" class="btn btn-primary" id="mkSend">Gửi</button>')}`);
  let img = null;
  $('#mkAttach', m).addEventListener('click', () => { img = nextSampleImage(); $('#mkImg', m).textContent = img + ' · 1,1 MB'; });
  $('#mkSend', m).addEventListener('click', () => {
    const picks = $$('#mkItems input:checked', m).map(c => r.missing[Number(c.value)]);
    const desc = $('#mkDesc', m).value.trim();
    $('#mkErr', m).hidden = picks.length > 0; $('#mkDescErr', m).hidden = !!desc; $('#mkDesc', m).classList.toggle('invalid', !desc);
    if (!picks.length || !desc) return;
    const codes = picks.map(p => {
      const c = nextIncCode();
      INCIDENTS.unshift({ code: c, kind: 'device', target: p.name, place: r.room, desc: `${desc} (biên bản ${r.id})`, source: 'Biên bản trả phòng', by: 'Phòng CSVC', status: 'received', priority: 'normal', tech: null, inUse: null, times: { sent: { date: TODAY, time: NOW_TIME }, received: { date: TODAY, time: NOW_TIME } }, img, campus: r.campus, log: [{ at: { date: TODAY, time: NOW_TIME }, text: `Phòng CSVC tạo phiếu từ biên bản ${r.id}, duyệt sẵn` }] });
      return c;
    });
    r.handled = true; r.incident = codes.join(', ');
    closeModal(); renderAll();
    showToast(`Đã tạo phiếu sự cố ${r.incident}; biên bản ${r.id} chuyển “Đã xử lý”`);
  });
}

/* ---------- Mở theo #hash ---------- */
function applyHash() {
  const h = hashKey();
  if (!h) return;
  if (h === 'over') { view.tab = 'use'; view.status = 'over'; renderAll(); return; }
  const r = REPORTS.find(x => x.id === h);
  if (r) { view.tab = 'reports'; view.rDate = ''; renderAll(); openReport(r); }
}
window.addEventListener('hashchange', applyHash);
renderAll(); applyHash();
