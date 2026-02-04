'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, Calendar, Home, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface Inspection {
  id: string
  property_id: string
  property_name?: string
  inspector_name: string
  inspection_date: string
  inspection_type: string
  overall_condition: string
  issues: any[]
  created_at: string
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInspections()
  }, [])

  async function fetchInspections() {
    try {
      const res = await fetch('/api/inspections')
      const data = await res.json()
      setInspections(data.inspections || [])
    } catch (error) {
      console.error('Error fetching inspections:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInspections = inspections.filter(inspection =>
    inspection.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.inspector_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getConditionBadge = (condition: string) => {
    const colors: Record<string, string> = {
      good: 'bg-green-100 text-green-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
    }
    return colors[condition] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
          <p className="text-gray-600">Property inspection reports and history</p>
        </div>
        <Link
          href="/inspections/new"
          className="inline-flex items-center gap-2 bg-[#3d3530] text-white px-4 py-2 rounded-lg hover:bg-[#2d2520] transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Inspection
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by property or inspector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3d3530] focus:border-transparent"
          />
        </div>
      </div>

      {/* Inspections List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading inspections...</div>
        ) : filteredInspections.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No inspections match your search' : 'No inspections yet'}
            </p>
            {!searchTerm && (
              <Link
                href="/inspections/new"
                className="inline-flex items-center gap-2 text-[#3d3530] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Create your first inspection
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredInspections.map((inspection) => (
              <Link
                key={inspection.id}
                href={`/inspections/${inspection.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#3d3530]/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#3d3530]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {inspection.property_name || 'Unknown Property'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(inspection.inspection_date), 'MMM d, yyyy')}
                      </span>
                      <span>•</span>
                      <span>{inspection.inspector_name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {inspection.issues?.length > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      {inspection.issues.length} issue{inspection.issues.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getConditionBadge(inspection.overall_condition)}`}>
                    {inspection.overall_condition}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
