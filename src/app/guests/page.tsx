import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { Plus, UserCircle, Star } from 'lucide-react'

async function getGuests() {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching guests:', error)
    return []
  }
  return data || []
}

export default async function GuestsPage() {
  const guests = await getGuests()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-500">Manage guest profiles</p>
        </div>
        <Link
          href="/guests/new"
          className="flex items-center gap-2 bg-[#3d3530] text-white px-4 py-2 rounded-lg hover:bg-[#3d3530]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Guest
        </Link>
      </div>

      {/* Guests List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {guests.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No guests yet</p>
            <p className="text-sm text-gray-400">Guests will be added when they book or request services</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {guests.map((guest: any) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{guest.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {guest.email && <p>{guest.email}</p>}
                    {guest.phone && <p>{guest.phone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    {guest.is_member ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-[#b5c4b1]/30 text-[#3d3530]">
                        <Star className="w-3 h-3" />
                        Member
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {guest.tags && guest.tags.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {guest.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
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
