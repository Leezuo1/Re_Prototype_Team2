/* =====================================================
   Dữ liệu mẫu (không dùng dữ liệu thật) cho Admin và Người quản lý phòng
   Cần nạp sau mgmt.js (dùng fold)
   ===================================================== */

const ROLES = [
  'Sinh viên', 'Giảng viên', 'Phòng Đào tạo', 'TT Hỗ trợ SV', 'Quản lý CSVC',
  'Thư ký khoa / Trợ lý CTSV', 'Bảo vệ', 'Phòng CSVC', 'Kỹ thuật', 'Admin'
];

const DEPTS = [
  'Khoa Công nghệ thông tin', 'Khoa Kinh tế', 'Khoa Luật', 'Khoa Ngoại ngữ',
  'Khoa Kiến trúc', 'Khoa Dược', 'Phòng Đào tạo', 'Phòng CSVC', 'TT Hỗ trợ SV', 'Phòng CNTT'
];

/* ---- Tài khoản: [họ tên, mã, đơn vị, vai trò, đang hoạt động, còn lịch/phiếu chưa xong] ---- */
const ACCOUNT_SEED = [
  ['Nguyễn Đình Thuần', '2474802010101', 0, ['Sinh viên'], 1, 0],
  ['Lê Hoài An', '2474802010204', 0, ['Sinh viên'], 1, 1],
  ['Trần Minh Khôi', '2374801060318', 1, ['Sinh viên'], 1, 0],
  ['Phạm Gia Hân', '2474801040077', 3, ['Sinh viên'], 1, 0],
  ['Võ Thành Đạt', '2274801050412', 2, ['Sinh viên'], 0, 1],
  ['Đặng Ngọc Mai', '2474802010560', 0, ['Sinh viên', 'Thư ký khoa / Trợ lý CTSV'], 1, 0],
  ['Bùi Quang Huy', '2374801010233', 0, ['Sinh viên'], 1, 0],
  ['Hoàng Thu Trang', '2474801060145', 1, ['Sinh viên'], 1, 0],
  ['Ngô Bảo Châu', '2174801080091', 4, ['Sinh viên'], 0, 0],
  ['Dương Khánh Linh', '2474801090026', 5, ['Sinh viên'], 1, 0],
  ['Lý Tuấn Kiệt', '2374802010388', 0, ['Sinh viên'], 1, 1],
  ['Phan Thị Yến Nhi', '2474801040211', 3, ['Sinh viên'], 1, 0],
  ['TS. Nguyễn Văn Phúc', 'GV0142', 0, ['Giảng viên'], 1, 0],
  ['ThS. Trần Thị Bích Ngọc', 'GV0087', 1, ['Giảng viên'], 1, 1],
  ['ThS. Lê Quốc Bảo', 'GV0231', 0, ['Giảng viên'], 1, 0],
  ['PGS.TS. Phạm Hữu Lộc', 'GV0015', 2, ['Giảng viên'], 1, 0],
  ['ThS. Vũ Minh Tâm', 'GV0198', 3, ['Giảng viên'], 1, 0],
  ['ThS. Đỗ Thị Hạnh', 'GV0176', 4, ['Giảng viên', 'Thư ký khoa / Trợ lý CTSV'], 1, 0],
  ['TS. Huỳnh Anh Tuấn', 'GV0064', 5, ['Giảng viên'], 0, 0],
  ['ThS. Mai Thị Lan', 'GV0253', 1, ['Giảng viên'], 1, 0],
  ['Tuyền Quang Minh Nhân', 'CB0031', 6, ['Phòng Đào tạo'], 1, 0],
  ['Nguyễn Thị Hồng Nhung', 'CB0048', 6, ['Phòng Đào tạo'], 1, 0],
  ['Lê Thị Mỹ Duyên', 'CB0052', 8, ['TT Hỗ trợ SV'], 1, 0],
  ['Trương Văn Hiếu', 'CB0067', 8, ['TT Hỗ trợ SV'], 1, 0],
  ['Phạm Quốc Toàn', 'CB0019', 7, ['Quản lý CSVC', 'Phòng CSVC'], 1, 0],
  ['Châu Minh Quân', 'CB0073', 7, ['Phòng CSVC'], 1, 0],
  ['Lâm Thị Thu Hà', 'CB0081', 7, ['Phòng CSVC', 'Quản lý CSVC'], 1, 0],
  ['Đinh Công Thành', 'CB0090', 7, ['Bảo vệ'], 1, 0],
  ['Tạ Văn Long', 'CB0094', 7, ['Bảo vệ'], 1, 0],
  ['Cao Hoàng Nam', 'CB0102', 9, ['Kỹ thuật'], 1, 0],
  ['Từ Gia Bảo', 'CB0105', 9, ['Kỹ thuật'], 1, 1],
  ['Vũ Tuấn Linh', 'CB0003', 9, ['Admin'], 1, 0],
  ['Kim Ngọc Diễm', '2474801010340', 0, ['Sinh viên'], 1, 0],
  ['Tống Hải Đăng', '2374801050126', 2, ['Sinh viên'], 1, 0],
  ['Lương Thùy Dung', '2474801060099', 1, ['Sinh viên', 'Thư ký khoa / Trợ lý CTSV'], 1, 0],
  ['Thạch Văn Sơn', '2274802010157', 0, ['Sinh viên'], 0, 0],
  ['Quách Mỹ Linh', '2474801040302', 3, ['Sinh viên'], 1, 0],
  ['Hồ Thanh Tùng', 'GV0310', 0, ['Giảng viên'], 1, 0],
  ['Lưu Phương Thảo', 'GV0288', 3, ['Giảng viên'], 1, 0]
];

const ACCOUNTS = ACCOUNT_SEED.map(([name, code, dept, roles, active, open], i) => {
  const parts = name.replace(/^(TS\.|ThS\.|PGS\.TS\.)\s*/, '').split(/\s+/);
  const first = fold(parts[parts.length - 1]);
  const last = fold(parts[0]);
  const isStudent = /^\d/.test(code);
  return {
    id: i + 1, name, code, dept: DEPTS[dept], roles: roles.slice(),
    active: !!active, open: !!open,
    email: (isStudent ? `${first}.${code}` : `${first}.${last}`) + '@vanlanguni.vn'
  };
});

/* ---- Danh mục phòng ----
   status: active | maintenance | stopped ; future: số lịch đặt tương lai bị ảnh hưởng nếu đổi trạng thái */
const ROOM_STATUS = { active: 'Hoạt động', maintenance: 'Đang bảo trì', stopped: 'Ngưng sử dụng' };
const ROOM_TYPES = ['Phòng học', 'Hội trường', 'Phòng họp'];
const ROOM_OWNER = { 'Phòng học': 'Phòng Đào tạo', 'Hội trường': 'TT Hỗ trợ SV', 'Phòng họp': 'Quản lý CSVC' };

const ROOMS = [
  ['A.01.01', 'Phòng học', 60, 'A', 1, 'active', 2, 1], ['A.01.02', 'Phòng học', 60, 'A', 1, 'active', 3, 1],
  ['A.02.03', 'Phòng học', 45, 'A', 2, 'active', 0, 0], ['A.02.04', 'Phòng học', 45, 'A', 2, 'maintenance', 4, 0],
  ['A.03.01', 'Phòng học', 80, 'A', 3, 'active', 5, 1], ['A.03.05', 'Phòng học', 40, 'A', 3, 'active', 1, 0],
  ['B.02.01', 'Phòng học', 50, 'B', 2, 'active', 2, 0], ['B.02.07', 'Phòng học', 50, 'B', 2, 'active', 0, 0],
  ['B.04.02', 'Phòng học', 100, 'B', 4, 'active', 6, 1], ['B.05.03', 'Phòng học', 40, 'B', 5, 'stopped', 0, 0],
  ['J.04.01', 'Phòng học', 70, 'J', 4, 'active', 3, 0], ['J.05.02', 'Phòng học', 70, 'J', 5, 'active', 2, 0],
  ['J.06.03', 'Phòng học', 45, 'J', 6, 'active', 0, 0], ['J.06.04', 'Phòng học', 45, 'J', 6, 'active', 4, 1],
  ['J.07.01', 'Phòng học', 120, 'J', 7, 'active', 7, 1], ['J.07.02', 'Phòng học', 30, 'J', 7, 'maintenance', 2, 0],
  ['H.01.01', 'Hội trường', 350, 'H', 1, 'active', 5, 1], ['H.02.01', 'Hội trường', 200, 'H', 2, 'active', 3, 1],
  ['H.03.01', 'Hội trường', 120, 'H', 3, 'active', 2, 0],
  ['M.03.01', 'Phòng họp', 20, 'M', 3, 'active', 4, 1], ['M.03.02', 'Phòng họp', 20, 'M', 3, 'active', 2, 0],
  ['M.04.01', 'Phòng họp', 30, 'M', 4, 'active', 3, 1], ['M.04.02', 'Phòng họp', 12, 'M', 4, 'maintenance', 1, 0],
  ['M.05.01', 'Phòng họp', 40, 'M', 5, 'active', 2, 0]
].map(([code, type, cap, building, floor, status, future, locked]) => ({ code, type, cap, building, floor, status, future, locked: !!locked }));

/* ---- Danh mục thiết bị ---- */
const DEVICES = [
  ['TB-0001', 'Máy chiếu Epson EB-X49', 'Kho CSVC – Tòa A', 14, 'active', 1],
  ['TB-0002', 'Micro không dây Shure', 'Kho CSVC – Tòa H', 22, 'active', 1],
  ['TB-0003', 'Loa di động JBL PartyBox', 'Kho CSVC – Tòa H', 6, 'active', 0],
  ['TB-0004', 'Laptop Dell Latitude 3440', 'Kho CSVC – Tòa B', 18, 'active', 1],
  ['TB-0005', 'Bộ chuyển HDMI – Type-C', 'Kho CSVC – Tòa A', 40, 'active', 0],
  ['TB-0006', 'Remote trình chiếu Logitech', 'Kho CSVC – Tòa A', 25, 'active', 1],
  ['TB-0007', 'Camera hội nghị Logitech Rally', 'M.04.01', 1, 'maintenance', 0],
  ['TB-0008', 'Tivi Samsung 55 inch', 'M.03.01', 1, 'active', 0],
  ['TB-0009', 'Tivi Samsung 55 inch', 'M.03.02', 1, 'active', 0],
  ['TB-0010', 'Bảng tương tác Promethean', 'J.07.01', 1, 'active', 1],
  ['TB-0011', 'Máy chiếu Panasonic PT-LB', 'Kho CSVC – Tòa J', 9, 'stopped', 0],
  ['TB-0012', 'Dây nối dài 10m', 'Kho CSVC – Tòa A', 30, 'active', 0],
  ['TB-0013', 'Bàn phím + chuột không dây', 'Kho CSVC – Tòa B', 12, 'active', 0],
  ['TB-0014', 'Hệ thống âm thanh hội trường', 'H.01.01', 1, 'active', 1]
].map(([code, name, place, qty, status, locked]) => ({ code, name, place, qty, status, locked: !!locked }));

/* ---- Thời khóa biểu / lịch mượn mẫu cho một ngày ----
   Giờ ở dạng số thập phân (7.5 = 07:30). kind: class | loan | event | makeup | pending */
const DAY_SCHEDULE = {
  'A.01.01': [[7, 9.5, 'class', 'INT2201 · 23DTH1A', 'ThS. Lê Quốc Bảo'], [13, 15.5, 'class', 'ENG1102 · 24NN2B', 'ThS. Vũ Minh Tâm']],
  'A.01.02': [[9.5, 12, 'class', 'ECO1101 · 24KT1A', 'ThS. Mai Thị Lan'], [15.5, 17, 'loan', 'Họp lớp 23DTH2', 'Lê Hoài An']],
  'A.03.01': [[7, 9.5, 'class', 'LAW1105 · 24LU1', 'TS. Huỳnh Anh Tuấn'], [9.5, 11, 'makeup', 'Dạy bù · MKT1301', 'ThS. Trần Thị Bích Ngọc'], [14, 17, 'class', 'LAW2201 · 23LU2', 'TS. Huỳnh Anh Tuấn']],
  'B.04.02': [[7, 12, 'class', 'ARC2301 · 23KT1', 'ThS. Đỗ Thị Hạnh'], [13, 15, 'pending', 'Chờ duyệt · Seminar nhóm', 'Lý Tuấn Kiệt']],
  'J.06.04': [[8, 10.5, 'class', 'INT1306 · 24DTH3', 'TS. Nguyễn Văn Phúc'], [10.5, 12, 'loan', 'Ôn thi giữa kỳ', 'Trần Minh Khôi'], [15, 17.5, 'class', 'INT3401 · 22DTH1', 'TS. Nguyễn Văn Phúc']],
  'J.07.01': [[7, 9, 'class', 'PHA1101 · 24D1', 'PGS.TS. Phạm Hữu Lộc'], [9, 11.5, 'class', 'PHA1202 · 24D2', 'PGS.TS. Phạm Hữu Lộc'], [13, 16, 'loan', 'Workshop Kỹ năng số', 'Khoa CNTT']],
  'H.01.01': [[8, 12, 'event', 'Lễ khai giảng học kỳ', 'Sự kiện của trường'], [14, 17, 'pending', 'Chờ duyệt · Hội thảo AI trong giáo dục', 'Khoa CNTT']],
  'H.02.01': [[9, 11, 'loan', 'Chung kết CLB Debate', 'CLB Debate VLU'], [13.5, 16.5, 'loan', 'Tập huấn kỹ năng mềm', 'TT Hỗ trợ SV']],
  'H.03.01': [[14, 16, 'loan', 'Gặp gỡ doanh nghiệp', 'Khoa Kinh tế']],
  'M.03.01': [[8.5, 10, 'event', 'Họp giao ban tuần', 'Họp định kỳ · Phòng CSVC'], [14, 15.5, 'loan', 'Họp bộ môn Luật', 'TS. Huỳnh Anh Tuấn']],
  'M.03.02': [[10, 11.5, 'loan', 'Họp CLB học thuật', 'Phan Thị Yến Nhi']],
  'M.04.01': [[9, 11, 'loan', 'Họp hội đồng khoa', 'Khoa Kinh tế'], [13, 14.5, 'pending', 'Chờ duyệt · Họp triển khai đề tài', 'ThS. Vũ Minh Tâm']],
  'M.05.01': [[8, 9, 'event', 'Họp ban điều hành', 'Họp định kỳ · Ban Giám hiệu'], [15, 17, 'loan', 'Phỏng vấn thực tập', 'Khoa CNTT']]
};
