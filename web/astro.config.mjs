// @ts-check
import { defineConfig } from 'astro/config';

// Website tĩnh (không SSR) để Cloudflare Pages phục vụ miễn phí như bản preview/.
// Mỗi trang build thành thư mục/index.html, ví dụ /app/dang-nhap/ → dist/app/dang-nhap/index.html.
export default defineConfig({
  site: 'https://homacare-demo.pages.dev',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1', port: 4321 },
  // Gói sẵn supabase-js khi khởi động máy chủ dev, tránh lỗi 504 "Outdated Optimize Dep" lần đầu mở trang app
  vite: { optimizeDeps: { include: ['@supabase/supabase-js'] } },
});
