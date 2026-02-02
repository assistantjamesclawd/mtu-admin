'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Receipt, Send, Upload, X, DollarSign, Check } from 'lucide-react'

interface ServiceRequest {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  service_category: string
  service_name: string
  requested_date: string | null
  notes: string | null
  status: string
  created_at: string
  invoice_id: string | null
  invoice_status: string | null
  invoice_url: string | null
}

interface LineItem {
  description: string
  amount: string
}

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<ServiceRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Invoice state
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: 'Grocery Total', amount: '' },
  ])
  const [serviceFeePercent, setServiceFeePercent] = useState('10')
  const [sending, setSending] = useState(false)
  const [invoiceSuccess, setInvoiceSuccess] = useState(false)

  useEffect(() => {
    fetchRequest()
  }, [params.id])

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/requests/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch request')
      const data = await res.json()
      setRequest(data.request)
    } catch (err) {
      setError('Failed to load request')
    } finally {
      setLoading(false)
    }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', amount: '' }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: 'description' | 'amount', value: string) => {
    const updated = [...lineItems]
    updated[index][field] = value
    setLineItems(updated)
  }

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0
      return sum + amount
    }, 0)
    const fee = subtotal * (parseFloat(serviceFeePercent) / 100)
    return { subtotal, fee, total: subtotal + fee }
  }

  const sendInvoice = async () => {
    if (!request) return
    
    const { subtotal, fee, total } = calculateTotal()
    if (total <= 0) {
      alert('Please add line items with amounts')
      return
    }

    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          customerEmail: request.guest_email,
          customerName: request.guest_name,
          lineItems: [
            ...lineItems.filter(item => parseFloat(item.amount) > 0).map(item => ({
              description: item.description,
              amount: Math.round(parseFloat(item.amount) * 100), // Convert to cents
            })),
            ...(fee > 0 ? [{
              description: `Service Fee (${serviceFeePercent}%)`,
              amount: Math.round(fee * 100),
            }] : []),
          ],
          serviceName: request.service_name,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invoice')
      }

      setInvoiceSuccess(true)
      setShowInvoiceForm(false)
      fetchRequest() // Refresh to get invoice data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Request not found</p>
        <Link href="/requests" className="text-[#3d3530] hover:underline mt-4 inline-block">
          ← Back to requests
        </Link>
      </div>
    )
  }

  const { subtotal, fee, total } = calculateTotal()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/requests" className="text-[#3d3530] hover:underline flex items-center gap-1 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to requests
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{request.service_name}</h1>
            <p className="text-gray-500">{request.service_category}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            request.status === 'completed' ? 'bg-green-100 text-green-800' :
            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            request.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {request.status}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Request Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Request Details</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Guest</p>
              <p className="font-medium">{request.guest_name}</p>
              <p className="text-sm text-gray-600">{request.guest_email}</p>
              {request.guest_phone && (
                <p className="text-sm text-gray-600">{request.guest_phone}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500">Requested Date</p>
              <p className="font-medium">
                {request.requested_date 
                  ? new Date(request.requested_date).toLocaleDateString('en-US', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })
                  : '—'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Submitted</p>
              <p className="font-medium">
                {new Date(request.created_at).toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </p>
            </div>

            {request.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes / Grocery List</p>
                <div className="mt-1 bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {request.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" /> Invoice
          </h2>

          {request.invoice_id ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                request.invoice_status === 'paid' ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {request.invoice_status === 'paid' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className={`font-medium ${
                    request.invoice_status === 'paid' ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {request.invoice_status === 'paid' ? 'Paid' : 'Invoice Sent'}
                  </span>
                </div>
                {request.invoice_url && (
                  <a 
                    href={request.invoice_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#3d3530] hover:underline"
                  >
                    View Invoice →
                  </a>
                )}
              </div>
            </div>
          ) : invoiceSuccess ? (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Invoice sent!</p>
              <p className="text-sm text-green-600">Customer will receive an email with payment link.</p>
            </div>
          ) : !showInvoiceForm ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No invoice created yet</p>
              <button
                onClick={() => setShowInvoiceForm(true)}
                className="bg-[#3d3530] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d3530]/90 transition-colors inline-flex items-center gap-2"
              >
                <Receipt className="w-4 h-4" /> Create Invoice
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Line Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                <div className="space-y-2">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                          className="w-28 border rounded-lg pl-7 pr-3 py-2 text-sm"
                        />
                      </div>
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => removeLineItem(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addLineItem}
                  className="mt-2 text-sm text-[#3d3530] hover:underline"
                >
                  + Add line item
                </button>
              </div>

              {/* Service Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Fee %</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={serviceFeePercent}
                    onChange={(e) => setServiceFeePercent(e.target.value)}
                    className="w-20 border rounded-lg px-3 py-2 text-sm"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service Fee ({serviceFeePercent}%)</span>
                  <span>${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowInvoiceForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendInvoice}
                  disabled={sending || total <= 0}
                  className="flex-1 bg-[#3d3530] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d3530]/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {sending ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4" /> Send Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
