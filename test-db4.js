const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function test() {
  const { data, error } = await supabase.from('subject_faculty_mapping').select('*')
  console.log('Assignments:', data, 'Error:', error)
  const { data: s, error: se } = await supabase.from('timetable_slots').select('*')
  console.log('Slots:', s, 'Error:', se)
}
test()
