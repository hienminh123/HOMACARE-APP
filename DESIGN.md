---
name: HomaCare
description: Gửi trọn quan tâm, vẹn tròn đạo hiếu. Hệ thống thiết kế cho webapp chăm sóc người cao tuổi tại nhà.
colors:
  teal: "#0F4C46"
  teal-hover: "#016860"
  teal-subtle: "#EEFAF8"
  apricot: "#F28C68"
  apricot-ink: "#B94D23"
  sand: "#F6EDE3"
  sand-canvas: "#FEF9F4"
  sky: "#C9D8E3"
  navy: "#1B2A41"
  white: "#FFFFFF"
  gray-ink-muted: "#626D7C"
  gray-ink-border: "#E3E6EC"
  gray-ink-input: "#7D8795"
  status-pending: "#7B4F02"
  status-pending-bg: "#FEF5EB"
  status-assigned: "#1F5D91"
  status-assigned-bg: "#F1F8FE"
  status-in-progress: "#0F4C46"
  status-in-progress-bg: "#EEFAF8"
  status-completed: "#136B38"
  status-completed-bg: "#EFFAF1"
  danger: "#A02228"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(2.25rem, 1.6rem + 2.8vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Nunito, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  reading:
    fontFamily: "Nunito, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Nunito, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  meta:
    fontFamily: "Nunito, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "20": "80px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 20px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.teal-hover}"
  button-quiet:
    backgroundColor: "{colors.teal-subtle}"
    textColor: "{colors.teal}"
    rounded: "{rounded.md}"
    height: "44px"
  button-accent:
    backgroundColor: "{colors.apricot}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    height: "44px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 14px"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "20px"
  pill-pending:
    backgroundColor: "{colors.status-pending-bg}"
    textColor: "{colors.status-pending}"
    rounded: "{rounded.full}"
    height: "28px"
  pill-assigned:
    backgroundColor: "{colors.status-assigned-bg}"
    textColor: "{colors.status-assigned}"
    rounded: "{rounded.full}"
    height: "28px"
  pill-in-progress:
    backgroundColor: "{colors.status-in-progress-bg}"
    textColor: "{colors.status-in-progress}"
    rounded: "{rounded.full}"
    height: "28px"
  pill-completed:
    backgroundColor: "{colors.status-completed-bg}"
    textColor: "{colors.status-completed}"
    rounded: "{rounded.full}"
    height: "28px"
---

# Design System: HomaCare

Phiên bản 1.2, 13/10/2026. v1.0 (duyệt cùng ngày) dùng Cal Sans + Be Vietnam Pro; v1.1 thử Lexend + font hệ thống; **v1.2 người dùng chốt Lora cho tiêu đề, Nunito cho nội dung, chữ "HomaCare" trên logo giữ Cal Sans**. Màu, khoảng cách, thành phần giữ nguyên từ v1.0. Từ giai đoạn 2, nguồn chuẩn là `web/src/styles/` của bản Astro. `preview/ds/` và `preview/design-system.html` giữ nguyên ở v1.0 (Cal Sans + Be Vietnam Pro) làm tài liệu tham khảo cho bản cũ. File này giải thích **khi nào dùng cái gì**; giá trị chính xác luôn lấy từ `tokens.css`.

| File | Vai trò |
| --- | --- |
| `web/src/styles/tokens.css` | Token primitive (dải màu, thang số) và token ngữ nghĩa (vai trò) |
| `web/src/styles/fonts.css` | `@font-face` Lora, Nunito (tự lưu trữ, tách Latin/tiếng Việt) và Cal Sans (chỉ chữ logo) |
| `web/src/styles/base.css` | Mặc định phần tử HTML: chữ, focus, vùng chọn, thanh cuộn |
| `web/src/styles/components.css` | 15 thành phần, tiền tố `hc-`; bản `.astro` ở `web/src/components/hc/` |
| `web/src/scripts/components.js` | Hành vi (tabs, sheet, toast, đánh giá), đặt `window.HC`; trạng thái ca dùng chung `web/src/lib/status.ts` |
| `web/public/icons.svg` | Bộ icon nét 1,75px trên lưới 24px (`<use href="/icons.svg#id">`) |

Thứ tự nạp: `tokens.css → fonts.css → base.css → components.css`, sau đó `components.js`. Trong Astro, `web/src/layouts/BaseLayout.astro` đã import đúng thứ tự cho mọi trang.

## Overview

**Một lá thư từ nhà, không phải bảng điều khiển bệnh viện.** HomaCare dành cho người con ở xa muốn biết bố mẹ hôm nay có người bên cạnh. Giao diện phải bình tĩnh, ấm, dễ đọc trên điện thoại sau giờ làm, và luôn trả lời ba câu hỏi: **ai đến, khi nào, đã xảy ra gì**.

- **Nền cát nhạt, chữ Navy, hành động Teal.** Apricot là điểm ấm hiếm hoi, dùng như dấu nhấn, không phủ cả màn hình.
- **Chữ làm chủ, trang trí lùi lại.** Lora (có chân) cho tiêu đề: ấm, trang trọng như một lá thư; Nunito (bo tròn) cho nội dung: thân thiện, dễ đọc trên điện thoại.
- **Trạng thái là xương sống.** Mỗi ca đi qua bốn bước *Chờ phân công → Đã phân công → Đang chăm sóc → Hoàn thành*, và bốn bước này hiện giống nhau ở mọi vai trò.
- **Ưu tiên điện thoại.** Thiết kế ở 375px trước, rồi mở rộng. Gia đình dùng điện thoại; điều phối viên dùng máy tính nhiều hơn nên có biến thể dày hơn.
- **Không phải dịch vụ y tế.** Không dùng biểu tượng chữ thập, ống nghe, nhịp tim hay màu đỏ cấp cứu cho trang trí.

## Colors

Tầng **primitive** (`--teal-50 … --teal-950`, `--apricot-*`, `--sand-*`, `--sky-*`, `--navy-*`, `--gray-*`, `--amber/blue/green/red-*`) dựng theo OKLCH, neo đúng 5 mã thương hiệu. **Component không bao giờ đọc primitive trực tiếp**; chúng đọc tầng **semantic** dưới đây.

### Primary

- **Teal `#0F4C46`** (`--color-action`, `--color-text-brand`): nút chính, liên kết, trạng thái đang chọn, chữ "Homa". Di chuột lên thì `--color-action-hover` (#016860); nền nhẹ dùng `--color-action-subtle` (#EEFAF8).

### Secondary

- **Apricot `#F28C68`** (`--color-accent`): nền nút điểm nhấn, sao đánh giá, chấm "có nhật ký mới", chữ "Care". Chỉ đạt **2,4:1** trên nền trắng nên **không bao giờ dùng làm màu chữ**. Chữ màu Apricot dùng `--color-text-accent` (apricot-600, 5,1:1). Chữ đặt trên nền Apricot phải là Navy (`--color-on-accent`).

### Tertiary

- **Sand `#F6EDE3`** (`--color-surface-warm`): khối ấm cho lời nhắn của gia đình và lời ghi của chuyên viên. Nền trang là bậc nhạt hơn, **Cát nhạt `#FEF9F4`** (`--color-canvas`).
- **Sky `#C9D8E3`**: avatar mặc định, khối thông tin trung tính (`--color-surface-cool`).

### Neutral

- **Navy `#1B2A41`** (`--color-text`): mọi chữ chính. Không dùng đen thuần.
- **Xám "Mực"** ngả xanh Navy: `--color-text-muted` (gray-600) cho chữ phụ, `--color-border` (gray-200) cho viền thẻ, `--color-border-input` (gray-500, 3,6:1) cho viền ô nhập, `--color-placeholder` (gray-600) cho chữ gợi ý.
- `--color-text-subtle` (gray-500, 3,6:1) **chỉ** cho chữ từ 18px trở lên hoặc chi tiết trang trí, không cho nội dung.

### Trạng thái ca

Đặt tên theo đúng giá trị trong database, để code chỉ cần `data-status="${visit.status}"`:

| Giá trị DB | Nhãn | Token | Icon |
| --- | --- | --- | --- |
| `pending` | Chờ phân công | `--status-pending-{bg,fg,dot,border}` (hổ phách) | đồng hồ cát |
| `assigned` | Đã phân công | `--status-assigned-*` (lam) | người + dấu tích |
| `in_progress` | Đang chăm sóc | `--status-in-progress-*` (teal) | chấm nhịp chậm |
| `completed` | Hoàn thành | `--status-completed-*` (lục) | vòng tròn + dấu tích |

Phản hồi chung: `--color-success`, `--color-warning`, `--color-danger`, `--color-info` cùng biến thể `-subtle` làm nền.

### Named Rules

- **Không màu nào đứng một mình.** Trạng thái luôn có chữ + icon. Người mù màu đỏ-lục vẫn phân biệt được bốn bước.
- **Một màu Apricot mỗi màn hình.** Nếu đã có nút Apricot, sao đánh giá là đủ; không thêm khối Apricot nữa.
- **Mọi cặp chữ/nền đạt WCAG AA**: chữ thường ≥ 4,5:1, chữ lớn và viền điều khiển ≥ 3:1. Trang `design-system.html` đo trực tiếp 17 cặp quan trọng; khi đổi token, mở trang đó kiểm tra lại.

## Typography

- **Lora** (tiêu đề): font biến thiên 400–700, tự lưu trữ trong `web/src/assets/fonts/` (latin 38 KB + tiếng Việt 9 KB, giấy phép OFL ở `web/public/assets/Lora-OFL.txt`). Tiêu đề dùng `--weight-display` (600). `font-display: block` để tiêu đề không nháy font. Dùng từ 18px trở lên.
- **Nunito** (nội dung, nút, nhãn, ô nhập): font biến thiên 400–700, tự lưu trữ (latin 39 KB + tiếng Việt 13 KB, `web/public/assets/Nunito-OFL.txt`), `font-display: swap`. 400 đoạn văn, 500 nhãn và tab, 600 tên người, nút và chỗ cần nhấn. **Không dùng 700 cho nội dung.**
- **Cal Sans** chỉ dùng cho chữ "HomaCare" trên logo (`.hc-wordmark`, token `--font-brand`), giữ như bản đang chạy: một độ đậm 400, file chung `/assets/CalSans-Regular.ttf` (TTF ~100 KB, nên chuyển woff2 khi có công cụ).
- Font đã loại vì **không có ký tự tiếng Việt** (thiếu dải U+1EA0–1EF1: ạ, ở, ự, ẫ…): **Outfit**, **Zain** (Zain còn thiếu cả ă, đ, ơ, ư). Trước khi đổi font, luôn kiểm tra font có bộ `vietnamese` trên Google Fonts.
- Cả hai font tự lưu trữ (`assets/CalSans-Regular.ttf`, `assets/fonts/*.woff2`), tách bộ ký tự Latin và tiếng Việt. Nên preload hai file: `CalSans-Regular.ttf` và `be-vietnam-pro-400-latin.woff2`.

### Hierarchy

| Token | Cỡ · khoảng dòng | Font | Dùng cho |
| --- | --- | --- | --- |
| `--text-3xl` | 36→56px · 1,15 | Lora | Tiêu đề lớn trang giới thiệu |
| `--text-2xl` | 32px · 1,15 | Lora | Tiêu đề trang |
| `--text-xl` | 24px · 1,3 | Lora | Tiêu đề mục, ngày của ca |
| `--text-lg` | 20px · 1,3 | Lora | Tiêu đề thẻ |
| `--text-md` | 18px · 1,55 | Nunito | Lời ghi trong nhật ký, đoạn dẫn |
| `--text-base` | 16px · 1,6 | Nunito | Nội dung, ô nhập, nút |
| `--text-sm` | 14px · 1,5 | Nunito | Metadata, nhãn ô, chữ phụ |
| `--text-xs` | 12px · 1,45 | Nunito | Nhãn bước trên timeline, số đếm, chú thích |

### Named Rules

- **Nội dung đọc tối thiểu 16px.** 12–14px chỉ cho nhãn và thông tin phụ, không cho câu cần đọc kỹ.
- **Ô nhập luôn 16px** để Safari trên iPhone không tự phóng to khi chạm.
- **Giờ, ngày, giá dùng số thẳng cột** (`font-variant-numeric: tabular-nums`, đã đặt sẵn cho `time`, `data`, `.hc-num`).
- **Đoạn văn tối đa `--measure` (68ch).**
- Khoảng dòng tiếng Việt rộng hơn tiếng Anh một nấc vì có dấu chồng; không giảm dưới 1,15 cho tiêu đề và 1,5 cho nội dung.

## Layout

- **Ưu tiên điện thoại.** Viết CSS cho 375px trước, mở rộng bằng `min-width`. Lề hai bên `--gutter` = 16px. Không bao giờ để trang cuộn ngang.
- **Khoảng cách bội số 4px** (`--space-1` = 4px … `--space-24` = 96px). Không dùng số lẻ như 13px, 18px.
- Trong một nhóm dùng khoảng nhỏ (8–12px), giữa các nhóm khoảng lớn (20–32px). **Phía trên tiêu đề luôn rộng hơn phía dưới.**
- Trên điện thoại: một cột, **BottomNav** cố định dưới cùng, nút chính rộng hết chiều ngang và nằm trong tầm ngón cái.
- Từ **900px**: BottomNav tự ẩn, điều hướng chuyển lên Header (`.hc-header__nav`). Nội dung tối đa `--container` (1120px).
- Thành phần dạng danh sách dùng **container query** (`.hc-visit-row`) để tự xếp lại theo chiều rộng của chính nó, không theo màn hình.
- **Vùng chạm tối thiểu 44×44px** (`--tap-min`) cho mọi thứ bấm được. Nút `--sm` (36px) tự nâng lên 44px trên màn hình cảm ứng; dòng chọn `.hc-check` cao 56px; ô nhập cao 48px.
- Tôn trọng `env(safe-area-inset-bottom)` cho BottomNav, Sheet và Toast trên iPhone có thanh Home.

## Elevation & Depth

Nền phẳng, chiều sâu đến từ viền mảnh + bóng nhẹ. Bóng luôn có độ lệch dọc và nhòe mềm, nhuộm Navy; **không dùng quầng màu** (bóng tâm 0 có màu Teal/Apricot) như bản cũ.

### Shadow Vocabulary

| Token | Vai trò | Dùng cho |
| --- | --- | --- |
| `--shadow-1` / `--elevation-card` | Tách khỏi nền | Thẻ, tab đang chọn |
| `--shadow-2` / `--elevation-raised` | Nổi lên | Thẻ bấm được khi hover, mục đang chọn |
| `--shadow-3` / `--elevation-overlay` | Lớp phủ | Sheet, modal, toast |

### Motion

| Token | Thời lượng | Dùng cho |
| --- | --- | --- |
| `--duration-fast` | 150ms | Hover, nhấn, đổi màu |
| `--duration-base` | 250ms | Toast, mở thành phần nhỏ |
| `--duration-slow` | 400ms | Sheet, modal, chuyển bước |
| `--duration-reveal` | 1100ms | Hiện dần khi cuộn, **chỉ trang giới thiệu** (đã chốt từ bản trước) |

Đường cong mặc định `--ease-out` = `cubic-bezier(0.22, 1, 0.36, 1)`. Khi người dùng bật "giảm chuyển động", mọi thời lượng về 0 và chấm nhịp, shimmer dừng.

### Named Rules

- **Chỉ một thứ chuyển động lặp lại trong app:** chấm nhịp của "Đang chăm sóc", vì nó mang thông tin (đang có người ở bên bố mẹ). Skeleton shimmer chỉ xuất hiện khi đang tải.

## Shapes

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `--radius-sm` | 8px | Chip thói quen, ô icon hoạt động, ảnh nhỏ |
| `--radius-md` | 12px | Nút, ô nhập, khối con trong thẻ, toast |
| `--radius-lg` | 20px | Thẻ, sheet, modal |
| `--radius-full` | 999px | Pill trạng thái, avatar, nút chỉ có icon |

Khối con bên trong thẻ dùng bậc nhỏ hơn thẻ một nấc (thẻ `lg`, khối trong `md`). Icon: nét 1,75px, đầu tròn, lưới 24px, lấy từ `/icons.svg`. Không dùng emoji hay ký tự Unicode thay icon.

## Components

Mọi lớp có tiền tố `hc-` để sống chung với CSS cũ (`.btn`, `.pill`, `.modal`) trong lúc chuyển dần. Xem bản chạy thật và HTML để chép trong `design-system.html`.

### Buttons — `.hc-btn`

- Biến thể: mặc định (chính, Teal) · `--secondary` (viền) · `--quiet` (nền Teal nhạt) · `--accent` (Apricot, chữ Navy) · `--ghost` (chỉ chữ) · `--danger`.
- Cỡ: `--sm` 36px (bảng dày trên máy tính) · mặc định 44px · `--lg` 52px (nút chính cuối màn hình điện thoại). `--block` rộng hết; `--icon` tròn, bắt buộc `aria-label`.
- Trạng thái: `:disabled`, `aria-disabled="true"`, `aria-busy="true"` (giữ nguyên kích thước, hiện vòng quay).
- **Mỗi màn hình một nút chính.** Nhãn là động từ nói rõ kết quả: "Đặt ca mới", "Gửi nhật ký", "Xác nhận và gửi yêu cầu".

### Inputs / Fields — `.hc-field`, `.hc-input`, `.hc-select`, `.hc-textarea`, `.hc-check`

- Nhãn (`.hc-label`) luôn ở trên ô; ghi "(không bắt buộc)" bằng `.hc-optional` thay vì đánh dấu sao cho ô bắt buộc.
- Gợi ý `.hc-hint`, lỗi `.hc-error` (có icon). Ô lỗi đặt `aria-invalid="true"` và `aria-describedby` trỏ tới câu lỗi.
- Focus: viền Teal + vòng Teal nhạt 4px. Ô chỉ đọc (`readonly`) có nền lõm.
- `.hc-check`: dòng chọn cao 56px cho bốn hoạt động của chuyên viên. Dùng `:has(input:checked)` để tô nền.
- Lỗi xuất hiện khi bấm gửi (không báo khi đang gõ), đặt ngay dưới ô liên quan, focus vào ô lỗi đầu tiên; gõ lại thì lỗi của ô đó mất. Lỗi không gắn với ô nào (mạng, quyền) đặt cuối biểu mẫu trong `.app-form-error` có `role="alert"`.
- Hai ô cạnh nhau dùng `.app-row2` (`align-items: start`, để câu lỗi dưới một ô không kéo cao ô bên cạnh).

### Chọn ngày — `.app-days` > `label.app-day` (khu app, giai đoạn 3)

- Không dùng `<input type="date">`: máy cài tiếng Anh hiện mm/dd. Thay bằng `fieldset` + hàng thẻ cuộn ngang, mỗi thẻ là một `input type="radio"` thật (trong suốt, phủ cả thẻ), nên phím mũi tên, Tab và trình đọc màn hình chạy sẵn.
- Thẻ 72 × 68px: dòng trên "Hôm nay" / "Ngày mai" / thứ viết tắt (T2…CN), dòng dưới dd/mm (`.hc-num`). Chọn: nền Teal chữ trắng. Focus: viền `--color-focus` trên cả thẻ (`:has(input:focus-visible)`).
- Ngày không đặt được (người thân đã có ca) để `disabled` + `.is-taken` + chữ "Đã có ca"; nhãn đọc `aria-label` đủ thứ, ngày/tháng/năm và ", đã có ca".
- Hàng tràn ra sát mép sheet (margin âm bằng padding sheet) để thấy rõ còn cuộn được; mở ra thì cuộn thẻ đang chọn vào giữa. Dưới hàng: một dòng gợi ý "Đã chọn: …" và chỗ báo lỗi riêng của ngày.

### Cards / Containers — `.hc-card`

- Biến thể: mặc định · `--flat` · `--sunken` · `--warm` (lời nhắn) · `--brand` (nền Teal) · `--flush` (không padding, cho danh sách) · `--interactive` (cả thẻ là liên kết).
- Phần: `__head`, `__label`, `__title`, `__meta`, `__body`, `__foot`, `__divider`.
- **Không lồng thẻ trong thẻ.** Vùng con dùng `.hc-person--boxed`, `.hc-visit__note` hoặc đường chia.

### Chips — `.hc-pill`, `.hc-chip`

- `.hc-pill[data-status]`: trạng thái ca, tạo bằng `HC.pill(status)`. `--sm` cho bảng. `data-tone="brand|accent"` + `--plain` cho nhãn như "Gói Ân cần", "Đang phát triển".
- `.hc-chip`: thói quen của người thân (nền Sand), có thể kèm icon.

### StatusTimeline — `.hc-timeline` (thành phần đặc trưng)

- Bốn bước, tạo bằng `HC.timeline(status, { vertical, times })`. Bước đã qua: nút Teal có dấu tích. Bước hiện tại: viền Teal + vòng sáng, `aria-current="step"`. Bước cuối khi hoàn thành: màu lục.
- Ngang trong thẻ (nhãn 12px); dọc (`--vertical`) ở trang chi tiết, có giờ của từng bước.

### VisitCard — `.hc-visit`, `.hc-visit-row`

- Gia đình: ngày (Lora 24px) + giờ, gói, giá → timeline → chuyên viên (hoặc "Đang chờ điều phối viên" với avatar viền đứt).
- Chuyên viên: người thân + tuổi + khu vực → chip thói quen → lời nhắn gia đình (khối Sand) → nút "Bắt đầu ca".
- Điều phối viên: `.hc-visit-row` một dòng trên máy tính, tự xếp thành 3 dòng khi khung hẹp hơn 620px.

### CareLogCard — `.hc-log`, `.hc-rating`

- Luôn hiện **đủ bốn hoạt động**; mục không làm ghi "Không thực hiện" (`.is-skipped`), không ẩn đi.
- Lời ghi của chuyên viên dùng `--text-md` (18px) trong khối Sand, kèm tên và giờ ghi.
- Đánh giá: 5 nút sao dạng `radiogroup`, dùng phím mũi tên và Home/End, phát sự kiện `hc:rate`. Đã đánh giá thì `data-readonly`. Trong app, chọn sao chưa gửi ngay: nút "Gửi đánh giá" chỉ bật khi đã chọn, gửi xong hiện chỉ đọc + toast.

### Avatar · Person — `.hc-avatar[data-role]`, `.hc-person`

- Cỡ `--sm` 32 · `--md` 40 · `--lg` 56 · `--xl` 80. Màu theo vai trò: `family` Apricot, `caregiver` Teal, `coordinator` Navy, `relative` Sand. `--pending` viền đứt khi chưa có người.
- `.hc-person` = avatar + tên (600) + vai trò (14px, xám). `--boxed` đặt trong khối lõm.

### Sheet / Modal — `dialog.hc-sheet`

- Dùng `<dialog>` gốc của trình duyệt (bẫy focus, phím Esc có sẵn). Điện thoại: trượt từ dưới lên, có thanh kéo; từ 640px: hộp giữa màn hình rộng 560px.
- Mở bằng `data-hc-open="id"` hoặc `HC.openSheet(id)`; đóng bằng `data-hc-close`, Esc, chạm nền tối. Focus quay về nút đã mở.
- Chỉ dùng khi cần tập trung xác nhận (xem lại trước khi gửi yêu cầu, phân công chuyên viên). Không dùng sheet cho nội dung đọc thường.
- `HC.closeSheet(dialog)` trả về Promise xong khi sheet đã đóng hẳn. Nếu sau khi lưu trang vẽ lại (nút đã mở sheet bị thay), chờ cả việc đóng và tải lại rồi mới đặt focus vào phần tử tương ứng mới (`refocus()` trong `family.ts`).
- **Mẫu sheet 2 bước** (đặt ca): một `<form>` chứa hai khối `[data-step="details"]` và `[data-step="review"]`; mô tả sheet ghi "Bước 1 trên 2 · …" / "Bước 2 trên 2 · …". Nút cuối đổi chữ theo bước: "Để sau" / "Xem lại yêu cầu" → "Quay lại sửa" / "Xác nhận và gửi yêu cầu". Chỉ gọi RPC ở bước 2; sang bước 2 thì focus vào khối xem lại (`tabindex="-1"`, có `aria-label`). Lỗi của một ô ở bước 1 (ví dụ trùng ngày) đưa về bước 1 và báo dưới ô đó. Đóng rồi mở lại luôn về bước 1.

### Toast — `HC.toast(text, { tone, title, duration })`

- Nền Navy, icon theo `tone` (`success`, `info`, `warning`, `danger`). Tự ẩn sau 4,5 giây, dừng khi rê chuột hoặc focus. Tối đa 3 cái cùng lúc. Trang có BottomNav thì toast nằm trên thanh.
- Dùng để xác nhận việc vừa xong. Lỗi cần người dùng sửa thì đặt cạnh ô nhập, không đưa vào toast.

### EmptyState — `.hc-empty`

- Icon trong vòng tròn Teal nhạt → tiêu đề (Lora 20px) → một câu nói vì sao trống → (tuỳ chọn) nút việc tiếp theo. `--compact` cho trong danh sách.
- Tài khoản mới luôn trống, nên đây thường là màn hình đầu tiên người dùng thấy: viết ấm áp và chỉ đường.

### Navigation — `.hc-tabs`, `.hc-bottomnav`, `.hc-header`

- **Tabs**: dạng phân đoạn, `role="tablist"`, phím mũi tên/Home/End, số đếm `.hc-tab__count`. `--full` chia đều chiều rộng trên điện thoại. Sự kiện `hc:tabchange`.
- **BottomNav**: 3–5 mục, luôn có nhãn chữ, mục hiện tại `aria-current="page"` có nền Teal nhạt sau icon, chấm Apricot `.hc-bottomnav__dot` cho mục có nội dung mới. Tự ẩn từ 900px (trừ `--always`).
- **Header**: dính khi cuộn, viền hiện khi nội dung trượt dưới (`data-hc-sticky`). Trang chính: logo + chữ HomaCare; trang con: nút quay lại + tiêu đề + phụ đề. Nút "Cập nhật" đặt ở đây cho tới khi có realtime.

### Skeleton — `.hc-skeleton`

- Biến thể `--text`, `--title`, `--circle`, `--pill`, `--block`; chỉnh kích thước bằng `--sk-w`, `--sk-h`, `--sk-size`. Dựng theo đúng hình dạng nội dung sắp hiện. Vùng đang tải đặt `aria-busy="true"` và một dòng `.hc-visually-hidden` "Đang tải…".

## Do's and Don'ts

### Do:

- **Do** đọc token ngữ nghĩa (`--color-action`, `--status-pending-bg`) trong component; chỉ `tokens.css` được chạm vào primitive.
- **Do** để mỗi luồng kết thúc bằng trạng thái nhìn thấy được hoặc nhật ký: gia đình ở xa phải luôn biết.
- **Do** ghi rõ "dữ liệu minh họa" khi dùng tên người mẫu (Bác Trần Văn An, Nguyễn Thanh Trúc, Trần Lan Anh).
- **Do** thử mọi màn hình ở 375px, phóng chữ 200%, và chỉ dùng bàn phím trước khi coi là xong.
- **Do** giữ phạm vi **phi y tế** ở mọi chỗ nói về dịch vụ.

### Don't:

- **Don't** viết mã màu, cỡ chữ, bo góc hay bóng trực tiếp trong CSS mới. Thiếu token thì thêm vào `tokens.css` kèm lý do.
- **Don't** dùng Apricot làm màu chữ, hoặc đặt chữ trắng lên nền Apricot.
- **Don't** đặt `font-weight` 700 cho bất kỳ font nào; tiêu đề dùng `--weight-display`.
- **Don't** dùng nhãn nhỏ phía trên tiêu đề (kicker/eyebrow), số mục 01/02/03 trang trí, chữ gradient, viền màu dày bên trái thẻ, hay bóng quầng màu.
- **Don't** lồng thẻ trong thẻ, hoặc mở modal cho việc không cần xác nhận.
- **Don't** bịa số liệu, đánh giá, chứng chỉ, logo đối tác hay số lượng khách hàng. Đào tạo 30 giờ và thẩm định nhân sự là **dự kiến**.
- **Don't** dùng hình ảnh y tế (chữ thập, ống nghe, nhịp tim) hay giọng báo động.

## Giọng văn

HomaCare nói như một người cháu lễ phép đang kể cho cả nhà nghe: ấm, rõ, ngắn, không quảng cáo.

- **Xưng hô:** gọi người dùng là "bạn" trên trang giới thiệu và trong app gia đình (lời chào cá nhân có thể dùng "anh/chị + tên"). Người cao tuổi là "bác", "ông", "bà" hoặc "người thân", không gọi là "bệnh nhân" hay "khách hàng".
- **Thuật ngữ cố định:** ca, buổi đồng hành, chuyên viên chăm sóc, điều phối viên, nhật ký sau ca, người thân, Gói Ân cần. Không dùng từ đồng nghĩa thay thế.
- **Nút là động từ + đối tượng:** "Đặt ca mới", "Gửi nhật ký", "Phân công". Không dùng "OK", "Xác nhận" đứng một mình, "Submit".
- **Câu lỗi nói vấn đề và cách sửa:** "Số điện thoại cần đủ 10 chữ số." / "Không kết nối được. Kiểm tra mạng rồi bấm Cập nhật." Không đổ lỗi cho người dùng, không dùng mã lỗi.
- **Trung thực về phạm vi:** "Gửi yêu cầu chưa tính phí", "giá đề xuất giai đoạn thử nghiệm", "đang phát triển". Nói rõ cái chưa có.
- **Không báo động:** không viết "khẩn cấp", "nguy hiểm", "đừng để quá muộn". Sự an tâm đến từ thông tin rõ ràng, không từ nỗi sợ.
- **Dấu câu và số:** dùng dấu gạch nối dài cho khoảng giờ (18:00–22:00), dấu chấm phân cách nghìn (320.000đ), ngày dạng dd/mm hoặc "Thứ Năm, 16/10".
- **Tagline và câu chủ đạo giữ nguyên:** "Gửi trọn quan tâm, vẹn tròn đạo hiếu." · "Bạn ở xa. Sự quan tâm vẫn ở gần."

## Chuyển dần code cũ

1. Thêm 4 file CSS và `components.js` vào trang cần sửa (thứ tự ở đầu file này). Token mới có tên trùng vài biến cũ trong `index.html` (`--radius-sm`, `--radius-md`, `--shadow-sm`…): xoá khối `:root` cũ của trang đó khi chuyển, đừng để hai định nghĩa cùng tồn tại.
2. Thay từng thành phần: `.pill.orange` → `HC.pill('pending')`, `.btn` → `.hc-btn`, `.modal` → `dialog.hc-sheet`…
3. Mỗi trang chuyển xong thì xoá CSS cũ tương ứng trong `styles.css` / `account.css`.
4. Với Astro (đã làm ở giai đoạn 2): mỗi thành phần là một file trong `web/src/components/hc/` dùng đúng lớp `hc-*` (`Button`, `Field`/`Input`/`Select`/`Textarea`/`Check`, `Card`, `StatusPill`, `StatusTimeline`, `VisitCard`, `VisitRow`, `CareLogCard`, `Rating`, `Avatar`, `Person`, `Chip`, `Sheet`, `EmptyState`, `Tabs`, `BottomNav`, `Header`, `Wordmark`, `Skeleton`, `Icon`). `StatusPill`/`StatusTimeline` nhận prop `status`. Phần app vẽ dữ liệu phía trình duyệt bằng `pill()`/`timeline()` trong `web/src/lib/status.ts` và các hàm trong `web/src/scripts/render.ts`, cho ra cùng HTML. Toast không có component, gọi `HC.toast()`.
