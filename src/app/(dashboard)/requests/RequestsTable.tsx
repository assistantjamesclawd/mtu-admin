'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Receipt, ExternalLink } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const statusOptions = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

export default function RequestsTable({ requests: initialRequests }: { requests: any[] }) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [updating, setUpdating] = useState<string | null>(null)

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setRequests(prev =>
          prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
        )
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">{request.service_name}</p>
                <p className="text-sm text-gray-500">{request.service_category}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-gray-900">{request.guest_name}</p>
                <p className="text-sm text-gray-500">{request.guest_email}</p>
                {request.guest_phone && (
                  <p className="text-sm text-gray-500">{request.guest_phone}</p>
                )}
              </td>
              <td className="px-6 py-4">
                <p className="text-gray-900">
                  {request.requested_date 
                    ? new Date(request.requested_date).toLocaleDateString()
                    : '—'}
                </p>
                {request.notes && (
                  <p className="text-sm text-gray-500 max-w-xs truncate" title={request.notes}>
                    {request.notes}
                  </p>
                )}
              </td>
              <td className="px-6 py-4">
                <select
                  value={request.status}
                  onChange={(e) => updateStatus(request.id, e.target.value)}
                  disabled={updating === request.id}
                  className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4">
                {request.invoice_id ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                    request.invoice_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <Receipt className="w-3 h-3" />
                    {request.invoice_status === 'paid' ? 'Paid' : 'Sent'}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(request.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => router.push(`/requests/${request.id}`)}
                  className="text-[#3d3530] hover:underline text-sm font-medium inline-flex items-center gap-1"
                >
                  View <ExternalLink className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
