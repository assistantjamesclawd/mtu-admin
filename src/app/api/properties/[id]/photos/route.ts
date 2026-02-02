import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - List photos for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = supabaseAdmin()

    const { data, error } = await supabase
      .from('property_photos')
      .select('*')
      .eq('property_id', id)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ photos: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Upload a new photo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = supabaseAdmin()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string || null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-photos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('property-photos')
      .getPublicUrl(filename)

    // Get current max sort order
    const { data: existingPhotos } = await supabase
      .from('property_photos')
      .select('sort_order')
      .eq('property_id', id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = existingPhotos && existingPhotos.length > 0 
      ? (existingPhotos[0].sort_order || 0) + 1 
      : 0

    // Save photo record to database
    const { data: photoData, error: dbError } = await supabase
      .from('property_photos')
      .insert({
        property_id: id,
        url: urlData.publicUrl,
        storage_path: filename,
        caption: caption,
        sort_order: nextSortOrder,
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      // Try to delete the uploaded file
      await supabase.storage.from('property-photos').remove([filename])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ photo: photoData })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = supabaseAdmin()
    
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')
    
    if (!photoId) {
      return NextResponse.json({ error: 'No photoId provided' }, { status: 400 })
    }

    // Get photo record to get storage path
    const { data: photo, error: fetchError } = await supabase
      .from('property_photos')
      .select('storage_path')
      .eq('id', photoId)
      .eq('property_id', id)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete from storage
    if (photo.storage_path) {
      await supabase.storage.from('property-photos').remove([photo.storage_path])
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('property_photos')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
