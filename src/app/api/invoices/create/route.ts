import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
  try {
    const body = await request.json()
    const { requestId, customerEmail, customerName, lineItems, serviceName } = body

    if (!requestId || !customerEmail || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if customer exists in Stripe, if not create them
    let customer: Stripe.Customer
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          source: 'mtu-admin',
        },
      })
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 7,
      metadata: {
        requestId,
        serviceName,
      },
    })

    // Add line items to the invoice
    for (const item of lineItems) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        description: item.description,
        amount: item.amount, // Already in cents
        currency: 'usd',
      })
    }

    // Finalize and send the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
    await stripe.invoices.sendInvoice(invoice.id)

    // Update the service request with invoice info
    const supabase = supabaseAdmin()
    await supabase
      .from('service_requests')
      .update({
        invoice_id: finalizedInvoice.id,
        invoice_status: finalizedInvoice.status,
        invoice_url: finalizedInvoice.hosted_invoice_url,
        final_price: finalizedInvoice.amount_due / 100, // Store in dollars
      })
      .eq('id', requestId)

    return NextResponse.json({
      success: true,
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
    })

  } catch (error) {
    console.error('Invoice creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
