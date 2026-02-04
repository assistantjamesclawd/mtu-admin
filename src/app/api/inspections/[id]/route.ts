import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Flatten property info
    const inspection = {
      ...data,
      property_name: data.properties?.name,
      property_address: data.properties?.address,
    }

    return NextResponse.json({ inspection })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = supabaseAdmin()

    const { error } = await supabase
      .from('inspections')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = supabaseAdmin()

    const {
      inspectorName,
      inspectionDate,
      interiorChecklist,
      exteriorChecklist,
      issues,
      propertyNotes,
      overallCondition,
    } = body

    const updateData: Record<string, any> = {}
    if (inspectorName !== undefined) updateData.inspector_name = inspectorName
    if (inspectionDate !== undefined) updateData.inspection_date = inspectionDate
    if (interiorChecklist !== undefined) updateData.interior_checklist = interiorChecklist
    if (exteriorChecklist !== undefined) updateData.exterior_checklist = exteriorChecklist
    if (issues !== undefined) updateData.issues = issues
    if (propertyNotes !== undefined) updateData.notes = propertyNotes
    if (overallCondition !== undefined) updateData.overall_condition = overallCondition
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('inspections')
      .update(updateData)
      .eq('id', id)
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
