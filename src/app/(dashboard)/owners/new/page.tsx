'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewOwnerPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      primary_name: formData.get('primary_name'),
      primary_email: formData.get('primary_email') || null,
      primary_phone: formData.get('primary_phone') || null,
      secondary_name: formData.get('secondary_name') || null,
      secondary_email: formData.get('secondary_email') || null,
      secondary_phone: formData.get('secondary_phone') || null,
      home_access_info: formData.get('home_access_info') || null,
      full_time_location: formData.get('full_time_location') || null,
      client_type: formData.get('client_type'),
      pm_plan: formData.get('pm_plan') || null,
      airbnb_fee_percent: formData.get('airbnb_fee_percent') ? parseFloat(formData.get('airbnb_fee_percent') as string) : null,
      status: formData.get('status') || 'active',
      notes: formData.get('notes') || null,
      referral_source: formData.get('referral_source') || null,
    }

    try {
      const res = await fetch('/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create owner')
      }

      const { owner } = await res.json()
      router.push(`/owners/${owner.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/owners" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Owners
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Owner</h1>
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
                name="primary_name"
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="primary_email"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="primary_phone"
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
                name="secondary_name"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="secondary_email"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="secondary_phone"
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
                name="full_time_location"
                placeholder="e.g., Salt Lake City, UT"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Access Info</label>
              <textarea
                name="home_access_info"
                rows={3}
                placeholder="Door codes, lockbox location, key info..."
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How did they find us?</label>
              <input
                type="text"
                name="referral_source"
                placeholder="e.g., Referral from John, Google, etc."
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Type *</label>
              <select
                name="client_type"
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              >
                <option value="concierge">Concierge Only</option>
                <option value="property_management">Property Management</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan (if Property Management)</label>
              <select
                name="pm_plan"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              >
                <option value="">Not applicable</option>
                <option value="250">$250/month</option>
                <option value="350">$350/month</option>
                <option value="airbnb">Airbnb %</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airbnb Fee % (if applicable)</label>
              <input
                type="number"
                name="airbnb_fee_percent"
                step="0.5"
                placeholder="e.g., 12.5"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
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
            name="notes"
            rows={4}
            placeholder="Any additional notes about this client..."
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
            {saving ? 'Saving...' : 'Create Owner'}
          </button>
          <Link
            href="/owners"
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
