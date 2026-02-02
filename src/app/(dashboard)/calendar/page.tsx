import { supabaseAdmin } from '@/lib/supabase'
// Force dynamic rendering
export const dynamic = 'force-dynamic'
import CalendarView from './CalendarView'

async function getBookings() {
  const supabase = supabaseAdmin()
  
  // Get bookings for the next 3 months and past month
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 1)
  startDate.setDate(1)
  
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 3)
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      check_in,
      check_out,
      status,
      properties (
        id,
        name
      ),
      guests (
        id,
        name
      )
    `)
    .gte('check_out', startDate.toISOString().split('T')[0])
    .lte('check_in', endDate.toISOString().split('T')[0])
    .order('check_in', { ascending: true })
  
  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
  
  return data || []
}

async function getProperties() {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from('properties')
    .select('id, name')
    .eq('status', 'active')
    .order('name', { ascending: true })
  
  return data || []
}

export default async function CalendarPage() {
  const [bookings, properties] = await Promise.all([
    getBookings(),
    getProperties(),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-500">View all bookings across properties</p>
      </div>
      
      <CalendarView bookings={bookings} properties={properties} />
    </div>
  )
}
