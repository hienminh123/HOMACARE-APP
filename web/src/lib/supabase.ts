// Một client Supabase dùng chung cho cả app. Chỉ dùng Publishable key; quyền dữ liệu do RLS và RPC
// trong backend/schema.sql quyết định, không phụ thuộc việc ẩn nút trên giao diện.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config, FIXTURE } from './config';

function publicKey(value: string): boolean {
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value || '')) return true;
  try {
    return JSON.parse(atob(value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'anon';
  } catch {
    return false;
  }
}

export const configured =
  FIXTURE || (/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.supabaseUrl) && publicKey(config.supabasePublishableKey));

let client: SupabaseClient | null | undefined;

/** Trả về client, hoặc null nếu cấu hình chưa hợp lệ. Chế độ fixture trả client giả lập. */
export async function getClient(): Promise<SupabaseClient | null> {
  if (client !== undefined) return client;
  // So sánh trực tiếp import.meta.env.MODE để Vite thay bằng hằng số và bỏ hẳn fixture khỏi bản build thật
  if (import.meta.env.MODE === 'fixture') {
    const { createFixtureClient } = await import('./fixture');
    client = createFixtureClient();
  } else {
    client = configured
      ? createClient(config.supabaseUrl, config.supabasePublishableKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        })
      : null;
  }
  return client;
}
