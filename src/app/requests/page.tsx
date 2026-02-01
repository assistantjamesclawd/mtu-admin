import { supabaseAdmin } from '@/lib/supabase'
import { ClipboardList } from 'lucide-react'
import RequestsTable from './RequestsTable'

async function getRequests() {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching requests:', error)
    return []
  }
  return data || []
}

export default async function RequestsPage() {
  const requests = await getRequests()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
        <p className="text-gray-500">Manage incoming concierge requests</p>
      </div>

      {/* Requests */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No service requests yet</p>
          <p className="text-sm text-gray-400 mt-2">Requests from the concierge site will appear here</p>
        </div>
      ) : (
        <RequestsTable requests={requests} />
      )}
    </div>
  )
}
