import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { ArrowLeft, Home, MapPin, Bed, Bath, Users, Wifi, Key, ExternalLink } from 'lucide-react'
import PropertyPhotos from '@/components/PropertyPhotos'

async function getProperty(id: string) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owners (
        id,
        primary_name,
        secondary_name
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

async function getPropertyBookings(propertyId: string) {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from('bookings')
    .select(`
      *,
      guests (
        id,
        name
      )
    `)
    .eq('property_id', propertyId)
    .order('check_in', { ascending: false })
    .limit(10)
  
  return data || []
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await getProperty(id)
  
  if (!property) {
    notFound()
  }

  const bookings = await getPropertyBookings(id)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/properties" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
            <p className="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {property.address}{property.city && `, ${property.city}`}
            </p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            property.status === 'active'
              ? 'bg-green-100 text-green-800'
              : property.status === 'onboarding'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {property.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          <PropertyPhotos propertyId={id} />

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.bedrooms && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Bed className="w-5 h-5 text-gray-400" />
                  <span>{property.bedrooms} bedrooms</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Bath className="w-5 h-5 text-gray-400" />
                  <span>{property.bathrooms} baths</span>
                </div>
              )}
              {property.sleeps && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span>Sleeps {property.sleeps}</span>
                </div>
              )}
              {property.sqft && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-5 h-5 text-gray-400" />
                  <span>{property.sqft.toLocaleString()} sqft</span>
                </div>
              )}
            </div>
            
            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string) => (
                    <span key={amenity} className="px-3 py-1 bg-[#b5c4b1]/20 text-[#3d3530] rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <Link href={`/bookings/new?property=${id}`} className="text-sm text-[#3d3530] font-medium hover:underline">
                + Add Booking
              </Link>
            </div>
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guests?.name || 'Unknown Guest'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'checked_in' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner */}
          {property.owners && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Owner</h2>
              <Link href={`/owners/${property.owners.id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 -m-2 rounded-lg">
                <div className="w-10 h-10 bg-[#b5c4b1]/30 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#3d3530]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{property.owners.primary_name}</p>
                  {property.owners.secondary_name && (
                    <p className="text-sm text-gray-500">& {property.owners.secondary_name}</p>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* Access Info */}
          {(property.access_info || property.wifi_info) && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Info</h2>
              {property.access_info && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Key className="w-4 h-4" />
                    Door/Access
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{property.access_info}</p>
                </div>
              )}
              {property.wifi_info && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Wifi className="w-4 h-4" />
                    WiFi
                  </div>
                  <p className="text-gray-700">{property.wifi_info}</p>
                </div>
              )}
            </div>
          )}

          {/* Listing Links */}
          {(property.airbnb_url || property.vrbo_url) && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Listings</h2>
              <div className="space-y-2">
                {property.airbnb_url && (
                  <a
                    href={property.airbnb_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#3d3530] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Airbnb Listing
                  </a>
                )}
                {property.vrbo_url && (
                  <a
                    href={property.vrbo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#3d3530] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    VRBO Listing
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {property.notes && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{property.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/properties/${id}/edit`}
                className="block w-full text-center px-4 py-2 border rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit Property
              </Link>
              <Link
                href={`/bookings/new?property=${id}`}
                className="block w-full text-center px-4 py-2 bg-[#3d3530] text-white rounded-lg font-medium hover:bg-[#3d3530]/90 transition-colors"
              >
                Add Booking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
