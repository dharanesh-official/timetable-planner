const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase
        .from('timetable_slots')
        .select(`
          day_of_week,
          period_number,
          subjects(name, code, type),
          profiles(full_name),
          labs(name)
        `)
  console.log('Slots:', data)
  console.log('Error:', error)
}
test()
