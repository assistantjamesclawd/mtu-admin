import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = supabaseAdmin()

    const updates: any = {}
    
    if (body.status) {
      updates.status = body.status
      if (body.status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString()
      } else if (body.status === 'completed') {
        updates.completed_at = new Date().toISOString()
      }
    }
    
    if (body.admin_notes !== undefined) {
      updates.admin_notes = body.admin_notes
    }
    
    if (body.quoted_price !== undefined) {
      updates.quoted_price = body.quoted_price
    }
    
    if (body.final_price !== undefined) {
      updates.final_price = body.final_price
    }

    const { data, error } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
