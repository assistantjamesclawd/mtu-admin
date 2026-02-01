import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { Plus, Wrench, Phone, Mail, Star } from 'lucide-react'

async function getVendors() {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('service_type', { ascending: true })
  
  if (error) {
    console.error('Error fetching vendors:', error)
    return []
  }
  return data || []
}

export default async function VendorsPage() {
  const vendors = await getVendors()

  // Group vendors by service type
  const grouped = vendors.reduce((acc: any, vendor: any) => {
    const type = vendor.service_type || 'Other'
    if (!acc[type]) acc[type] = []
    acc[type].push(vendor)
    return acc
  }, {})

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    prospect: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500">Your trusted service providers</p>
        </div>
        <Link
          href="/vendors/new"
          className="flex items-center gap-2 bg-[#3d3530] text-white px-4 py-2 rounded-lg hover:bg-[#3d3530]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Vendor
        </Link>
      </div>

      {/* Vendors */}
      {vendors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No vendors yet</p>
          <Link
            href="/vendors/new"
            className="text-[#3d3530] font-medium hover:underline"
          >
            Add your first vendor →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([serviceType, serviceVendors]: [string, any]) => (
            <div key={serviceType}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#3d3530]" />
                {serviceType}
                <span className="text-sm font-normal text-gray-500">({serviceVendors.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceVendors.map((vendor: any) => (
                  <div
                    key={vendor.id}
                    className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                        {vendor.company && (
                          <p className="text-sm text-gray-500">{vendor.company}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[vendor.status] || 'bg-gray-100 text-gray-800'}`}>
                        {vendor.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      {vendor.phone && (
                        <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 hover:text-[#3d3530]">
                          <Phone className="w-4 h-4" />
                          {vendor.phone}
                        </a>
                      )}
                      {vendor.email && (
                        <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 hover:text-[#3d3530]">
                          <Mail className="w-4 h-4" />
                          {vendor.email}
                        </a>
                      )}
                    </div>

                    {vendor.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < vendor.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    )}

                    {vendor.hourly_rate && (
                      <p className="text-sm text-gray-500 mb-2">${vendor.hourly_rate}/hr</p>
                    )}

                    {vendor.notes && (
                      <p className="text-sm text-gray-500 line-clamp-2">{vendor.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
