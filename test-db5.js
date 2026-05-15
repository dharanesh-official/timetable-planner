const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase
    .from('timetable_slots')
    .select(`
      id,
      timetables!inner(
        semester_id,
        semesters!inner(semester_number)
      )
    `)
    .limit(1)
  console.log("Data:", JSON.stringify(data, null, 2))
  console.log("Error:", error)
}
run()
