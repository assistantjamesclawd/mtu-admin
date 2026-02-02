import Link from 'next/link'
// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { supabaseAdmin } from '@/lib/supabase'
import { Users, Home, Calendar, ClipboardList, Crown, DollarSign, AlertCircle } from 'lucide-react'

async function getStats() {
  const supabase = supabaseAdmin()
  
  const now = new Date()
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  
  const [owners, properties, bookings, pendingRequests, activeMemberships, expiringMemberships, upcomingCheckins] = await Promise.all([
    supabase.from('owners').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('properties').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('bookings').select('id, total_amount', { count: 'exact' }),
    supabase.from('service_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('memberships').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('memberships').select('id', { count: 'exact' })
      .eq('status', 'active')
      .lte('expires_at', thirtyDaysFromNow.toISOString().split('T')[0]),
    supabase.from('bookings').select('id', { count: 'exact' })
      .gte('check_in', now.toISOString().split('T')[0])
      .lte('check_in', weekFromNow.toISOString().split('T')[0]),
  ])

  // Calculate revenue from bookings
  const totalRevenue = bookings.data?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0

  return {
    owners: owners.count || 0,
    properties: properties.count || 0,
    totalBookings: bookings.count || 0,
    pendingRequests: pendingRequests.count || 0,
    activeMemberships: activeMemberships.count || 0,
    expiringMemberships: expiringMemberships.count || 0,
    upcomingCheckins: upcomingCheckins.count || 0,
    totalRevenue,
  }
}

async function getRecentRequests() {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

async function getUpcomingBookings() {
  const supabase = supabaseAdmin()
  const now = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (name),
      guests (name)
    `)
    .gte('check_in', now)
    .order('check_in', { ascending: true })
    .limit(5)
  return data || []
}

export default async function Dashboard() {
  const stats = await getStats()
  const recentRequests = await getRecentRequests()
  const upcomingBookings = await getUpcomingBookings()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {stats.pendingRequests > 0 && (
          <Link href="/requests" className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4 hover:bg-yellow-100 transition-colors">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-yellow-800">{stats.pendingRequests} Pending Request{stats.pendingRequests !== 1 ? 's' : ''}</p>
              <p className="text-sm text-yellow-600">Needs your attention</p>
            </div>
          </Link>
        )}
        {stats.expiringMemberships > 0 && (
          <Link href="/memberships" className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4 hover:bg-orange-100 transition-colors">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-orange-800">{stats.expiringMemberships} Membership{stats.expiringMemberships !== 1 ? 's' : ''} Expiring</p>
              <p className="text-sm text-orange-600">Within 30 days</p>
            </div>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/owners" className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b5c4b1]/20 rounded-lg">
              <Users className="w-5 h-5 text-[#3d3530]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.owners}</p>
              <p className="text-sm text-gray-500">Active Owners</p>
            </div>
          </div>
        </Link>

        <Link href="/properties" className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b5c4b1]/20 rounded-lg">
              <Home className="w-5 h-5 text-[#3d3530]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.properties}</p>
              <p className="text-sm text-gray-500">Properties</p>
            </div>
          </div>
        </Link>

        <Link href="/memberships" className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b5c4b1]/20 rounded-lg">
              <Crown className="w-5 h-5 text-[#3d3530]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeMemberships}</p>
              <p className="text-sm text-gray-500">Active Members</p>
            </div>
          </div>
        </Link>

        <Link href="/bookings" className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b5c4b1]/20 rounded-lg">
              <Calendar className="w-5 h-5 text-[#3d3530]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingCheckins}</p>
              <p className="text-sm text-gray-500">Check-ins This Week</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Check-ins */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Check-ins</h2>
            <Link href="/bookings" className="text-sm text-[#3d3530] hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {upcomingBookings.length === 0 ? (
              <p className="p-5 text-gray-500 text-center">No upcoming check-ins</p>
            ) : (
              upcomingBookings.map((booking: any) => (
                <div key={booking.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guests?.name || 'Guest'}</p>
                      <p className="text-sm text-gray-500">{booking.properties?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.check_in).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((new Date(booking.check_in).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Service Requests */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Service Requests</h2>
            <Link href="/requests" className="text-sm text-[#3d3530] hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {recentRequests.length === 0 ? (
              <p className="p-5 text-gray-500 text-center">No service requests yet</p>
            ) : (
              recentRequests.map((request: any) => (
                <div key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{request.service_name}</p>
                      <p className="text-sm text-gray-500">{request.guest_name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : request.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
