'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const serviceTypes = [
  'Plumber',
  'Electrician',
  'HVAC',
  'Painter',
  'Wallpaper',
  'Roofer',
  'Handyman',
  'Cleaner',
  'Landscaper',
  'Pool/Hot Tub',
  'Pest Control',
  'Locksmith',
  'Appliance Repair',
  'Disaster Recovery',
  'Insurance',
  'Other',
]

export default function NewVendorPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get('name'),
      company: formData.get('company') || null,
      service_type: formData.get('service_type'),
      phone: formData.get('phone') || null,
      email: formData.get('email') || null,
      website: formData.get('website') || null,
      hourly_rate: formData.get('hourly_rate') ? parseFloat(formData.get('hourly_rate') as string) : null,
      rating: formData.get('rating') ? parseInt(formData.get('rating') as string) : null,
      status: formData.get('status') || 'active',
      notes: formData.get('notes') || null,
      referral_source: formData.get('referral_source') || null,
    }

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create vendor')
      }

      router.push('/vendors')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/vendors" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Vendor</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="company"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
              <select
                name="service_type"
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              >
                <option value="">Select a service type</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                name="website"
                placeholder="https://"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                name="hourly_rate"
                min="0"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating (1-5)</label>
              <select
                name="rating"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              >
                <option value="">Not rated</option>
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                <option value="4">⭐⭐⭐⭐ Good</option>
                <option value="3">⭐⭐⭐ Average</option>
                <option value="2">⭐⭐ Below Average</option>
                <option value="1">⭐ Poor</option>
              </select>
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
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">How did you find them?</label>
            <input
              type="text"
              name="referral_source"
              placeholder="e.g., Referral from client, Google, etc."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            name="notes"
            rows={4}
            placeholder="Specialty, availability, pricing details, quality notes..."
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
            {saving ? 'Saving...' : 'Add Vendor'}
          </button>
          <Link
            href="/vendors"
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
