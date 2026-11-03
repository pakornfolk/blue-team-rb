// ใส่ค่า Supabase Project URL และ anon/publishable key หลังสร้างโปรเจกต์
// ห้ามใส่ service_role key หรือรหัสผ่านผู้ดูแลในไฟล์ frontend นี้
export const SUPABASE_URL = 'https://lfjhkoxkrzaslgcyitce.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_166wZvf_VkMVmDAjcSigPA_hNQgnUVb';
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
