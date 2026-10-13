# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: adult children living far from their parents.** Working people roughly 25–45, living in another province or abroad, whose elderly parents live at home in Hà Nội. They can only call after work and want someone to be physically present for a meal, a walk, or a conversation. They book visits, follow each visit's status from afar, and read the post-visit log on their phone.
- **Chuyên viên chăm sóc (caregivers):** local staff who receive assigned visits, read the relative's habits and the family's notes, start the visit, record four standard activities and send the log.
- **Điều phối viên (coordinators):** HomaCare staff who receive requests, check caregiver availability, assign visits and monitor progress. Accounts are provisioned by the project owner, not self-registered.
- **The elderly person does not operate the app.** The family still discusses and obtains their agreement for each visit.
- **Current evaluating audience:** lecturers, competition judges and fellow students who review the project and test the demo.

## Product Purpose

HomaCare connects families with local caregivers to arrange in-home companionship sessions for elderly relatives, and records what happened after every session. Parents stay in their familiar home and routines; the adult child gains a concrete way to take part in their care despite the distance.

The project is currently a **student project / competition entry (Đại học Kinh tế Quốc dân)**. Success right now means a working, credible MVP demo and supporting materials (thuyết minh, appendix screenshots, feature summary) that clearly show the full care loop: request → assignment → visit → log → rating.

## Positioning

Not a generic caregiver marketplace or a medical service: HomaCare is coordinated, per-session, **non-medical companionship** with a mandatory **post-visit log** for a family that cannot be there. Three roles (family, caregiver, coordinator) each have their own workspace, and every visit moves through a visible four-step status so the family always knows who is coming, when, and what happened.

## Operating Context

- Family flow: register → add relative profile (age, area, habits and wishes such as tea after dinner or walking times) → book a visit → see it in the care calendar → read the post-visit log → rate 1–5 stars → book the next one.
- Visit status: **Chờ phân công → Đã phân công → Đang chăm sóc → Hoàn thành**. Data refreshes when the user presses **Cập nhật** or reloads (no realtime).
- Caregiver records four standard activities: hỗ trợ bữa tối · đồng hành vận động nhẹ · trò chuyện & nhắc lịch sinh hoạt · kiểm tra an toàn trước khi kết thúc.
- Pilot area intended: one district/area of Hà Nội.
- Contact: 0338 031 425 · homacare@gmail.com.

## Capabilities and Constraints

- Static multi-page site (plain HTML/CSS/JS, no framework) in `preview/`, backed by Supabase (Auth, Postgres, Row Level Security, RPC functions for visit state changes). Hosted on Cloudflare Pages at https://homacare-demo.pages.dev, deployed by pushing `main`.
- Only the **Gói Ân cần** can be booked: 18:00–22:00, 4 hours, **320.000đ/buổi** (proposed price for the trial phase). Gói Chăm chút and Gói Thân tình are "đang phát triển" and not bookable.
- No online payment (submitting a request charges nothing), no push notifications, no in-app reschedule/cancel (contact by phone/email), no caregiver certificate review flow, no offline mode.
- Permissions are enforced server-side, not by hiding UI; 28 automated database tests cover permissions, ownership, schedule overlap, status, logs and ratings.
- Terminology: "ca", "buổi đồng hành", "chuyên viên chăm sóc", "điều phối viên", "nhật ký sau ca", "người thân".

## Brand Commitments

- Name **HomaCare** (Homa in teal, Care in apricot); H-mark logo/favicon `preview/assets/app-icon-h.png`.
- Tagline: **"Gửi trọn quan tâm, vẹn tròn đạo hiếu."** Hero line: **"Bạn ở xa. Sự quan tâm vẫn ở gần."**
- Voice: warm, respectful, plain Vietnamese; filial care (đạo hiếu) framing; never alarmist.
- Must always state the scope: **non-medical** support (no diagnosis, prescriptions, medication changes, injections, procedures or professional rehabilitation).

## Evidence on Hand

- **No real evidence yet:** no survey data, no confirmed caregivers or partner organisations, no real user reviews or testimonials. Future work must not fabricate statistics, testimonials, partner logos, certifications, ratings or customer counts.
- Names in the UI and screenshots (Bác Trần Văn An, chuyên viên Nguyễn Thanh Trúc, Trần Lan Anh) are **illustrative demo data** and must be labelled as such.
- Real assets: logo files in `preview/assets/`, AI-assisted illustration photos in `preview/assets/photos/`, mobile screenshots in `Phu-luc-anh-chup/`, idea document `docs/y-tuong-homacare.pdf`, original logo `docs/thuong-hieu/`.
- "Đào tạo căn bản 30 giờ" and staff vetting are **planned**, not in place; phrase them as dự kiến/định hướng.

## Product Principles

1. **The distant child must always know** who is coming, when, and what happened. Every flow ends in visible status or a log.
2. **Honest scope over big promises:** non-medical, one bookable package, trial price, planned (not existing) training. Say what is not there yet.
3. **Respect the elder's routines and consent:** habits and wishes drive each visit; the elder is a person, not a task list.
4. **Each role sees only its own work:** clear separate workspaces, server-enforced permissions.
5. **Mobile first for the family:** the core loop must be effortless on a phone.

## Accessibility & Inclusion

Vietnamese-language product; the paying users are working adults on phones, so mobile readability and touch targets are primary. Elderly people do not use the interface directly. No formal accessibility standard has been set.
