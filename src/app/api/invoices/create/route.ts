import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

// Increase max duration for this route
export const maxDuration = 30

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Stripe API key not configured' },
      { status: 500 }
    )
  }
  
  // Configure Stripe with longer timeout
  const stripe = new Stripe(stripeKey, {
    timeout: 20000, // 20 second timeout
    maxNetworkRetries: 3,
  })
  
  try {
    const body = await request.json()
    const { requestId, customerEmail, customerName, lineItems, serviceName } = body

    if (!requestId || !customerEmail || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Creating invoice for:', customerEmail, 'items:', lineItems.length)

    // Fetch receipts from the service request
    const supabase = supabaseAdmin()
    const { data: requestData } = await supabase
      .from('service_requests')
      .select('receipts')
      .eq('id', requestId)
      .single()
    
    const receipts: string[] = requestData?.receipts || []

    // Check if customer exists in Stripe, if not create them
    let customer: Stripe.Customer
    try {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
        console.log('Found existing customer:', customer.id)
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: {
            source: 'mtu-admin',
          },
        })
        console.log('Created new customer:', customer.id)
      }
    } catch (customerError: any) {
      console.error('Customer error:', customerError)
      return NextResponse.json(
        { error: `Failed to create/find customer: ${customerError.message}` },
        { status: 500 }
      )
    }

    // Build invoice footer with receipt links
    let invoiceFooter = 'Thank you for choosing Mountain Time Utah!'
    if (receipts.length > 0) {
      invoiceFooter = `Receipt${receipts.length > 1 ? 's' : ''} attached:\n${receipts.map((url, i) => `${i + 1}. ${url}`).join('\n')}\n\nThank you for choosing Mountain Time Utah!`
    }

    // Create invoice
    let invoice: Stripe.Invoice
    try {
      invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: 7,
        footer: invoiceFooter,
        metadata: {
          requestId,
          serviceName,
          receiptCount: String(receipts.length),
        },
      })
      console.log('Created invoice:', invoice.id)
    } catch (invoiceError: any) {
      console.error('Invoice creation error:', invoiceError)
      return NextResponse.json(
        { error: `Failed to create invoice: ${invoiceError.message}` },
        { status: 500 }
      )
    }

    // Add line items to the invoice
    try {
      for (const item of lineItems) {
        await stripe.invoiceItems.create({
          customer: customer.id,
          invoice: invoice.id,
          description: item.description,
          amount: item.amount, // Already in cents
          currency: 'usd',
        })
      }
      console.log('Added', lineItems.length, 'line items')
    } catch (itemError: any) {
      console.error('Line item error:', itemError)
      return NextResponse.json(
        { error: `Failed to add line items: ${itemError.message}` },
        { status: 500 }
      )
    }

    // Finalize and send the invoice
    let finalizedInvoice: Stripe.Invoice
    try {
      finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
      await stripe.invoices.sendInvoice(invoice.id)
      console.log('Invoice finalized and sent:', finalizedInvoice.id)
    } catch (sendError: any) {
      console.error('Send invoice error:', sendError)
      return NextResponse.json(
        { error: `Failed to send invoice: ${sendError.message}` },
        { status: 500 }
      )
    }

    // Update the service request with invoice info
    try {
      await supabase
        .from('service_requests')
        .update({
          invoice_id: finalizedInvoice.id,
          invoice_status: finalizedInvoice.status,
          invoice_url: finalizedInvoice.hosted_invoice_url,
          final_price: finalizedInvoice.amount_due / 100, // Store in dollars
        })
        .eq('id', requestId)
    } catch (dbError) {
      console.error('Database update error (non-fatal):', dbError)
      // Don't fail the request if DB update fails - invoice was already sent
    }

    return NextResponse.json({
      success: true,
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
    })

  } catch (error: any) {
    console.error('Invoice creation error:', error)
    
    // Better error message for Stripe errors
    let errorMessage = 'Failed to create invoice'
    if (error?.type === 'StripeAuthenticationError') {
      errorMessage = 'Invalid Stripe API key. Please check configuration.'
    } else if (error?.type === 'StripeConnectionError') {
      errorMessage = 'Could not connect to Stripe. Please try again.'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error?.type || 'unknown' },
      { status: 500 }
    )
  }
}
