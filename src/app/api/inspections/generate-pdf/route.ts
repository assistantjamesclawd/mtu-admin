import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      propertyName,
      propertyAddress,
      inspectorName,
      inspectionDate,
      interiorChecklist,
      exteriorChecklist,
      issues,
      propertyNotes,
      overallCondition,
    } = body

    const formattedDate = new Date(inspectionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Build interior checklist HTML
    const interiorItems = Object.entries(interiorChecklist || {})
      .filter(([_, value]: [string, any]) => value.checked)
      .map(([key, value]: [string, any]) => {
        const label = getChecklistLabel(key, 'interior')
        const notes = value.notes ? ` <span class="note">(${value.notes})</span>` : ''
        return `<div class="checklist-item"><span class="check">✓</span> ${label}${notes}</div>`
      })
      .join('')

    // Build exterior checklist HTML
    const exteriorItems = Object.entries(exteriorChecklist || {})
      .filter(([_, value]: [string, any]) => value.checked)
      .map(([key, value]: [string, any]) => {
        const label = getChecklistLabel(key, 'exterior')
        const notes = value.notes ? ` <span class="note">(${value.notes})</span>` : ''
        return `<div class="checklist-item"><span class="check">✓</span> ${label}${notes}</div>`
      })
      .join('')

    // Build issues HTML
    const issuesHtml = (issues || []).map((issue: any, index: number) => `
      <div class="issue">
        <div class="issue-title">Issue #${index + 1}: ${issue.title || 'Untitled Issue'}</div>
        <div class="issue-location">📍 ${issue.location || 'Location not specified'}</div>
        <div class="issue-description">${issue.description || 'No description provided.'}</div>
        ${issue.photos?.length > 0 ? `<p class="attachment-note"><em>See attached: Photo(s)</em></p>` : ''}
      </div>
    `).join('')

    // Property notes with checklist observations
    const notesWithObservations: string[] = []
    Object.entries(interiorChecklist || {}).forEach(([key, value]: [string, any]) => {
      if (value.notes && value.checked) {
        notesWithObservations.push(`${getChecklistLabel(key, 'interior')}: ${value.notes}`)
      }
    })
    Object.entries(exteriorChecklist || {}).forEach(([key, value]: [string, any]) => {
      if (value.notes && value.checked) {
        notesWithObservations.push(`${getChecklistLabel(key, 'exterior')}: ${value.notes}`)
      }
    })

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Inspection Report - ${propertyName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 850px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3d3530;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #3d3530;
            margin-bottom: 5px;
        }
        .tagline {
            font-size: 12px;
            color: #666;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        h1 {
            color: #3d3530;
            font-size: 24px;
            margin: 30px 0 10px;
        }
        .property-info {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .property-info table { width: 100%; }
        .property-info td { padding: 8px 0; }
        .property-info td:first-child {
            font-weight: bold;
            width: 150px;
            color: #555;
        }
        .section { margin-bottom: 30px; }
        .section-title {
            background: #3d3530;
            color: white;
            padding: 10px 15px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 5px 5px 0 0;
        }
        .section-content {
            border: 1px solid #ddd;
            border-top: none;
            padding: 20px;
            border-radius: 0 0 5px 5px;
        }
        .issue {
            background: #fff5f5;
            border-left: 4px solid #c53030;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 0 5px 5px 0;
        }
        .issue:last-child { margin-bottom: 0; }
        .issue-title {
            font-weight: bold;
            color: #c53030;
            margin-bottom: 8px;
            font-size: 16px;
        }
        .issue-location {
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
        }
        .issue-description { margin-bottom: 10px; }
        .attachment-note {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }
        .checklist-item {
            display: inline-block;
            width: 48%;
            padding: 8px;
            background: #f9f9f9;
            border-radius: 4px;
            margin-bottom: 8px;
            margin-right: 2%;
            font-size: 14px;
        }
        .check {
            color: #3d3530;
            font-weight: bold;
            margin-right: 8px;
        }
        .note {
            color: #666;
            font-style: italic;
        }
        .notes-section {
            background: #fffbeb;
            border-left: 4px solid #d69e2e;
            padding: 15px;
            border-radius: 0 5px 5px 0;
            margin-top: 15px;
        }
        .notes-title {
            font-weight: bold;
            color: #744210;
            margin-bottom: 8px;
        }
        .summary {
            background: #f0fff4;
            border: 1px solid #9ae6b4;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .summary-title {
            font-weight: bold;
            color: #276749;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .condition-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            text-transform: capitalize;
        }
        .condition-good { background: #c6f6d5; color: #276749; }
        .condition-fair { background: #fef3c7; color: #92400e; }
        .condition-poor { background: #fed7d7; color: #c53030; }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { padding: 20px; }
            .issue, .section-content { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Mountain Time Utah</div>
        <div class="tagline">Property Management & Concierge</div>
    </div>

    <h1>Property Inspection Report</h1>
    
    <div class="property-info">
        <table>
            <tr>
                <td>Property:</td>
                <td><strong>${propertyName}</strong></td>
            </tr>
            ${propertyAddress ? `<tr><td>Address:</td><td>${propertyAddress}</td></tr>` : ''}
            <tr>
                <td>Inspection Date:</td>
                <td>${formattedDate}</td>
            </tr>
            <tr>
                <td>Inspector:</td>
                <td>${inspectorName}</td>
            </tr>
            <tr>
                <td>Overall Condition:</td>
                <td><span class="condition-badge condition-${overallCondition}">${overallCondition}</span></td>
            </tr>
        </table>
    </div>

    ${issues && issues.length > 0 ? `
    <div class="section">
        <div class="section-title">🔧 Issues Requiring Attention</div>
        <div class="section-content">
            ${issuesHtml}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">✅ Interior Checklist</div>
        <div class="section-content">
            ${interiorItems || '<p class="text-gray-500">No items checked</p>'}
        </div>
    </div>

    <div class="section">
        <div class="section-title">✅ Exterior Checklist</div>
        <div class="section-content">
            ${exteriorItems || '<p class="text-gray-500">No items checked</p>'}
        </div>
    </div>

    ${propertyNotes || notesWithObservations.length > 0 ? `
    <div class="section">
        <div class="section-title">📝 Notes & Observations</div>
        <div class="section-content">
            ${propertyNotes ? `<p>${propertyNotes}</p>` : ''}
            ${notesWithObservations.length > 0 ? `
            <ul style="margin-top: 10px; margin-left: 20px;">
                ${notesWithObservations.map(note => `<li>${note}</li>`).join('')}
            </ul>
            ` : ''}
        </div>
    </div>
    ` : ''}

    <div class="summary">
        <div class="summary-title">Summary</div>
        <p><strong>Overall Property Condition:</strong> <span class="condition-badge condition-${overallCondition}">${overallCondition}</span></p>
        ${issues && issues.length > 0 ? `<p style="margin-top: 10px;"><strong>Issues Found:</strong> ${issues.length}</p>` : '<p style="margin-top: 10px;">No issues found during this inspection.</p>'}
        ${issues && issues.length > 0 ? `<p style="margin-top: 10px;"><strong>Attachments:</strong> Photos and/or video documenting the issues described above.</p>` : ''}
    </div>

    <div class="footer">
        <p><strong>Mountain Time Utah</strong></p>
        <p>Property Management & Concierge Services</p>
        <p>Heber City • Park City • Deer Valley • Midway</p>
        <p>info@mountaintimeutah.com</p>
    </div>
</body>
</html>`

    // Return HTML that can be printed to PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="inspection-${propertyName?.replace(/\s+/g, '-').toLowerCase()}-${inspectionDate}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

function getChecklistLabel(key: string, type: 'interior' | 'exterior'): string {
  const labels: Record<string, string> = {
    // Interior
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
    // Exterior
    perimeter: 'Walk perimeter',
    gutters: 'Inspect gutters/drainage',
    packages: 'Check for packages',
    outdoor_furniture: 'Check outdoor furniture',
    outdoor_lighting: 'Verify outdoor lighting',
    hot_tub: 'Hot tub cover secure',
  }
  return labels[key] || key
}
