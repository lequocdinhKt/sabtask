# Manual RLS / Auth verification checklist

Không thay thế automated tests. Ghi nhận kiểm thử thủ công sau khi deploy schema + Auth.

## Auth

- [ ] Chưa login: không đọc được `projects` / `tasks` bằng anon key (REST hoặc Table Editor với role anon)
- [ ] Login admin/member thành công; refresh trang vẫn giữ session
- [ ] Logout xoá session; không còn đọc dữ liệu nghiệp vụ

## Roles

- [ ] MEMBER không đổi được `role` của chính mình (UI readonly + RLS reject nếu bypass)
- [ ] MEMBER không xoá user khác
- [ ] ADMIN cập nhật được profile/role member (trong giới hạn policy)
- [ ] ADMIN không tự xoá chính mình qua UI

## Projects / membership

- [ ] MEMBER chỉ thấy project mình thuộc `project_members` (ADMIN thấy tất cả)
- [ ] MEMBER không đọc task của project mình không tham gia

## Notifications / time

- [ ] User chỉ đọc notification `user_id = self`
- [ ] User chỉ tạo time entry cho chính mình
- [ ] Assign/comment/status tạo notification (trigger) và Realtime cập nhật panel (nếu đã bật publication)

## Team Hub

- [ ] Message/channel persist sau reload
- [ ] MEMBER không tạo/xoá channel; ADMIN được
