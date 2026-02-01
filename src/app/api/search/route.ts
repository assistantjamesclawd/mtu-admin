import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query) {
      return NextResponse.json({ results: [] })
    }

    const supabase = supabaseAdmin()
    const searchPattern = `%${query}%`

    // Search in parallel
    const [owners, properties, guests] = await Promise.all([
      supabase
        .from('owners')
        .select('id, primary_name, secondary_name, primary_email')
        .or(`primary_name.ilike.${searchPattern},secondary_name.ilike.${searchPattern},primary_email.ilike.${searchPattern}`)
        .limit(5),
      supabase
        .from('properties')
        .select('id, name, address, city')
        .or(`name.ilike.${searchPattern},address.ilike.${searchPattern},city.ilike.${searchPattern}`)
        .limit(5),
      supabase
        .from('guests')
        .select('id, name, email, phone')
        .or(`name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`)
        .limit(5),
    ])

    const results = [
      ...(owners.data || []).map((o: any) => ({
        type: 'owner' as const,
        id: o.id,
        title: o.primary_name + (o.secondary_name ? ` & ${o.secondary_name}` : ''),
        subtitle: o.primary_email,
      })),
      ...(properties.data || []).map((p: any) => ({
        type: 'property' as const,
        id: p.id,
        title: p.name,
        subtitle: [p.address, p.city].filter(Boolean).join(', '),
      })),
      ...(guests.data || []).map((g: any) => ({
        type: 'guest' as const,
        id: g.id,
        title: g.name,
        subtitle: g.email || g.phone,
      })),
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
