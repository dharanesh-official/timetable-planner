import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_string: 'ALTER TABLE subject_faculty_mapping ADD COLUMN IF NOT EXISTS fixed_slots JSONB DEFAULT \'[]\'::jsonb;'
  })
  
  if (error) {
    return Response.json({ error })
  }
  return Response.json({ success: true, data })
}
