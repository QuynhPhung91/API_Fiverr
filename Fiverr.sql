/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

INSERT INTO `BinhLuan` (`id`, `ma_cong_viec`, `ma_nguoi_binh_luan`, `ngay_binh_luan`, `noi_dung`, `sao_binh_luan`, `created_at`) VALUES
(1, 1, 1, '2026-08-05 10:00:00', 'Code chạy rất mượt, dev hỗ trợ nhiệt tình!', 3, '2026-08-10 17:25:26'),
(2, 1, 2, '2026-07-30 10:00:00', 'Thiết kế logo đẹp, dịch vụ chuyên nghiệp!', 4, '2026-08-10 17:25:26');
INSERT INTO `ChiTietLoaiCongViec` (`id`, `ten_chi_tiet`, `hinh_anh`, `ma_loai_cong_viec`) VALUES
(1, 'Lập trình Web', 'web_dev.png', 1),
(2, 'Lập trình Mobile App', 'mobile_dev.png', 1),
(3, 'Thiết kế Logo', 'logo_design.png', 2),
(4, 'Thiết kế Banner quảng cáo', 'banner_design.png', 2);
INSERT INTO `congviec` (`id`, `ten_cong_viec`, `danh_gia`, `gia_tien`, `hinh_anh`, `mo_ta`, `mo_ta_ngan`, `sao_cong_viec`, `ma_chi_tiet_loai`, `nguoi_tao`, `created_at`) VALUES
(1, 'Xây dựng Website bán hàng bằng NodeJS', 15, 5000000, 'web_job.png', 'Dịch vụ thiết kế website hoàn chỉnh, chuẩn SEO, bảo mật cao.', 'Lập trình web trọn gói', 5, 1, 2, '2026-08-10 17:23:05'),
(2, 'Thiết kế Logo thương hiệu chuyên nghiệp', 8, 1200000, 'logo_job.png', 'Cung cấp 3 mẫu phác thảo, bàn giao file gốc vector chất lượng cao.', 'Thiết kế logo công ty', 4, 3, 3, '2026-08-10 17:23:05');
INSERT INTO `LoaiCongViec` (`id`, `ten_loai_cong_viec`) VALUES
(1, 'Lập trình & Công nghệ'),
(2, 'Đồ họa & Thiết kế'),
(3, 'Viết lách & Dịch thuật'),
(4, 'Lập trình & Công nghệ'),
(5, 'Đồ họa & Thiết kế'),
(6, 'Viết lách & Dịch thuật');
INSERT INTO `thuecongviec` (`id`, `ma_cong_viec`, `ma_nguoi_thue`, `gia_tien`, `ngay_thue`, `hoanthanh`) VALUES
(1, 1, 3, 5000000, '2026-08-01 09:00:00', 1),
(2, 2, 1, 1200000, '2026-07-30 14:30:00', 0),
(3, 1, 3, 5000000, '2026-08-01 09:00:00', 1),
(4, 2, 1, 1200000, '2026-07-30 14:30:00', 0);
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `birth_day`, `gender`, `role`, `skill`, `certifiation`) VALUES
(1, 'Trần Văn khách', 'khachhangg@gmail.com', 'password123', '0901234567', '1996-01-01', 'Nam', 'USER', 'Không có', 'Không có'),
(2, 'Trần Thị Hoa', 'freelancer1@gmail.com', 'securepass', '0912345678', '1980-05-15', 'Nữ', 'USER', 'NodeJS, ReactJS, SQL', 'AWS Certified Developer'),
(3, 'Lê Văn Giỏi', 'freelancer2@gmail.com', 'designpass', '0923456789', '1991-10-20', 'Nam', 'USER', 'Photoshop, Illustrator', 'Adobe Certified Professional'),
(4, 'Bùi Quản Trị', 'admin@gmail.com', 'admin2026', '0934567890', '1987-12-12', 'Nam', 'ADMIN', 'Quản lý hệ thống', 'PMP Certification');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;