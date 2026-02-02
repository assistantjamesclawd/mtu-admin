import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { Plus, Phone, Mail } from 'lucide-react'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'

async function getOwners() {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .order('primary_name', { ascending: true })
  
  if (error) {
    console.error('Error fetching owners:', error)
    return []
  }
  return data || []
}

export default async function OwnersPage() {
  const owners = await getOwners()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owners</h1>
          <p className="text-gray-500">Manage your homeowner clients</p>
        </div>
        <Link
          href="/owners/new"
          className="flex items-center gap-2 bg-[#3d3530] text-white px-4 py-2 rounded-lg hover:bg-[#3d3530]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Owner
        </Link>
      </div>

      {/* Owners List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {owners.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No owners yet</p>
            <Link
              href="/owners/new"
              className="text-[#3d3530] font-medium hover:underline"
            >
              Add your first owner →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {owners.map((owner: any) => (
                <tr key={owner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/owners/${owner.id}`} className="hover:underline">
                      <p className="font-medium text-gray-900">{owner.primary_name}</p>
                      {owner.secondary_name && (
                        <p className="text-sm text-gray-500">& {owner.secondary_name}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      {owner.primary_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {owner.primary_phone}
                        </span>
                      )}
                      {owner.primary_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {owner.primary_email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      owner.client_type === 'property_management'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {owner.client_type === 'property_management' ? 'Prop Mgmt' : 'Concierge'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {owner.pm_plan === 'airbnb' 
                      ? `${owner.airbnb_fee_percent}%`
                      : owner.pm_plan 
                      ? `$${owner.pm_plan}/mo`
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      owner.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : owner.status === 'prospect'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {owner.status}
                    </span>
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
