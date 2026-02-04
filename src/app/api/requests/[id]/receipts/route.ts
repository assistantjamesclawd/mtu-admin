import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    const uploadedUrls: string[] = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (error) {
        console.error('Storage upload error:', error)
        // If bucket doesn't exist, try to create it
        if (error.message?.includes('not found')) {
          return NextResponse.json({ 
            error: 'Storage bucket not configured. Please create a "receipts" bucket in Supabase.' 
          }, { status: 500 })
        }
        throw error
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('receipts')
        .getPublicUrl(filename)

      uploadedUrls.push(publicUrl.publicUrl)
    }

    // Get existing receipts and append new ones
    const { data: existingRequest } = await supabase
      .from('service_requests')
      .select('receipts')
      .eq('id', id)
      .single()

    const existingReceipts = existingRequest?.receipts || []
    const allReceipts = [...existingReceipts, ...uploadedUrls]

    // Update the request with new receipts
    const { error: updateError } = await supabase
      .from('service_requests')
      .update({ receipts: allReceipts })
      .eq('id', id)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    return NextResponse.json({ receipts: allReceipts })
  } catch (error) {
    console.error('Receipt upload error:', error)
    return NextResponse.json({ error: 'Failed to upload receipts' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { receiptUrl } = await request.json()

    const supabase = supabaseAdmin()

    // Get current receipts
    const { data: existingRequest } = await supabase
      .from('service_requests')
      .select('receipts')
      .eq('id', id)
      .single()

    const existingReceipts = existingRequest?.receipts || []
    const updatedReceipts = existingReceipts.filter((r: string) => r !== receiptUrl)

    // Update the request
    const { error: updateError } = await supabase
      .from('service_requests')
      .update({ receipts: updatedReceipts })
      .eq('id', id)

    if (updateError) throw updateError

    // Try to delete from storage (extract path from URL)
    try {
      const urlParts = receiptUrl.split('/receipts/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage.from('receipts').remove([filePath])
      }
    } catch (storageError) {
      console.error('Storage delete error (non-fatal):', storageError)
    }

    return NextResponse.json({ receipts: updatedReceipts })
  } catch (error) {
    console.error('Receipt delete error:', error)
    return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 })
  }
}
