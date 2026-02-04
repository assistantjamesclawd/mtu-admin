'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Home, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'

interface Inspection {
  id: string
  property_id: string
  property_name?: string
  property_address?: string
  inspector_name: string
  inspection_date: string
  inspection_type: string
  interior_checklist: Record<string, { checked: boolean; notes: string }>
  exterior_checklist: Record<string, { checked: boolean; notes: string }>
  issues: Array<{ title: string; location: string; description: string; photos?: string[] }>
  notes: string
  overall_condition: string
  created_at: string
}

const INTERIOR_LABELS: Record<string, string> = {
  faucets: 'Run faucets',
  toilets: 'Flush toilets',
  leaks: 'Check for leaks (sinks, toilets, water heater, appliances)',
  mold_pests: 'Inspect for signs of mold, pests, odors',
  breaker: 'Check breaker panel for tripped circuits',
  smoke_detectors: 'Check smoke detectors',
  wifi: 'Verify WiFi is functioning',
  thermostat: 'Confirm thermostat is set/working',
  appliances: 'Inspect appliances',
  trash: 'Check for trash, perishables, or food left behind',
  security: 'Confirm security system is operating',
  sound_system: 'Test sound system',
  water_softener: 'Check water softener level',
  hvac_filters: 'Check HVAC filters/replace as needed',
  water_shutoffs: 'Verify water shutoff points are functioning',
  blinds: 'Test blinds',
}

const EXTERIOR_LABELS: Record<string, string> = {
  perimeter: 'Walk the perimeter for signs of damage',
  gutters: 'Visually inspect gutters and drainage areas for blockage',
  packages: 'Check for packages',
  outdoor_furniture: 'Check on outdoor furniture, ensure it is properly stored',
  outdoor_lighting: 'Verify outdoor lighting is operating',
  hot_tub: 'Confirm hot tub cover is secure',
}

export default function InspectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchInspection(params.id as string)
    }
  }, [params.id])

  async function fetchInspection(id: string) {
    try {
      const res = await fetch(`/api/inspections/${id}`)
      if (res.ok) {
        const data = await res.json()
        setInspection(data.inspection)
      } else {
        console.error('Inspection not found')
      }
    } catch (error) {
      console.error('Error fetching inspection:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this inspection? This cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/inspections/${params.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/inspections')
      } else {
        alert('Failed to delete inspection')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete inspection')
    } finally {
      setDeleting(false)
    }
  }

  async function handleDownloadReport() {
    if (!inspection) return

    setGenerating(true)
    try {
      const res = await fetch('/api/inspections/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyName: inspection.property_name || 'Unknown Property',
          propertyAddress: inspection.property_address || '',
          inspectorName: inspection.inspector_name,
          inspectionDate: inspection.inspection_date,
          interiorChecklist: inspection.interior_checklist,
          exteriorChecklist: inspection.exterior_checklist,
          issues: inspection.issues,
          propertyNotes: inspection.notes,
          overallCondition: inspection.overall_condition,
        }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `inspection-${inspection.property_name?.replace(/\s+/g, '-').toLowerCase() || 'report'}-${inspection.inspection_date}.html`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const getConditionBadge = (condition: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      good: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      fair: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      poor: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    }
    return styles[condition] || styles.good
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading inspection...</div>
      </div>
    )
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Inspection not found</p>
        <Link href="/inspections" className="text-[#3d3530] hover:underline">
          ← Back to inspections
        </Link>
      </div>
    )
  }

  const conditionStyle = getConditionBadge(inspection.overall_condition)
  const ConditionIcon = conditionStyle.icon

  // Count checked items
  const interiorChecked = Object.values(inspection.interior_checklist || {}).filter(v => v.checked).length
  const exteriorChecked = Object.values(inspection.exterior_checklist || {}).filter(v => v.checked).length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/inspections"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {inspection.property_name || 'Unknown Property'}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(inspection.inspection_date), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadReport}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Generating...' : 'Download'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Property</div>
                <div className="font-medium">{inspection.property_name || 'Unknown'}</div>
                {inspection.property_address && (
                  <div className="text-sm text-gray-500">{inspection.property_address}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Inspector</div>
                <div className="font-medium">{inspection.inspector_name}</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Inspection Date</div>
                <div className="font-medium">{format(new Date(inspection.inspection_date), 'MMMM d, yyyy')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ConditionIcon className={`w-5 h-5 ${conditionStyle.text}`} />
              <div>
                <div className="text-sm text-gray-500">Overall Condition</div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium capitalize ${conditionStyle.bg} ${conditionStyle.text}`}>
                  {inspection.overall_condition}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Section */}
      {inspection.issues && inspection.issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b bg-red-50">
            <h2 className="text-lg font-semibold text-red-800">
              🔧 Issues Found ({inspection.issues.length})
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {inspection.issues.map((issue, index) => (
              <div key={index} className="border-l-4 border-red-400 bg-red-50/50 p-4 rounded-r-lg">
                <div className="font-medium text-red-800">{issue.title || `Issue #${index + 1}`}</div>
                {issue.location && (
                  <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {issue.location}
                  </div>
                )}
                {issue.description && (
                  <div className="text-gray-700 mt-2">{issue.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interior Checklist */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            ✅ Interior Checklist ({interiorChecked}/{Object.keys(INTERIOR_LABELS).length})
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(INTERIOR_LABELS).map(([key, label]) => {
              const item = inspection.interior_checklist?.[key]
              const isChecked = item?.checked
              return (
                <div 
                  key={key} 
                  className={`flex items-start gap-3 p-3 rounded-lg ${isChecked ? 'bg-green-50' : 'bg-gray-50'}`}
                >
                  {isChecked ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm ${isChecked ? 'text-gray-900' : 'text-gray-400'}`}>
                      {label}
                    </div>
                    {item?.notes && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Exterior Checklist */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            ✅ Exterior Checklist ({exteriorChecked}/{Object.keys(EXTERIOR_LABELS).length})
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(EXTERIOR_LABELS).map(([key, label]) => {
              const item = inspection.exterior_checklist?.[key]
              const isChecked = item?.checked
              return (
                <div 
                  key={key} 
                  className={`flex items-start gap-3 p-3 rounded-lg ${isChecked ? 'bg-green-50' : 'bg-gray-50'}`}
                >
                  {isChecked ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm ${isChecked ? 'text-gray-900' : 'text-gray-400'}`}>
                      {label}
                    </div>
                    {item?.notes && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Notes */}
      {inspection.notes && (
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">📝 Additional Notes</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 whitespace-pre-wrap">{inspection.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
