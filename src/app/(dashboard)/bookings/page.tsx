import Link from 'next/link'
// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { supabaseAdmin } from '@/lib/supabase'
import { Plus, Calendar } from 'lucide-react'

async function getBookings() {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (
        id,
        name
      ),
      guests (
        id,
        name
      )
    `)
    .order('check_in', { ascending: false })
  
  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
  return data || []
}

export default async function BookingsPage() {
  const bookings = await getBookings()

  const statusColors: Record<string, string> = {
    inquiry: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    checked_in: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500">Manage reservations</p>
        </div>
        <Link
          href="/bookings/new"
          className="flex items-center gap-2 bg-[#3d3530] text-white px-4 py-2 rounded-lg hover:bg-[#3d3530]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Booking
        </Link>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No bookings yet</p>
            <Link
              href="/bookings/new"
              className="text-[#3d3530] font-medium hover:underline"
            >
              Add your first booking →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {booking.properties?.name || 'Unknown Property'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {booking.guests?.name || 'Unknown Guest'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24))} nights
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-gray-600">{booking.source || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                      {booking.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    {booking.total_amount ? `$${booking.total_amount.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
