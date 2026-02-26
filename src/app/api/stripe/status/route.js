import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ status: 'none' });

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Find customer by email
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    if (!customers.data.length) {
      return NextResponse.json({ status: 'none' });
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 1,
    });

    if (!subscriptions.data.length) {
      return NextResponse.json({ status: 'none' });
    }

    const sub = subscriptions.data[0];

    let status = 'none';
    let trialEnd = null;
    let currentPeriodEnd = null;

    if (sub.status === 'trialing') {
      status = 'trial';
      trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
    } else if (sub.status === 'active') {
      status = 'active';
      currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
    } else if (sub.status === 'canceled' || sub.status === 'unpaid' || sub.status === 'past_due') {
      status = sub.status;
    }

    return NextResponse.json({
      status,
      trialEnd,
      currentPeriodEnd,
      stripeStatus: sub.status,
    });
  } catch (error) {
    console.error('Stripe status error:', error);
    return NextResponse.json({ status: 'none' });
  }
}
