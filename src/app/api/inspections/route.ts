import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = supabaseAdmin()

    const { data, error } = await supabase
      .from('inspections')
      .select(`
        *,
        properties (
          id,
          name,
          address
        )
      `)
      .order('inspection_date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Flatten property name for easier access
    const inspections = data?.map(i => ({
      ...i,
      property_name: i.properties?.name,
      property_address: i.properties?.address,
    })) || []

    return NextResponse.json({ inspections })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      propertyId,
      inspectorName,
      inspectionDate,
      interiorChecklist,
      exteriorChecklist,
      issues,
      propertyNotes,
      overallCondition,
    } = body

    const supabase = supabaseAdmin()

    const { data, error } = await supabase
      .from('inspections')
      .insert({
        property_id: propertyId,
        inspector_name: inspectorName,
        inspection_date: inspectionDate,
        interior_checklist: interiorChecklist,
        exterior_checklist: exteriorChecklist,
        issues: issues,
        notes: propertyNotes,
        overall_condition: overallCondition,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ inspection: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
