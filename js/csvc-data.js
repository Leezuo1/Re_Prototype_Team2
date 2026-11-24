/* =====================================================
   Phòng CSVC · dữ liệu mẫu (không dùng dữ liệu thật)
   Cần nạp sau mgmt.js và mgmt-data.js (dùng TODAY, ROOMS, DEVICES, ACCOUNTS, DAY_SCHEDULE, fmtDate)
   ===================================================== */

/* "Bây giờ" cố định để trạng thái Sắp hết giờ / Quá giờ / Quá hạn luôn giống nhau mỗi lần mở */
const NOW_TIME = '10:40';
const nowMs = () => new Date(`${TODAY}T${NOW_TIME}:00`).getTime();
const minsSince = o => Math.round((nowMs() - new Date(`${o.date}T${o.time}:00`).getTime()) / 60000);
const fmtDT = o => `${o.time} · ${fmtDate(o.date)}`;
const hm = t => `${String(Math.floor(t)).padStart(2, '0')}:${t % 1 ? '30' : '00'}`;
const toMin = s => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
function agoText(m) {
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  if (m < 1440) { const h = Math.floor(m / 60), r = m % 60; return `${h} giờ${r ? ' ' + r + ' phút' : ''} trước`; }
  return `${Math.floor(m / 1440)} ngày trước`;
}
function durText(m) {
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60), r = m % 60;
  return `${h} giờ${r ? ' ' + r + ' phút' : ''}`;
}

/* ---------- 3 cơ sở ---------- */
const CAMPUSES = [
  { id: 'cs1', name: 'Cơ sở 1' },
  { id: 'cs2', name: 'Cơ sở 2' },
  { id: 'cs3', name: 'Cơ sở 3' }
];
const CAMPUS_NAME = Object.fromEntries(CAMPUSES.map(c => [c.id, c.name]));
const CAMPUS_OF_BUILDING = { A: 'cs1', B: 'cs1', J: 'cs2', H: 'cs2', M: 'cs3' };
function campusOfPlace(place) {
  const s = String(place);
  const m = s.match(/Tòa ([A-Z])/) || s.match(/^([A-Z])\./);
  return CAMPUS_OF_BUILDING[m && m[1]] || 'cs1';
}
const campusOfRoom = code => campusOfPlace(code);

/* Gắn cơ sở và số đang cho mượn vào danh mục dùng chung với Admin */
const DEVICE_LENT = { 'TB-0001': 3, 'TB-0002': 4, 'TB-0004': 2, 'TB-0006': 5 };
ROOMS.forEach(r => { r.campus = CAMPUS_OF_BUILDING[r.building] || 'cs1'; r.note = ''; });
DEVICES.forEach(d => { d.campus = campusOfPlace(d.place); d.lent = DEVICE_LENT[d.code] || 0; d.note = ''; d.moves = []; });

/* ---------- Thiết bị mượn thêm (giống màn hình của SV/GV) ---------- */
const EQUIP_TYPES = [
  { id: 'odien', name: 'Ổ điện kéo dài', short: 'Ổ điện', icon: 'plug' },
  { id: 'hub', name: 'Hub USB-C', short: 'Hub USB-C', icon: 'hub' },
  { id: 'hdmi', name: 'Dây cáp HDMI', short: 'Dây HDMI', icon: 'cable' },
  { id: 'remote', name: 'Remote máy chiếu', short: 'Remote', icon: 'remote' }
];
const eqType = id => EQUIP_TYPES.find(e => e.id === id);
/* Số lượng khả dụng theo cơ sở (đã trừ khi SV/GV tạo phiếu) */
const STOCK = {
  cs1: { odien: 12, hub: 5, hdmi: 2, remote: 0 },
  cs2: { odien: 9, hub: 7, hdmi: 6, remote: 3 },
  cs3: { odien: 6, hub: 2, hdmi: 4, remote: 1 }
};
function stockBadge(n) {
  if (n === 0) return ['rejected', 'Hết hàng'];
  if (n <= 2) return ['pending', 'Sắp hết'];
  return ['ok', 'Còn hàng'];
}

/* ---------- Phiếu mượn thiết bị ----------
   status: wait (Chờ nhận) | borrowed (Đang mượn) | returned (Đã trả) | issue (Thiết bị có vấn đề) */
const LOAN_TEXT = { wait: 'Chờ nhận', borrowed: 'Đang mượn', returned: 'Đã trả', issue: 'Thiết bị có vấn đề' };
const LOAN_BADGE = { wait: 'pending', borrowed: 'info', returned: 'ok', issue: 'rejected' };
const DT0 = TODAY, DT1 = '2026-11-22', DT2 = '2026-11-21';
const mkWho = (name, code, kind, dept) => ({ name, code, kind, dept });
const LOANS = [
  { code: 'TB1048', who: mkWho('Nguyễn Đình Thuần', '2474802010101', 'SV', 'Khoa Công nghệ thông tin'), items: [{ id: 'hdmi', qty: 1 }], room: 'J.06.04', b: { date: DT0, time: '13:00' }, d: { date: DT0, time: '15:00' }, status: 'wait', created: '09:55' },
  { code: 'TB1047', who: mkWho('ThS. Lê Quốc Bảo', 'GV0231', 'GV', 'Khoa Công nghệ thông tin'), items: [{ id: 'odien', qty: 2 }, { id: 'hub', qty: 1 }], room: 'A.03.01', b: { date: DT0, time: '13:30' }, d: { date: DT0, time: '16:00' }, status: 'wait', created: '09:20' },
  { code: 'TB1046', who: mkWho('Phạm Gia Hân', '2474801040077', 'SV', 'TT Hỗ trợ SV'), items: [{ id: 'hub', qty: 1 }], room: 'M.03.02', b: { date: DT0, time: '11:00' }, d: { date: DT0, time: '12:30' }, status: 'wait', created: '10:05' },
  { code: 'TB1045', who: mkWho('Lê Hoài An', '2474802010204', 'SV', 'Khoa Công nghệ thông tin'), items: [{ id: 'odien', qty: 1 }, { id: 'hdmi', qty: 1 }], room: 'A.01.02', b: { date: DT0, time: '08:00' }, d: { date: DT0, time: '10:00' }, status: 'borrowed', created: '07:30', handed: { date: DT0, time: '08:05' }, handedBy: 'Châu Minh Quân', cond: { odien: 'Bình thường', hdmi: 'Bình thường' } },
  { code: 'TB1044', who: mkWho('TS. Nguyễn Văn Phúc', 'GV0142', 'GV', 'Khoa Công nghệ thông tin'), items: [{ id: 'remote', qty: 1 }], room: 'J.06.04', b: { date: DT0, time: '08:00' }, d: { date: DT0, time: '12:00' }, status: 'borrowed', created: '07:20', handed: { date: DT0, time: '07:55' }, handedBy: 'Lâm Thị Thu Hà', cond: { remote: 'Bình thường' } },
  { code: 'TB1043', who: mkWho('Trần Minh Khôi', '2374801060318', 'SV', 'Khoa Kinh tế'), items: [{ id: 'hdmi', qty: 1 }], room: 'J.07.01', b: { date: DT0, time: '09:00' }, d: { date: DT0, time: '11:30' }, status: 'borrowed', created: '08:40', handed: { date: DT0, time: '09:05' }, handedBy: 'Châu Minh Quân', cond: { hdmi: 'Bình thường' } },
  { code: 'TB1042', who: mkWho('Lý Tuấn Kiệt', '2374802010388', 'SV', 'Khoa Công nghệ thông tin'), items: [{ id: 'odien', qty: 1 }], room: 'B.04.02', b: { date: DT1, time: '13:00' }, d: { date: DT1, time: '15:00' }, status: 'returned', created: '10:10', handed: { date: DT1, time: '13:02' }, handedBy: 'Lâm Thị Thu Hà', cond: { odien: 'Bình thường' }, returned: { date: DT1, time: '14:50' }, returnedBy: 'Lâm Thị Thu Hà', retCond: { odien: { qty: 1, state: 'ok', note: '' } } },
  { code: 'TB1041', who: mkWho('ThS. Vũ Minh Tâm', 'GV0198', 'GV', 'Khoa Ngoại ngữ'), items: [{ id: 'hub', qty: 1 }], room: 'M.04.01', b: { date: DT1, time: '09:00' }, d: { date: DT1, time: '11:00' }, status: 'returned', created: '08:15', handed: { date: DT1, time: '09:00' }, handedBy: 'Châu Minh Quân', cond: { hub: 'Bình thường' }, returned: { date: DT1, time: '11:12' }, returnedBy: 'Châu Minh Quân', late: 12, retCond: { hub: { qty: 1, state: 'ok', note: '' } } },
  { code: 'TB1040', who: mkWho('Dương Khánh Linh', '2474801090026', 'SV', 'Khoa Kiến trúc'), items: [{ id: 'hdmi', qty: 1 }], room: 'H.02.01', b: { date: DT1, time: '14:00' }, d: { date: DT1, time: '16:00' }, status: 'issue', created: '11:00', handed: { date: DT1, time: '14:03' }, handedBy: 'Lâm Thị Thu Hà', cond: { hdmi: 'Bình thường' }, returned: { date: DT1, time: '15:55' }, returnedBy: 'Lâm Thị Thu Hà', retCond: { hdmi: { qty: 1, state: 'broken', note: 'Đầu cáp bị gãy.' } }, incident: 'SC1044' },
  { code: 'TB1039', who: mkWho('Phan Thị Yến Nhi', '2474801040211', 'SV', 'TT Hỗ trợ SV'), items: [{ id: 'hub', qty: 1 }], room: 'M.03.02', b: { date: DT2, time: '10:00' }, d: { date: DT2, time: '11:30' }, status: 'returned', created: '09:00', handed: { date: DT2, time: '10:01' }, handedBy: 'Châu Minh Quân', cond: { hub: 'Bình thường' }, returned: { date: DT2, time: '11:20' }, returnedBy: 'Châu Minh Quân', retCond: { hub: { qty: 1, state: 'ok', note: '' } } },
  { code: 'TB1038', who: mkWho('Hoàng Thu Trang', '2474801060145', 'SV', 'Khoa Kinh tế'), items: [{ id: 'odien', qty: 2 }], room: 'B.02.01', b: { date: DT2, time: '08:00' }, d: { date: DT2, time: '10:00' }, status: 'returned', created: '07:10', handed: { date: DT2, time: '08:02' }, handedBy: 'Lâm Thị Thu Hà', cond: { odien: 'Bình thường' }, returned: { date: DT2, time: '09:58' }, returnedBy: 'Lâm Thị Thu Hà', retCond: { odien: { qty: 2, state: 'ok', note: '' } } },
  { code: 'TB1037', who: mkWho('ThS. Mai Thị Lan', 'GV0253', 'GV', 'Khoa Kinh tế'), items: [{ id: 'remote', qty: 1 }], room: 'A.01.02', b: { date: DT2, time: '09:30' }, d: { date: DT2, time: '12:00' }, status: 'returned', created: '08:50', handed: { date: DT2, time: '09:28' }, handedBy: 'Châu Minh Quân', cond: { remote: 'Bình thường' }, returned: { date: DT2, time: '12:09' }, returnedBy: 'Châu Minh Quân', late: 9, retCond: { remote: { qty: 1, state: 'ok', note: '' } } }
];
LOANS.forEach(t => { t.campus = campusOfRoom(t.room); });
const getLoan = c => LOANS.find(t => t.code === c);
const loanItemsLine = items => items.map(i => `${eqType(i.id).name} × ${i.qty}`).join(' · ');
/* Phiếu đang mượn mà quá giờ trả dự kiến */
const loanLateMin = t => t.status === 'borrowed' ? Math.max(0, minsSince(t.d)) : (t.late || 0);

/* ---------- Biên bản trả phòng do Bảo vệ gửi về ---------- */
const GUARDS = ['Đinh Công Thành', 'Tạ Văn Long'];
const REPORTS = [
  { id: 'BB-0236', room: 'M.03.01', who: 'ThS. Phạm Quốc Toàn', purpose: 'Họp giao ban tuần', date: DT0, end: '10:00', back: '10:05', result: 'full', missing: [], guard: GUARDS[0], note: 'Phòng gọn gàng, đủ thiết bị.', handled: true, incident: null },
  { id: 'BB-0235', room: 'A.01.01', who: 'ThS. Lê Quốc Bảo', purpose: 'INT2201 · 23DTH1A', date: DT0, end: '09:30', back: '09:30', result: 'missing', missing: [{ name: 'Remote trình chiếu', qty: 1, state: 'Thiếu' }], guard: GUARDS[1], note: 'Không thấy remote ở bàn giảng viên, đã hỏi giảng viên.', handled: false, incident: null },
  { id: 'BB-0234', room: 'A.03.01', who: 'TS. Huỳnh Anh Tuấn', purpose: 'LAW1105 · 24LU1', date: DT0, end: '09:30', back: '09:50', result: 'missing', missing: [{ name: 'Micro không dây Shure', qty: 1, state: 'Hỏng' }], guard: GUARDS[0], note: 'Micro không bật được, đèn báo pin không sáng.', handled: false, incident: null },
  { id: 'BB-0233', room: 'J.07.01', who: 'Khoa Công nghệ thông tin', purpose: 'Workshop Kỹ năng số', date: DT1, end: '16:00', back: '16:00', result: 'missing', missing: [{ name: 'Bảng tương tác Promethean', qty: 1, state: 'Hỏng' }], guard: GUARDS[1], note: 'Bảng tương tác không nhận cảm ứng.', handled: true, incident: 'SC1042' },
  { id: 'BB-0232', room: 'H.02.01', who: 'TT Hỗ trợ SV', purpose: 'Tập huấn kỹ năng mềm', date: DT1, end: '16:30', back: '16:42', result: 'full', missing: [], guard: GUARDS[0], note: '', handled: true, incident: null },
  { id: 'BB-0231', room: 'B.04.02', who: 'ThS. Đỗ Thị Hạnh', purpose: 'ARC2301 · 23KT1', date: DT1, end: '12:00', back: '12:00', result: 'full', missing: [], guard: GUARDS[1], note: '', handled: true, incident: null }
];
REPORTS.forEach(r => { r.campus = campusOfRoom(r.room); r.late = Math.max(0, toMin(r.back) - toMin(r.end)); });

/* ---------- Phòng đang sử dụng: dựng từ lịch trong ngày ---------- */
const USE_ORDER = { over: 0, soon: 1, using: 2, returned: 3 };
const OVER_ROOMS = ['J.06.04'];   // phòng đã hết giờ nhưng chưa có biên bản (dữ liệu mẫu)
const REMIND_MIN = 10;   // thời gian nhắc trước giờ kết thúc (Admin cấu hình, mặc định 10 phút)
const reportOf = (room, end) => REPORTS.find(r => r.room === room && r.date === TODAY && r.end === end);

/* ---------- Dựng danh sách phòng đang sử dụng từ lịch trong ngày ---------- */
function buildUsage() {
  const now = toMin(NOW_TIME), rows = [];
  Object.entries(DAY_SCHEDULE).forEach(([room, segs]) => segs.forEach(([s, e, kind, title, who]) => {
    if (kind === 'pending' || s * 60 > now) return;
    const rep = reportOf(room, hm(e));
    let st;
    if (e * 60 > now) st = e * 60 - now <= REMIND_MIN ? 'soon' : 'using';
    else st = rep || !OVER_ROOMS.includes(room) ? 'returned' : 'over';
    const info = ROOMS.find(r => r.code === room);
    rows.push({ room, s, e, kind, title, who, st, rep, campus: info.campus, type: info.type, building: info.building, left: e * 60 - now });
  }));
  return rows.sort((a, b) => USE_ORDER[a.st] - USE_ORDER[b.st] || a.e - b.e);
}
const USAGE = buildUsage();

/* ---------- Sự cố ----------
   status: wait (Chờ duyệt) | received (Đã tiếp nhận) | repairing (Đang sửa) | done (Đã xử lý) | rejected (Đã từ chối)
   priority: urgent (Khẩn cấp) | normal (Thông thường) | null (chưa xếp)  */
const INC_TEXT = { wait: 'Chờ duyệt', received: 'Đã tiếp nhận', repairing: 'Đang sửa', done: 'Đã xử lý', rejected: 'Đã từ chối' };
const INC_BADGE = { wait: 'pending', received: 'info', repairing: 'blue', done: 'ok', rejected: 'neutral' };
const PRIO_TEXT = { urgent: 'Khẩn cấp', normal: 'Thông thường' };
const STAGES = ['sent', 'received', 'repairing', 'done'];
const STAGE_TITLE = { sent: 'Đã gửi', received: 'Đã tiếp nhận', repairing: 'Đang sửa', done: 'Đã xử lý' };
const SOURCES = ['SV', 'GV', 'Nhận trả thiết bị', 'Biên bản trả phòng'];
const TECHS = [
  { name: 'Cao Hoàng Nam', campus: 'cs1', area: 'Tòa A, B' },
  { name: 'Từ Gia Bảo', campus: 'cs2', area: 'Tòa H, J' },
  { name: 'Mai Văn Tín', campus: 'cs3', area: 'Tòa M' }
];
const mkT = (date, time) => ({ date, time });
const INCIDENTS = [
  { code: 'SC1048', kind: 'device', target: 'Máy chiếu', place: 'J.06.04', desc: 'Máy chiếu không lên hình khi bật, đèn nguồn nhấp nháy đỏ.', source: 'GV', by: 'TS. Nguyễn Văn Phúc', status: 'wait', priority: null, tech: null, inUse: 'INT1306 · 08:00 – 10:30', times: { sent: mkT(DT0, '08:12') }, img: 'may-chieu-j604.jpg', log: [] },
  { code: 'SC1047', kind: 'room', target: 'Phòng A.03.01', place: 'A.03.01', desc: 'Mất kết nối mạng, không vào được hệ thống chấm công.', source: 'SV', by: 'Lê Hoài An', status: 'wait', priority: null, tech: null, inUse: 'Dạy bù MKT1301 · 09:30 – 11:00', times: { sent: mkT(DT0, '10:20') }, img: null, log: [] },
  { code: 'SC1046', kind: 'device', target: 'Hệ thống âm thanh hội trường', place: 'H.01.01', desc: 'Loa bên trái rè và mất tiếng khi dùng micro không dây.', source: 'GV', by: 'ThS. Mai Thị Lan', status: 'received', priority: 'urgent', tech: null, inUse: 'Lễ khai giảng học kỳ · 08:00 – 12:00', times: { sent: mkT(DT0, '09:50'), received: mkT(DT0, '09:58') }, img: null, log: [{ at: mkT(DT0, '09:58'), text: 'Phòng CSVC duyệt, mức Khẩn cấp' }] },
  { code: 'SC1045', kind: 'device', target: 'Camera hội nghị Logitech Rally', place: 'M.04.01', desc: 'Camera không nhận tín hiệu, phần mềm báo mất kết nối USB.', source: 'GV', by: 'ThS. Vũ Minh Tâm', status: 'repairing', priority: 'normal', tech: 'Mai Văn Tín', inUse: null, times: { sent: mkT(DT1, '15:10'), received: mkT(DT1, '15:25'), repairing: mkT(DT0, '08:30') }, img: 'camera-m401.jpg', log: [{ at: mkT(DT1, '15:25'), text: 'Phòng CSVC duyệt, mức Thông thường' }, { at: mkT(DT1, '15:30'), text: 'Phân công Mai Văn Tín' }, { at: mkT(DT0, '08:30'), text: 'Kỹ thuật bắt đầu sửa' }] },
  { code: 'SC1044', kind: 'device', target: 'Dây cáp HDMI số 05', place: 'H.02.01', desc: 'Đầu cáp bị gãy khi nhận trả (phiếu TB1040).', source: 'Nhận trả thiết bị', by: 'Phòng CSVC', status: 'received', priority: 'normal', tech: null, inUse: null, times: { sent: mkT(DT1, '15:55'), received: mkT(DT1, '15:55') }, img: null, loan: 'TB1040', log: [{ at: mkT(DT1, '15:55'), text: 'Phòng CSVC tạo phiếu từ nhận trả thiết bị, duyệt sẵn' }] },
  { code: 'SC1043', kind: 'device', target: 'Ổ điện kéo dài số 07', place: 'Kho CSVC – Tòa A', desc: 'Công tắc không sáng, các ổ cắm không có điện.', source: 'SV', by: 'Lý Tuấn Kiệt', status: 'done', priority: 'normal', tech: 'Cao Hoàng Nam', result: 'replace', inUse: null, times: { sent: mkT('2026-11-20', '09:00'), received: mkT('2026-11-20', '09:20'), repairing: mkT('2026-11-20', '10:00'), done: mkT('2026-11-21', '15:00') }, img: 'o-dien-07.jpg', proof: 'nghiem-thu-o-dien-07.jpg', log: [{ at: mkT('2026-11-20', '09:20'), text: 'Phòng CSVC duyệt, mức Thông thường' }, { at: mkT('2026-11-21', '15:00'), text: 'Thay thế bằng Ổ điện kéo dài số 12' }] },
  { code: 'SC1042', kind: 'device', target: 'Bảng tương tác Promethean', place: 'J.07.01', desc: 'Bảng tương tác không nhận cảm ứng (biên bản trả phòng BB-0233).', source: 'Biên bản trả phòng', by: 'Phòng CSVC', status: 'done', priority: 'normal', tech: 'Từ Gia Bảo', result: 'repair', inUse: null, times: { sent: mkT(DT1, '16:20'), received: mkT(DT1, '16:20'), repairing: mkT(DT1, '16:45'), done: mkT(DT0, '09:10') }, img: null, proof: 'hieu-chinh-cam-ung.jpg', log: [{ at: mkT(DT1, '16:20'), text: 'Phòng CSVC tạo phiếu từ biên bản trả phòng, duyệt sẵn' }, { at: mkT(DT0, '09:10'), text: 'Kỹ thuật hiệu chỉnh lại cảm ứng, đã xử lý' }] },
  { code: 'SC1041', kind: 'room', target: 'Phòng B.02.07', place: 'B.02.07', desc: 'Máy chiếu không hiển thị hình.', source: 'SV', by: 'Trần Minh Khôi', status: 'rejected', priority: null, tech: null, inUse: null, reason: 'Phiếu trùng SC1038, đang xử lý.', times: { sent: mkT(DT1, '13:40') }, img: null, log: [{ at: mkT(DT1, '13:50'), text: 'Phòng CSVC từ chối: phiếu trùng' }] },
  { code: 'SC1040', kind: 'room', target: 'Phòng A.01.02', place: 'A.01.02', desc: 'Điều hòa không làm mát dù đã bật 20 phút.', source: 'SV', by: 'Phạm Gia Hân', status: 'repairing', priority: 'normal', tech: 'Cao Hoàng Nam', inUse: null, times: { sent: mkT(DT1, '09:30'), received: mkT(DT1, '09:45'), repairing: mkT(DT1, '10:20') }, img: null, log: [{ at: mkT(DT1, '09:45'), text: 'Phòng CSVC duyệt, mức Thông thường' }, { at: mkT(DT1, '09:50'), text: 'Phân công Cao Hoàng Nam' }, { at: mkT(DT1, '10:20'), text: 'Kỹ thuật bắt đầu sửa' }] },
  { code: 'SC1039', kind: 'device', target: 'Remote trình chiếu số 02', place: 'Kho CSVC – Tòa A', desc: 'Remote không điều khiển được máy chiếu, đã thay pin vẫn không chạy.', source: 'SV', by: 'Nguyễn Đình Thuần', status: 'received', priority: 'normal', tech: null, inUse: null, times: { sent: mkT(DT1, '14:05'), received: mkT(DT1, '14:15') }, img: null, log: [{ at: mkT(DT1, '14:15'), text: 'Phòng CSVC duyệt, mức Thông thường' }] },
  { code: 'SC1038', kind: 'device', target: 'Loa di động JBL PartyBox', place: 'Kho CSVC – Tòa H', desc: 'Loa không lên nguồn dù đã sạc đầy.', source: 'GV', by: 'ThS. Mai Thị Lan', status: 'repairing', priority: 'normal', tech: 'Từ Gia Bảo', cannotFix: 'Mạch nguồn hỏng, linh kiện không còn bán, đề nghị thay thế hoặc bảo hành.', inUse: null, times: { sent: mkT(DT2, '10:00'), received: mkT(DT2, '10:20'), repairing: mkT(DT2, '11:00') }, img: null, log: [{ at: mkT(DT2, '10:20'), text: 'Phòng CSVC duyệt, mức Thông thường' }, { at: mkT(DT2, '10:25'), text: 'Phân công Từ Gia Bảo' }, { at: mkT(DT2, '11:00'), text: 'Kỹ thuật bắt đầu sửa' }, { at: mkT(DT0, '08:50'), text: 'Kỹ thuật báo không khắc phục được' }] }
];
INCIDENTS.forEach(i => { i.campus = campusOfPlace(i.place); });
const getInc = c => INCIDENTS.find(i => i.code === c);
/* Khẩn cấp quá 15 phút mà kỹ thuật chưa tiếp nhận (chưa bắt đầu sửa) thì quá hạn */
const incOverdue = i => i.priority === 'urgent' && (i.status === 'wait' || i.status === 'received') && minsSince(i.times.sent) > 15;
const nextIncCode = () => 'SC' + (Math.max(...INCIDENTS.map(i => Number(i.code.slice(2)))) + 1);

/* ---------- Lịch sử sửa chữa của thiết bị / phòng (hiển thị trong chi tiết sự cố) ---------- */
const FIX_HISTORY = {
  'J.06.04': [{ at: '12/09/2026', text: 'Thay bóng đèn máy chiếu · Cao Hoàng Nam' }],
  'M.04.01': [{ at: '03/10/2026', text: 'Cập nhật phần mềm camera · Mai Văn Tín' }, { at: '18/08/2026', text: 'Thay cáp USB · Mai Văn Tín' }],
  'H.01.01': [{ at: '25/10/2026', text: 'Căn chỉnh âm lượng loa · Từ Gia Bảo' }],
  'A.01.02': [{ at: '14/09/2026', text: 'Vệ sinh dàn lạnh điều hòa · Cao Hoàng Nam' }]
};

/* ---------- Thông báo trên chuông ---------- */
const NOTIFS = [
  { id: 'n1', type: 'loan', title: 'Phiếu mượn thiết bị mới · TB1048', text: 'Nguyễn Đình Thuần mượn 1 dây cáp HDMI, nhận lúc 13:00.', time: '09:55 · 23/11/2026', href: 'csvc-equipment.html#TB1048', unread: true },
  { id: 'n2', type: 'incident', title: 'Sự cố mới · J.06.04', text: 'Máy chiếu không lên hình, phòng đang có lớp INT1306.', time: '08:12 · 23/11/2026', href: 'csvc-incidents.html#SC1048', unread: true },
  { id: 'n3', type: 'overdue', title: 'Sự cố Khẩn cấp quá hạn · H.01.01', text: 'Hệ thống âm thanh hội trường chưa có kỹ thuật tiếp nhận sau hơn 15 phút.', time: '10:15 · 23/11/2026', href: 'csvc-incidents.html#SC1046', unread: true },
  { id: 'n4', type: 'report', title: 'Biên bản trả phòng báo thiếu · A.01.01', text: 'Bảo vệ Tạ Văn Long báo thiếu 1 remote trình chiếu.', time: '09:30 · 23/11/2026', href: 'csvc-rooms.html#BB-0235', unread: true },
  { id: 'n5', type: 'late', title: 'Phòng quá giờ · J.06.04', text: 'Lớp INT1306 đã hết giờ lúc 10:30, chưa có biên bản trả phòng.', time: '10:31 · 23/11/2026', href: 'csvc-rooms.html#over', unread: false },
  { id: 'n6', type: 'progress', title: 'Kỹ thuật cập nhật · SC1045', text: 'Mai Văn Tín bắt đầu sửa camera hội nghị tại M.04.01.', time: '08:30 · 23/11/2026', href: 'csvc-incidents.html#SC1045', unread: false }
];

/* ---------- Nhân sự Phòng CSVC dùng làm "người thao tác" ---------- */
const ME = 'Trần Khánh Hưng';
