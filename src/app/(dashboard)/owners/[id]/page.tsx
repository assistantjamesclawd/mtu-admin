import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { ArrowLeft, Phone, Mail, MapPin, Home } from 'lucide-react'

async function getOwner(id: string) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

async function getOwnerProperties(ownerId: string) {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', ownerId)
    .order('name', { ascending: true })
  
  return data || []
}

export default async function OwnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const owner = await getOwner(id)
  
  if (!owner) {
    notFound()
  }

  const properties = await getOwnerProperties(id)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/owners" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Owners
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{owner.primary_name}</h1>
            {owner.secondary_name && (
              <p className="text-gray-500">& {owner.secondary_name}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              owner.status === 'active'
                ? 'bg-green-100 text-green-800'
                : owner.status === 'prospect'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {owner.status}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              owner.client_type === 'property_management'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {owner.client_type === 'property_management' ? 'Property Management' : 'Concierge'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Primary Contact</h3>
                <p className="font-medium text-gray-900">{owner.primary_name}</p>
                {owner.primary_phone && (
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${owner.primary_phone}`} className="hover:underline">{owner.primary_phone}</a>
                    <a href={`sms:${owner.primary_phone}`} className="ml-2 px-2 py-0.5 text-xs bg-[#b5c4b1]/30 text-[#3d3530] rounded hover:bg-[#b5c4b1]/50">
                      Text
                    </a>
                  </div>
                )}
                {owner.primary_email && (
                  <p className="flex items-center gap-2 text-gray-600 mt-1">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${owner.primary_email}`} className="hover:underline">{owner.primary_email}</a>
                  </p>
                )}
              </div>
              {/* Secondary */}
              {owner.secondary_name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Secondary Contact</h3>
                  <p className="font-medium text-gray-900">{owner.secondary_name}</p>
                  {owner.secondary_phone && (
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${owner.secondary_phone}`} className="hover:underline">{owner.secondary_phone}</a>
                      <a href={`sms:${owner.secondary_phone}`} className="ml-2 px-2 py-0.5 text-xs bg-[#b5c4b1]/30 text-[#3d3530] rounded hover:bg-[#b5c4b1]/50">
                        Text
                      </a>
                    </div>
                  )}
                  {owner.secondary_email && (
                    <p className="flex items-center gap-2 text-gray-600 mt-1">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${owner.secondary_email}`} className="hover:underline">{owner.secondary_email}</a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
              <Link
                href={`/properties/new?owner=${id}`}
                className="text-sm text-[#3d3530] font-medium hover:underline"
              >
                + Add Property
              </Link>
            </div>
            {properties.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No properties yet</p>
            ) : (
              <div className="space-y-3">
                {properties.map((property: any) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-[#b5c4b1]/20 rounded-lg">
                      <Home className="w-5 h-5 text-[#3d3530]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{property.name}</p>
                      <p className="text-sm text-gray-500">{property.address}, {property.city}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      property.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {owner.notes && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{owner.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-4">
              {owner.full_time_location && (
                <div>
                  <dt className="text-sm text-gray-500">Full-time Location</dt>
                  <dd className="flex items-center gap-2 text-gray-900 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {owner.full_time_location}
                  </dd>
                </div>
              )}
              {owner.pm_plan && (
                <div>
                  <dt className="text-sm text-gray-500">Plan</dt>
                  <dd className="text-gray-900 mt-1">
                    {owner.pm_plan === 'airbnb' 
                      ? `Airbnb ${owner.airbnb_fee_percent}%`
                      : `$${owner.pm_plan}/month`}
                  </dd>
                </div>
              )}
              {owner.referral_source && (
                <div>
                  <dt className="text-sm text-gray-500">Referral Source</dt>
                  <dd className="text-gray-900 mt-1">{owner.referral_source}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-500">Client Since</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(owner.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Access Info */}
          {owner.home_access_info && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Info</h2>
              <p className="text-gray-600 whitespace-pre-wrap text-sm">{owner.home_access_info}</p>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/owners/${id}/edit`}
                className="block w-full text-center px-4 py-2 border rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit Owner
              </Link>
              <Link
                href={`/properties/new?owner=${id}`}
                className="block w-full text-center px-4 py-2 bg-[#3d3530] text-white rounded-lg font-medium hover:bg-[#3d3530]/90 transition-colors"
              >
                Add Property
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
