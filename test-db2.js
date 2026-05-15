const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.from('subject_faculty_mapping').select('*')
  console.log('Assignments:', data, 'Error:', error)
}
test()
