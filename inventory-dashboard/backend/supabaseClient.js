/* ============================================================
   AARBI CLOTHING — Supabase client setup
   Credentials .env file se aate hain (dekh .env.example).
   ============================================================ */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase Dashboard → Settings → API → Project URL
const SUPABASE_URL = process.env.SUPABASE_URL;

// Key priority:
//   1. Service role key (secret) — backend ke liye best, RLS bypass karta hai
//   2. Anon key — situation ke mutabik (uske liye SQL me RLS policy di hai)
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('⚠️  ⚠️  SUPABASE_URL / SUPABASE key missing — .env file check karein');
}

// createClient tabhi banao jab dono present hon (nahi to deploy par crash hota)
const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

module.exports = { supabase };