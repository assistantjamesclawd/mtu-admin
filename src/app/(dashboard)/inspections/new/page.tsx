'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Upload, FileText, Download } from 'lucide-react'
import Link from 'next/link'

interface Property {
  id: string
  name: string
  address: string
}

interface Issue {
  title: string
  location: string
  description: string
  photos: string[]
}

const INTERIOR_CHECKLIST = [
  { key: 'faucets', label: 'Run faucets' },
  { key: 'toilets', label: 'Flush toilets' },
  { key: 'leaks', label: 'Check for leaks (sinks, toilets, water heater, appliances)' },
  { key: 'mold_pests', label: 'Inspect for signs of mold, pests, odors' },
  { key: 'breaker', label: 'Check breaker panel for tripped circuits' },
  { key: 'smoke_detectors', label: 'Check smoke detectors' },
  { key: 'wifi', label: 'Verify WiFi is functioning' },
  { key: 'thermostat', label: 'Confirm thermostat is set/working' },
  { key: 'appliances', label: 'Inspect appliances' },
  { key: 'trash', label: 'Check for trash, perishables, or food left behind' },
  { key: 'security', label: 'Confirm security system is operating (if applicable)' },
  { key: 'sound_system', label: 'Test sound system' },
  { key: 'water_softener', label: 'Check water softener level' },
  { key: 'hvac_filters', label: 'Check HVAC filters/replace as needed' },
  { key: 'water_shutoffs', label: 'Verify water shutoff points are functioning' },
  { key: 'blinds', label: 'Test blinds' },
]

const EXTERIOR_CHECKLIST = [
  { key: 'perimeter', label: 'Walk the perimeter for signs of damage' },
  { key: 'gutters', label: 'Visually inspect gutters and drainage areas for blockage' },
  { key: 'packages', label: 'Check for packages' },
  { key: 'outdoor_furniture', label: 'Check on outdoor furniture, ensure it is properly stored' },
  { key: 'outdoor_lighting', label: 'Verify outdoor lighting is operating' },
  { key: 'hot_tub', label: 'Confirm hot tub cover is secure' },
]

export default function NewInspectionPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  
  // Form state
  const [propertyId, setPropertyId] = useState('')
  const [inspectorName, setInspectorName] = useState('Trevor Pollock')
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0])
  const [interiorChecklist, setInteriorChecklist] = useState<Record<string, { checked: boolean; notes: string }>>({})
  const [exteriorChecklist, setExteriorChecklist] = useState<Record<string, { checked: boolean; notes: string }>>({})
  const [issues, setIssues] = useState<Issue[]>([])
  const [propertyNotes, setPropertyNotes] = useState('')
  const [overallCondition, setOverallCondition] = useState('good')

  useEffect(() => {
    fetchProperties()
    // Initialize checklists
    const initInterior: Record<string, { checked: boolean; notes: string }> = {}
    INTERIOR_CHECKLIST.forEach(item => {
      initInterior[item.key] = { checked: false, notes: '' }
    })
    setInteriorChecklist(initInterior)

    const initExterior: Record<string, { checked: boolean; notes: string }> = {}
    EXTERIOR_CHECKLIST.forEach(item => {
      initExterior[item.key] = { checked: false, notes: '' }
    })
    setExteriorChecklist(initExterior)
  }, [])

  async function fetchProperties() {
    try {
      const res = await fetch('/api/properties')
      const data = await res.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  function addIssue() {
    setIssues([...issues, { title: '', location: '', description: '', photos: [] }])
  }

  function updateIssue(index: number, field: keyof Issue, value: any) {
    const updated = [...issues]
    updated[index] = { ...updated[index], [field]: value }
    setIssues(updated)
  }

  function removeIssue(index: number) {
    setIssues(issues.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!propertyId) {
      alert('Please select a property')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          inspectorName,
          inspectionDate,
          interiorChecklist,
          exteriorChecklist,
          issues,
          propertyNotes,
          overallCondition,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        router.push(`/inspections/${data.inspection.id}`)
      } else {
        alert(data.error || 'Failed to save inspection')
      }
    } catch (error) {
      console.error('Error saving inspection:', error)
      alert('Failed to save inspection')
    } finally {
      setLoading(false)
    }
  }

  async function handleGeneratePDF() {
    if (!propertyId) {
      alert('Please select a property first')
      return
    }

    setGenerating(true)
    try {
      const property = properties.find(p => p.id === propertyId)
      const res = await fetch('/api/inspections/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyName: property?.name || 'Unknown Property',
          propertyAddress: property?.address || '',
          inspectorName,
          inspectionDate,
          interiorChecklist,
          exteriorChecklist,
          issues,
          propertyNotes,
          overallCondition,
        }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `inspection-${property?.name?.replace(/\s+/g, '-').toLowerCase() || 'report'}-${inspectionDate}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        // Fallback to HTML download
        const data = await res.json()
        if (data.html) {
          const blob = new Blob([data.html], { type: 'text/html' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `inspection-${property?.name?.replace(/\s+/g, '-').toLowerCase() || 'report'}-${inspectionDate}.html`
          a.click()
          window.URL.revokeObjectURL(url)
        } else {
          alert('Failed to generate report')
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/inspections"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Inspection</h1>
          <p className="text-gray-600">Create a property inspection report</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Inspection Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3d3530] focus:border-transparent"
                required
              >
                <option value="">Select a property...</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} — {property.address}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date *</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3d3530] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name *</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3d3530] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overall Condition</label>
              <select
                value={overallCondition}
                onChange={(e) => setOverallCondition(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3d3530] focus:border-transparent"
              >
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interior Checklist */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Interior Checklist</h2>
          <div className="space-y-3">
            {INTERIOR_CHECKLIST.map((item) => (
              <div key={item.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={interiorChecklist[item.key]?.checked || false}
                  onChange={(e) => setInteriorChecklist({
                    ...interiorChecklist,
                    [item.key]: { ...interiorChecklist[item.key], checked: e.target.checked }
                  })}
                  className="mt-1 w-5 h-5 text-[#3d3530] rounded focus:ring-[#3d3530]"
                />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">{item.label}</label>
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={interiorChecklist[item.key]?.notes || ''}
                    onChange={(e) => setInteriorChecklist({
                      ...interiorChecklist,
                      [item.key]: { ...interiorChecklist[item.key], notes: e.target.value }
                    })}
                    className="mt-1 w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#3d3530] focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exterior Checklist */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Exterior Checklist</h2>
          <div className="space-y-3">
            {EXTERIOR_CHECKLIST.map((item) => (
              <div key={item.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={exteriorChecklist[item.key]?.checked || false}
                  onChange={(e) => setExteriorChecklist({
                    ...exteriorChecklist,
                    [item.key]: { ...exteriorChecklist[item.key], checked: e.target.checked }
                  })}
                  className="mt-1 w-5 h-5 text-[#3d3530] rounded focus:ring-[#3d3530]"
                />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">{item.label}</label>
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={exteriorChecklist[item.key]?.notes || ''}
                    onChange={(e) => setExteriorChecklist({
                      ...exteriorChecklist,
                      [item.key]: { ...exteriorChecklist[item.key], notes: e.target.value }
                    })}
                    className="mt-1 w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#3d3530] focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Issues Found</h2>
            <button
              type="button"
              onClick={addIssue}
              className="inline-flex items-center gap-2 text-sm text-[#3d3530] hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add Issue
            </button>
          </div>
          
          {issues.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No issues reported. Click "Add Issue" to report a problem.</p>
          ) : (
            <div className="space-y-4">
              {issues.map((issue, index) => (
                <div key={index} className="border rounded-lg p-4 bg-red-50/50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-red-800">Issue #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeIssue(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={issue.title}
                        onChange={(e) => updateIssue(index, 'title', e.target.value)}
                        placeholder="e.g., Low Water Flow"
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={issue.location}
                        onChange={(e) => updateIssue(index, 'location', e.target.value)}
                        placeholder="e.g., Kitchen sink"
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={issue.description}
                      onChange={(e) => updateIssue(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Describe the issue..."
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Property Notes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
          <textarea
            value={propertyNotes}
            onChange={(e) => setPropertyNotes(e.target.value)}
            rows={3}
            placeholder="Any additional notes about the property..."
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3d3530] focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={handleGeneratePDF}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#3d3530] text-[#3d3530] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {generating ? 'Generating...' : 'Download Report'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#3d3530] text-white rounded-lg hover:bg-[#2d2520] transition-colors disabled:opacity-50"
          >
            <FileText className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Inspection'}
          </button>
        </div>
      </form>
    </div>
  )
}
