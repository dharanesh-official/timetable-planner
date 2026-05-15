import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('subject_faculty_mapping').select('*').limit(1)
  console.log(error ? 'Error: ' + error.message : 'Success: ' + JSON.stringify(data))
}
test()
