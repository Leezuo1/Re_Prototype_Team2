/* Người quản lý phòng (Phòng Đào tạo) · Nhập thời khóa biểu học kỳ (dữ liệu mẫu) */

const STEPS = ['Chọn tệp', 'Xem trước', 'Hoàn tất'];
const tt = { step: 1, file: null, year: '2026 – 2027', term: 'Học kỳ 1', mode: 'diff', tab: 'err' };

const HISTORY = [
  { at: '21/11/2026 15:48', term: 'Học kỳ 1 · 2026 – 2027', by: 'Tuyền Quang Minh Nhân', file: 'TKB_HK1_2026-2027_v1.xlsx', n: '14.102', mode: 'Lần đầu' },
  { at: '15/06/2026 09:20', term: 'Học kỳ 2 · 2025 – 2026', by: 'Nguyễn Thị Hồng Nhung', file: 'TKB_HK2_2025-2026_v2.xlsx', n: '13.775', mode: 'Chỉ cập nhật thay đổi' }
];
const ERRORS = [
  [14, 'INT2201 · 23DTH1A', 'Phòng', 'Phòng “A.9.1” không có trong danh mục'],
  [38, 'ENG1102 · 24NN2B', 'Email giảng viên', 'Email giảng viên không tồn tại trong hệ thống'],
  [57, 'ECO1101 · 24KT1A', 'Tiết', 'Sai định dạng tiết (cần dạng 1–3)'],
  [102, 'LAW2201 · 23LU2', 'Thứ', 'Thiếu cột bắt buộc: thứ'],
  [211, 'PHA1202 · 24D2', 'Phòng', 'Phòng “J.08.01” không có trong danh mục'],
  [389, 'ARC2301 · 23KT1', 'Email giảng viên', 'Email giảng viên không tồn tại trong hệ thống']
];
const CLASHES = [
  ['Cùng phòng, cùng ca', 'J.07.01 · Thứ ba · tiết 4–6', 'PHA1101 · 24D1 và PHA1202 · 24D2 trong cùng tệp', 'Không import 2 dòng này'],
  ['Giảng viên dạy hai nơi', 'TS. Nguyễn Văn Phúc · Thứ năm · tiết 7–9', 'INT1306 (J.06.04) và INT3401 (A.03.05)', 'Không import 2 dòng này'],
  ['Trùng lịch mượn đã duyệt', 'J.06.04 · 25/11/2026 · 10:30–12:00', 'Ôn thi giữa kỳ · Trần Minh Khôi', 'Thời khóa biểu được ưu tiên, người mượn nhận thông báo kèm gợi ý đặt lại'],
  ['Trùng lịch mượn đã duyệt', 'A.01.02 · 26/11/2026 · 15:30–17:00', 'Họp lớp 23DTH2 · Lê Hoài An', 'Thời khóa biểu được ưu tiên, người mượn nhận thông báo kèm gợi ý đặt lại']
];
const DIFF = [
  ['Thêm mới', 212, 'ok', 'INT3105 · lớp 24DTH4 · J.05.02 · Thứ hai tiết 1–3'],
  ['Bị xóa', 38, 'rejected', 'LAW1105 · lớp 24LU3 · A.03.05 · Thứ sáu tiết 7–9'],
  ['Đổi phòng / đổi ca', 54, 'pending', 'ECO1101 · lớp 24KT1A · A.01.02 → B.02.01']
];

function renderStepper() {
  $('#stepper').innerHTML = STEPS.map((s, i) => `<div class="step ${i + 1 < tt.step ? 'done' : i + 1 === tt.step ? 'current' : ''}" ${i + 1 === tt.step ? 'aria-current="step"' : ''}><span>${s}</span></div>`).join('');
}

function stepFile() {
  return `
    <div class="form-grid" style="margin-bottom:20px">
      <div class="f-field"><label for="selYear">Năm học</label>
        <select class="select" style="width:100%" id="selYear"><option ${tt.year === '2026 – 2027' ? 'selected' : ''}>2026 – 2027</option><option ${tt.year === '2025 – 2026' ? 'selected' : ''}>2025 – 2026</option></select></div>
      <div class="f-field"><label for="selTerm">Học kỳ</label>
        <select class="select" style="width:100%" id="selTerm">${['Học kỳ 1', 'Học kỳ 2', 'Học kỳ hè'].map(t => `<option ${t === tt.term ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    </div>
    <button type="button" class="drop-lg ${tt.file ? 'has' : ''}" id="pick">
      ${icon(tt.file ? 'sheet' : 'upload')}
      <span>${tt.file ? tt.file.name : 'Chọn file Excel hoặc kéo thả vào đây'}</span>
      <small>${tt.file ? `${tt.file.size} · ${tt.file.rows} dòng · sẵn sàng import` : 'Chỉ nhận tệp .xlsx đúng theo file mẫu'}</small>
    </button>
    <p class="muted" style="margin-top:12px">Các cột bắt buộc: mã môn, tên môn, lớp / nhóm, email giảng viên, thứ, tiết bắt đầu – kết thúc, phòng, cơ sở, ngày bắt đầu, ngày kết thúc.</p>
    <div style="margin-top:20px"><button type="button" class="btn btn-primary" id="goPreview" ${tt.file ? '' : 'disabled'}>Import và xem trước</button></div>`;
}

function previewTable() {
  if (tt.tab === 'err') return `
    <div class="tbl-wrap" style="border:1px solid var(--border);border-radius:12px"><table class="tbl"><thead><tr><th scope="col" class="num">Dòng</th><th scope="col">Môn · lớp</th><th scope="col">Cột lỗi</th><th scope="col">Lý do</th></tr></thead>
    <tbody>${ERRORS.map(e => `<tr><td class="num">${e[0]}</td><td>${e[1]}</td><td>${e[2]}</td><td>${e[3]}</td></tr>`).join('')}</tbody></table></div>
    <p class="muted" style="margin-top:8px">Hiển thị 6 trong 11 dòng lỗi. Tải file dòng lỗi để xem đủ, sửa và import lại.</p>`;
  if (tt.tab === 'clash') return `
    <div class="tbl-wrap" style="border:1px solid var(--border);border-radius:12px"><table class="tbl"><thead><tr><th scope="col">Loại trùng</th><th scope="col">Phòng / giảng viên · thời điểm</th><th scope="col">Chi tiết</th><th scope="col">Cách xử lý</th></tr></thead>
    <tbody>${CLASHES.map(c => `<tr><td class="nowrap">${badge(c[0].startsWith('Trùng lịch mượn') ? 'pending' : 'rejected', c[0], true)}</td><td>${c[1]}</td><td>${c[2]}</td><td>${c[3]}</td></tr>`).join('')}</tbody></table></div>`;
  return `
    <div class="tbl-wrap" style="border:1px solid var(--border);border-radius:12px"><table class="tbl"><thead><tr><th scope="col">Thay đổi</th><th scope="col" class="num">Số buổi</th><th scope="col">Ví dụ</th></tr></thead>
    <tbody>${DIFF.map(d => `<tr><td class="nowrap">${badge(d[2], d[0])}</td><td class="num"><b>${d[1]}</b></td><td>${d[3]}</td></tr>`).join('')}</tbody></table></div>
    <p class="muted" style="margin-top:8px">Buổi đã diễn ra không bị thay đổi. Buổi đã báo nghỉ hoặc dạy bù vẫn giữ liên kết. Giảng viên có lịch bị thay đổi nhận thông báo.</p>`;
}

function stepPreview() {
  return `
    <div class="mini-stats">
      <div class="mini-stat ok"><div class="value">1.231</div><div class="label">Dòng hợp lệ</div></div>
      <div class="mini-stat bad"><div class="value">11</div><div class="label">Dòng lỗi</div></div>
      <div class="mini-stat warn"><div class="value">6</div><div class="label">Dòng trùng lịch</div></div>
      <div class="mini-stat"><div class="value">14.380</div><div class="label">Buổi học sẽ được tạo</div></div>
    </div>
    <div class="f-field" style="margin-bottom:20px"><span class="lbl" id="lblMode">Đã có thời khóa biểu cho ${tt.term} · ${tt.year}. Chọn cách cập nhật</span>
      <div class="radio-grid" role="radiogroup" aria-labelledby="lblMode">
        <label class="radio-card"><input type="radio" name="mode" value="all" ${tt.mode === 'all' ? 'checked' : ''}><span>Thay thế toàn bộ<small>Xóa lịch chưa diễn ra và tạo lại từ tệp này</small></span></label>
        <label class="radio-card"><input type="radio" name="mode" value="diff" ${tt.mode === 'diff' ? 'checked' : ''}><span>Chỉ cập nhật thay đổi<small>Giữ nguyên các buổi không đổi</small></span></label>
      </div></div>
    <div class="tabs-line" id="pvTabs" style="margin-bottom:14px">
      <button type="button" data-tab="err" class="${tt.tab === 'err' ? 'active' : ''}" aria-selected="${tt.tab === 'err'}">Dòng lỗi<span class="n">11</span></button>
      <button type="button" data-tab="clash" class="${tt.tab === 'clash' ? 'active' : ''}" aria-selected="${tt.tab === 'clash'}">Trùng lịch<span class="n">6</span></button>
      <button type="button" data-tab="diff" class="${tt.tab === 'diff' ? 'active' : ''}" aria-selected="${tt.tab === 'diff'}">So sánh thay đổi</button>
    </div>
    <div id="pvTable">${previewTable()}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">
      <button type="button" class="btn btn-ghost" id="back">${icon('arrowLeft')} Chọn tệp khác</button>
      <span style="flex:1"></span>
      <button type="button" class="btn btn-outline" id="dlErr">${icon('download')} Tải file dòng lỗi</button>
      <button type="button" class="btn btn-primary" id="confirm">Xác nhận import</button>
    </div>
    <p class="mono-note" style="margin-top:12px;justify-content:flex-end">${icon('info')} Dòng lỗi và dòng trùng không được import.</p>`;
}

function stepDone() {
  return `
    ${notice('ok', '<b>Đã nhập thời khóa biểu thành công.</b> Hệ thống sinh 14.380 buổi học theo từng tuần và khóa các khung giờ này trên lịch phòng. Giảng viên xem lịch trong mục “Lịch dạy”.', 'check')}
    ${notice('warn', '<b>4 người mượn bị trùng lịch đã được thông báo</b> kèm gợi ý đặt lại phòng khác.', 'alert')}
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
      <a class="btn btn-primary" href="manager-calendar.html">Xem lịch phòng</a>
      <button type="button" class="btn btn-outline" id="again">Nhập tệp khác</button>
    </div>`;
}

function draw() {
  renderStepper();
  const host = $('#stepBody');
  host.innerHTML = tt.step === 1 ? stepFile() : tt.step === 2 ? stepPreview() : stepDone();
  if (tt.step === 1) {
    $('#selYear').addEventListener('change', e => tt.year = e.target.value);
    $('#selTerm').addEventListener('change', e => tt.term = e.target.value);
    $('#pick').addEventListener('click', () => { tt.file = { name: 'TKB_HK1_2026-2027_v2.xlsx', size: '412 KB', rows: '1.248' }; draw(); $('#goPreview').focus(); });
    $('#goPreview').addEventListener('click', e => {
      const b = e.currentTarget; b.disabled = true; b.innerHTML = '<span class="spinner"></span> Đang kiểm tra tệp...';
      setTimeout(() => { tt.step = 2; draw(); }, 900);
    });
  }
  if (tt.step === 2) {
    $$('input[name="mode"]').forEach(r => r.addEventListener('change', () => tt.mode = r.value));
    bindTabs($('#pvTabs'), t => { tt.tab = t; $('#pvTable').innerHTML = previewTable(); });
    $('#back').addEventListener('click', () => { tt.step = 1; draw(); });
    $('#dlErr').addEventListener('click', () => showToast('Đã tải file dòng lỗi kèm cột lý do (mẫu)'));
    $('#confirm').addEventListener('click', () => confirmDialog({
      title: 'Xác nhận nhập thời khóa biểu?', sub: `${tt.term} · ${tt.year}`, confirmText: 'Xác nhận import',
      body: `<p style="font-size:14px">Hệ thống sẽ tạo <b>14.380 buổi học</b> và khóa khung giờ trên lịch phòng. Lịch mượn trùng được thông báo cho người mượn.</p>
             <p class="muted" style="margin-top:8px">Chế độ: ${tt.mode === 'all' ? 'Thay thế toàn bộ' : 'Chỉ cập nhật thay đổi'}.</p>`,
      onConfirm: () => {
        const b = $('#confirm'); b.disabled = true; b.innerHTML = '<span class="spinner"></span> Đang tạo lịch...';
        setTimeout(() => {
          HISTORY.unshift({ at: '23/11/2026 ' + new Date().toTimeString().slice(0, 5), term: `${tt.term} · ${tt.year}`, by: 'Tuyền Quang Minh Nhân', file: tt.file.name, n: '14.380', mode: tt.mode === 'all' ? 'Thay thế toàn bộ' : 'Chỉ cập nhật thay đổi' });
          renderHistory(); tt.step = 3; draw();
        }, 1000);
      }
    }));
  }
  if (tt.step === 3) $('#again').addEventListener('click', () => { tt.step = 1; tt.file = null; tt.tab = 'err'; draw(); });
}

function renderHistory() {
  $('#histRows').innerHTML = HISTORY.map(h => `<tr><td class="nowrap">${h.at}</td><td>${h.term}</td><td>${h.by}</td><td>${h.file}</td><td class="num">${h.n}</td><td>${h.mode}</td></tr>`).join('');
}
$('#btnTemplate').addEventListener('click', e => fakeExport(e.currentTarget, 'Đã tải file mẫu thoi-khoa-bieu-mau.xlsx (mẫu)'));
renderHistory(); draw();
