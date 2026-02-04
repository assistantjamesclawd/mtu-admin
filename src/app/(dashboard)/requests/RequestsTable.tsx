'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Receipt, ExternalLink, ChevronRight, Calendar, User, Phone, Mail } from 'lucide-react'

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {requests.map((request) => (
          <div 
            key={request.id} 
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{request.service_name}</h3>
                  <p className="text-sm text-gray-500">{request.service_category?.replace('-', ' ')}</p>
                </div>
                <select
                  value={request.status}
                  onChange={(e) => updateStatus(request.id, e.target.value)}
                  disabled={updating === request.id}
                  className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer flex-shrink-0 ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              {/* Guest Info */}
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{request.guest_name}</p>
                  <a href={`mailto:${request.guest_email}`} className="text-sm text-[#3d3530] flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {request.guest_email}
                  </a>
                  {request.guest_phone && (
                    <a href={`tel:${request.guest_phone}`} className="text-sm text-[#3d3530] flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {request.guest_phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  {request.requested_date ? (
                    <span className="text-gray-900">Requested: {formatDate(request.requested_date)}</span>
                  ) : (
                    <span className="text-gray-400">No date specified</span>
                  )}
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-gray-500">Submitted {formatDate(request.created_at)}</span>
                </div>
              </div>

              {/* Notes */}
              {request.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{request.notes}</p>
                </div>
              )}

              {/* Invoice Status */}
              {request.invoice_id && (
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-gray-400" />
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                    request.invoice_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.invoice_status === 'paid' ? 'Invoice Paid' : 'Invoice Sent'}
                  </span>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <button
              onClick={() => router.push(`/requests/${request.id}`)}
              className="w-full px-4 py-3 bg-gray-50 border-t text-[#3d3530] font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              View Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
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
      </div>
    </>
  )
}
