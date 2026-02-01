'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditOwnerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    primary_name: '',
    primary_email: '',
    primary_phone: '',
    secondary_name: '',
    secondary_email: '',
    secondary_phone: '',
    home_access_info: '',
    full_time_location: '',
    client_type: 'concierge',
    pm_plan: '',
    airbnb_fee_percent: '',
    status: 'active',
    notes: '',
    referral_source: '',
  })

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      fetch(`/api/owners/${p.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.owner) {
            setFormData({
              primary_name: data.owner.primary_name || '',
              primary_email: data.owner.primary_email || '',
              primary_phone: data.owner.primary_phone || '',
              secondary_name: data.owner.secondary_name || '',
              secondary_email: data.owner.secondary_email || '',
              secondary_phone: data.owner.secondary_phone || '',
              home_access_info: data.owner.home_access_info || '',
              full_time_location: data.owner.full_time_location || '',
              client_type: data.owner.client_type || 'concierge',
              pm_plan: data.owner.pm_plan || '',
              airbnb_fee_percent: data.owner.airbnb_fee_percent?.toString() || '',
              status: data.owner.status || 'active',
              notes: data.owner.notes || '',
              referral_source: data.owner.referral_source || '',
            })
          }
          setLoading(false)
        })
    })
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/owners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          airbnb_fee_percent: formData.airbnb_fee_percent ? parseFloat(formData.airbnb_fee_percent) : null,
          pm_plan: formData.pm_plan || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update owner')
      }

      router.push(`/owners/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/owners/${id}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Owner
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Owner</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Primary Contact */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.primary_name}
                onChange={e => setFormData({...formData, primary_name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.primary_email}
                onChange={e => setFormData({...formData, primary_email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.primary_phone}
                onChange={e => setFormData({...formData, primary_phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Secondary Contact */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Secondary Contact (Spouse)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.secondary_name}
                onChange={e => setFormData({...formData, secondary_name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.secondary_email}
                onChange={e => setFormData({...formData, secondary_email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.secondary_phone}
                onChange={e => setFormData({...formData, secondary_phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full-time Location</label>
              <input
                type="text"
                value={formData.full_time_location}
                onChange={e => setFormData({...formData, full_time_location: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Access Info</label>
              <textarea
                rows={3}
                value={formData.home_access_info}
                onChange={e => setFormData({...formData, home_access_info: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
              <input
                type="text"
                value={formData.referral_source}
                onChange={e => setFormData({...formData, referral_source: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Client Type & Pricing */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Type & Pricing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
              <select
                value={formData.client_type}
                onChange={e => setFormData({...formData, client_type: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              >
                <option value="concierge">Concierge Only</option>
                <option value="property_management">Property Management</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                value={formData.pm_plan}
                onChange={e => setFormData({...formData, pm_plan: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              >
                <option value="">Not applicable</option>
                <option value="250">$250/month</option>
                <option value="350">$350/month</option>
                <option value="airbnb">Airbnb %</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airbnb Fee %</label>
              <input
                type="number"
                step="0.5"
                value={formData.airbnb_fee_percent}
                onChange={e => setFormData({...formData, airbnb_fee_percent: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#3d3530] text-white py-3 rounded-lg font-medium hover:bg-[#3d3530]/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/owners/${id}`}
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
