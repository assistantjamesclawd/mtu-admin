import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { Crown, Plus, Calendar, DollarSign } from 'lucide-react'

async function getMemberships() {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      guests (
        id,
        name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching memberships:', error)
    return []
  }
  return data || []
}

export default async function MembershipsPage() {
  const memberships = await getMemberships()

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Memberships</h1>
          <p className="text-gray-500">Manage concierge membership subscriptions</p>
        </div>
        <Link
          href="/memberships/new"
          className="flex items-center gap-2 bg-[#3d3530] text-white px-4 py-2 rounded-lg hover:bg-[#3d3530]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Membership
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Crown className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Members</p>
              <p className="text-xl font-bold text-gray-900">
                {memberships.filter((m: any) => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-xl font-bold text-gray-900">
                {memberships.filter((m: any) => {
                  if (!m.expires_at || m.status !== 'active') return false
                  const expires = new Date(m.expires_at)
                  const thirtyDays = new Date()
                  thirtyDays.setDate(thirtyDays.getDate() + 30)
                  return expires <= thirtyDays
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">
                ${memberships.reduce((sum: number, m: any) => sum + (m.amount_paid || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Memberships List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {memberships.length === 0 ? (
          <div className="p-12 text-center">
            <Crown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No memberships yet</p>
            <p className="text-sm text-gray-400">Memberships will appear here when customers sign up</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {memberships.map((membership: any) => (
                <tr key={membership.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{membership.guests?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{membership.guests?.email}</p>
                    {membership.guests?.phone && (
                      <p className="text-sm text-gray-500">{membership.guests?.phone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      membership.type === 'annual' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {membership.type === 'annual' ? '🎫 Annual' : '🏠 Booking'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {membership.property_address || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {membership.started_at && (
                      <p>{new Date(membership.started_at).toLocaleDateString()}</p>
                    )}
                    {membership.expires_at && (
                      <p className="text-gray-400">→ {new Date(membership.expires_at).toLocaleDateString()}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[membership.status] || 'bg-gray-100 text-gray-800'}`}>
                      {membership.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    {membership.amount_paid ? `$${membership.amount_paid}` : '—'}
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
