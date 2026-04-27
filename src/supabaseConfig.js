import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zrpezxpebgnxgyspnjrk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bwCUqXXSWkKa9A12CN4WYA_lVBv2fqv';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);