import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#3d3530',
    paddingBottom: 15,
    marginBottom: 20,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3d3530',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 9,
    color: '#666',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d3530',
    marginBottom: 15,
  },
  propertyInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    width: 120,
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    flex: 1,
  },
  sectionTitle: {
    backgroundColor: '#3d3530',
    color: 'white',
    padding: 8,
    fontSize: 12,
    fontWeight: 'bold',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  sectionContent: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#ddd',
    padding: 12,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginBottom: 15,
  },
  issue: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 3,
    borderLeftColor: '#c53030',
    padding: 10,
    marginBottom: 10,
    borderRadius: 3,
  },
  issueTitle: {
    fontWeight: 'bold',
    color: '#c53030',
    marginBottom: 4,
    fontSize: 11,
  },
  issueLocation: {
    color: '#666',
    fontSize: 9,
    marginBottom: 4,
  },
  issueDescription: {
    color: '#333',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 6,
    backgroundColor: '#f9f9f9',
    marginBottom: 4,
    borderRadius: 3,
  },
  checkmark: {
    color: '#3d3530',
    fontWeight: 'bold',
    marginRight: 8,
    width: 15,
  },
  checklistText: {
    flex: 1,
  },
  note: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 9,
  },
  summary: {
    backgroundColor: '#f0fff4',
    borderWidth: 1,
    borderColor: '#9ae6b4',
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#276749',
    marginBottom: 8,
    fontSize: 14,
  },
  conditionBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 'bold',
  },
  conditionGood: {
    backgroundColor: '#c6f6d5',
    color: '#276749',
  },
  conditionFair: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  conditionPoor: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    textAlign: 'center',
    color: '#666',
    fontSize: 9,
  },
  footerBold: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  notesSection: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: '#d69e2e',
    padding: 10,
    borderRadius: 3,
  },
  checklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checklistHalf: {
    width: '48%',
    marginRight: '2%',
  },
})

const INTERIOR_LABELS: Record<string, string> = {
  faucets: 'Run faucets',
  toilets: 'Flush toilets',
  leaks: 'Check for leaks',
  mold_pests: 'Inspect for mold/pests/odors',
  breaker: 'Check breaker panel',
  smoke_detectors: 'Check smoke detectors',
  wifi: 'Verify WiFi',
  thermostat: 'Check thermostat',
  appliances: 'Inspect appliances',
  trash: 'Check for trash/perishables',
  security: 'Security system',
  sound_system: 'Test sound system',
  water_softener: 'Check water softener',
  hvac_filters: 'Check HVAC filters',
  water_shutoffs: 'Verify water shutoffs',
  blinds: 'Test blinds',
}

const EXTERIOR_LABELS: Record<string, string> = {
  perimeter: 'Walk perimeter',
  gutters: 'Inspect gutters/drainage',
  packages: 'Check for packages',
  outdoor_furniture: 'Check outdoor furniture',
  outdoor_lighting: 'Verify outdoor lighting',
  hot_tub: 'Hot tub cover secure',
}

function getConditionStyle(condition: string) {
  switch (condition) {
    case 'good': return styles.conditionGood
    case 'fair': return styles.conditionFair
    case 'poor': return styles.conditionPoor
    default: return styles.conditionGood
  }
}

interface InspectionData {
  propertyName: string
  propertyAddress?: string
  inspectorName: string
  inspectionDate: string
  interiorChecklist: Record<string, { checked: boolean; notes: string }>
  exteriorChecklist: Record<string, { checked: boolean; notes: string }>
  issues: Array<{ title: string; location: string; description: string }>
  propertyNotes?: string
  overallCondition: string
}

function InspectionPDF({ data }: { data: InspectionData }) {
  const formattedDate = new Date(data.inspectionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const checkedInterior = Object.entries(data.interiorChecklist || {})
    .filter(([_, v]) => v.checked)
  const checkedExterior = Object.entries(data.exteriorChecklist || {})
    .filter(([_, v]) => v.checked)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Mountain Time Utah</Text>
          <Text style={styles.tagline}>Property Management & Concierge</Text>
        </View>

        <Text style={styles.title}>Property Inspection Report</Text>

        {/* Property Info */}
        <View style={styles.propertyInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Property:</Text>
            <Text style={[styles.infoValue, { fontWeight: 'bold' }]}>{data.propertyName}</Text>
          </View>
          {data.propertyAddress && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{data.propertyAddress}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Inspection Date:</Text>
            <Text style={styles.infoValue}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Inspector:</Text>
            <Text style={styles.infoValue}>{data.inspectorName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Overall Condition:</Text>
            <Text style={[styles.conditionBadge, getConditionStyle(data.overallCondition)]}>
              {data.overallCondition.charAt(0).toUpperCase() + data.overallCondition.slice(1)}
            </Text>
          </View>
        </View>

        {/* Issues */}
        {data.issues && data.issues.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>🔧 Issues Requiring Attention</Text>
            <View style={styles.sectionContent}>
              {data.issues.map((issue, index) => (
                <View key={index} style={styles.issue}>
                  <Text style={styles.issueTitle}>Issue #{index + 1}: {issue.title || 'Untitled'}</Text>
                  {issue.location && (
                    <Text style={styles.issueLocation}>📍 {issue.location}</Text>
                  )}
                  {issue.description && (
                    <Text style={styles.issueDescription}>{issue.description}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Interior Checklist */}
        <View>
          <Text style={styles.sectionTitle}>✅ Interior Checklist</Text>
          <View style={styles.sectionContent}>
            {checkedInterior.length === 0 ? (
              <Text style={{ color: '#666' }}>No items checked</Text>
            ) : (
              <View style={styles.checklistGrid}>
                {checkedInterior.map(([key, value]) => (
                  <View key={key} style={[styles.checklistItem, styles.checklistHalf]}>
                    <Text style={styles.checkmark}>✓</Text>
                    <View style={styles.checklistText}>
                      <Text>{INTERIOR_LABELS[key] || key}</Text>
                      {value.notes && <Text style={styles.note}>({value.notes})</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Exterior Checklist */}
        <View>
          <Text style={styles.sectionTitle}>✅ Exterior Checklist</Text>
          <View style={styles.sectionContent}>
            {checkedExterior.length === 0 ? (
              <Text style={{ color: '#666' }}>No items checked</Text>
            ) : (
              <View style={styles.checklistGrid}>
                {checkedExterior.map(([key, value]) => (
                  <View key={key} style={[styles.checklistItem, styles.checklistHalf]}>
                    <Text style={styles.checkmark}>✓</Text>
                    <View style={styles.checklistText}>
                      <Text>{EXTERIOR_LABELS[key] || key}</Text>
                      {value.notes && <Text style={styles.note}>({value.notes})</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {data.propertyNotes && (
          <View>
            <Text style={styles.sectionTitle}>📝 Notes & Observations</Text>
            <View style={styles.sectionContent}>
              <View style={styles.notesSection}>
                <Text>{data.propertyNotes}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.infoRow}>
            <Text>Overall Property Condition: </Text>
            <Text style={[styles.conditionBadge, getConditionStyle(data.overallCondition)]}>
              {data.overallCondition.charAt(0).toUpperCase() + data.overallCondition.slice(1)}
            </Text>
          </View>
          {data.issues && data.issues.length > 0 ? (
            <Text style={{ marginTop: 6 }}>Issues Found: {data.issues.length}</Text>
          ) : (
            <Text style={{ marginTop: 6 }}>No issues found during this inspection.</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBold}>Mountain Time Utah</Text>
          <Text>Property Management & Concierge Services</Text>
          <Text>Heber City • Park City • Deer Valley • Midway</Text>
          <Text>info@mountaintimeutah.com</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const data: InspectionData = {
      propertyName: body.propertyName || 'Unknown Property',
      propertyAddress: body.propertyAddress,
      inspectorName: body.inspectorName || 'Unknown',
      inspectionDate: body.inspectionDate || new Date().toISOString(),
      interiorChecklist: body.interiorChecklist || {},
      exteriorChecklist: body.exteriorChecklist || {},
      issues: body.issues || [],
      propertyNotes: body.propertyNotes,
      overallCondition: body.overallCondition || 'good',
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <InspectionPDF data={data} />
    )

    const filename = `inspection-${data.propertyName.replace(/\s+/g, '-').toLowerCase()}-${data.inspectionDate}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
