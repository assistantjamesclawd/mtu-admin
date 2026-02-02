'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [owners, setOwners] = useState<any[]>([])
  const [property, setProperty] = useState<any>(null)

  useEffect(() => {
    // Fetch property and owners
    Promise.all([
      fetch(`/api/properties/${params.id}`).then(res => res.json()),
      fetch('/api/owners').then(res => res.json())
    ]).then(([propData, ownersData]) => {
      setProperty(propData.property)
      setOwners(ownersData.owners || [])
      setLoading(false)
    }).catch(() => {
      setError('Failed to load property')
      setLoading(false)
    })
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const amenitiesRaw = formData.get('amenities') as string
    
    const data = {
      owner_id: formData.get('owner_id') || null,
      name: formData.get('name'),
      address: formData.get('address') || null,
      city: formData.get('city') || null,
      property_type: formData.get('property_type') || 'short_term_rental',
      bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : null,
      bathrooms: formData.get('bathrooms') ? parseFloat(formData.get('bathrooms') as string) : null,
      sleeps: formData.get('sleeps') ? parseInt(formData.get('sleeps') as string) : null,
      sqft: formData.get('sqft') ? parseInt(formData.get('sqft') as string) : null,
      access_info: formData.get('access_info') || null,
      wifi_info: formData.get('wifi_info') || null,
      airbnb_url: formData.get('airbnb_url') || null,
      vrbo_url: formData.get('vrbo_url') || null,
      status: formData.get('status') || 'active',
      amenities: amenitiesRaw ? amenitiesRaw.split(',').map(a => a.trim()).filter(Boolean) : [],
      notes: formData.get('notes') || null,
    }

    try {
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update property')
      }

      router.push(`/properties/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Loading...</div>
  }

  if (!property) {
    return <div className="p-8 text-red-500">Property not found</div>
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/properties/${params.id}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Property
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit {property.name}</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={property.name}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <select
                name="owner_id"
                defaultValue={property.owner_id || ''}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              >
                <option value="">No owner selected</option>
                {owners.map((owner: any) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.primary_name}
                    {owner.secondary_name && ` & ${owner.secondary_name}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={property.address || ''}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  defaultValue={property.city || ''}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  name="property_type"
                  defaultValue={property.property_type || 'short_term_rental'}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
                >
                  <option value="short_term_rental">Short Term Rental</option>
                  <option value="long_term_rental">Long Term Rental</option>
                  <option value="second_home">Second Home</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={property.status || 'active'}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                min="0"
                defaultValue={property.bedrooms || ''}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                min="0"
                step="0.5"
                defaultValue={property.bathrooms || ''}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sleeps</label>
              <input
                type="number"
                name="sleeps"
                min="0"
                defaultValue={property.sleeps || ''}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sq Ft</label>
              <input
                type="number"
                name="sqft"
                min="0"
                defaultValue={property.sqft || ''}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <input
              type="text"
              name="amenities"
              defaultValue={property.amenities?.join(', ') || ''}
              placeholder="hot tub, ski storage, ev charger (comma separated)"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
            />
          </div>
        </div>

        {/* Access Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Info</label>
              <textarea
                name="access_info"
                rows={3}
                defaultValue={property.access_info || ''}
                placeholder="Door codes, lockbox, key location..."
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WiFi Info</label>
              <input
                type="text"
                name="wifi_info"
                defaultValue={property.wifi_info || ''}
                placeholder="Network: xxx / Password: xxx"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Listing URLs</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airbnb URL</label>
              <input
                type="url"
                name="airbnb_url"
                defaultValue={property.airbnb_url || ''}
                placeholder="https://airbnb.com/rooms/..."
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VRBO URL</label>
              <input
                type="url"
                name="vrbo_url"
                defaultValue={property.vrbo_url || ''}
                placeholder="https://vrbo.com/..."
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            name="notes"
            rows={4}
            defaultValue={property.notes || ''}
            placeholder="Any additional notes..."
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
            href={`/properties/${params.id}`}
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
