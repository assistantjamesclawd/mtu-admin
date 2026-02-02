import Link from 'next/link'
// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { supabaseAdmin } from '@/lib/supabase'
import { Plus, Home, Users } from 'lucide-react'

async function getProperties() {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owners (
        id,
        primary_name
      )
    `)
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }
  return data || []
}

export default async function PropertiesPage() {
  const properties = await getProperties()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500">Manage rental properties</p>
        </div>
        <Link
          href="/properties/new"
          className="flex items-center gap-2 bg-[#3d3530] text-white px-4 py-2 rounded-lg hover:bg-[#3d3530]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </Link>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No properties yet</p>
          <Link
            href="/properties/new"
            className="text-[#3d3530] font-medium hover:underline"
          >
            Add your first property →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Placeholder image area */}
              <div className="h-40 bg-gradient-to-br from-[#b5c4b1]/30 to-[#3d3530]/10 flex items-center justify-center">
                <Home className="w-12 h-12 text-[#3d3530]/30" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{property.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    property.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : property.status === 'onboarding'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
                {property.property_type && (
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 ${
                    property.property_type === 'short_term_rental'
                      ? 'bg-blue-100 text-blue-800'
                      : property.property_type === 'long_term_rental'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {property.property_type === 'short_term_rental' ? 'Short Term Rental' 
                      : property.property_type === 'long_term_rental' ? 'Long Term Rental' 
                      : 'Second Home'}
                  </span>
                )}
                <p className="text-sm text-gray-500 mb-3">
                  {property.address}{property.city && `, ${property.city}`}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {property.bedrooms && `${property.bedrooms} bed`}
                    {property.bathrooms && ` • ${property.bathrooms} bath`}
                    {property.sleeps && ` • Sleeps ${property.sleeps}`}
                  </span>
                </div>
                {property.owners && (
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    {property.owners.primary_name}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
