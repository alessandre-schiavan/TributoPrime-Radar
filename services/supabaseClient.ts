
import { createClient } from '@supabase/supabase-js';

export const APP_ID = "tributoprime-radar-v1";
export const SUPABASE_URL = "https://noaxjjqrfyrqjfvtciuw.supabase.co";
export const SUPABASE_KEY = "sb_publishable_NzSU_aITUKlEeQ-Jz5Efdw_mIP2jYuM";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
