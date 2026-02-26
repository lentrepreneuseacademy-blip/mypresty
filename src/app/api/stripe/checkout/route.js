import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, salon_id } = await request.json();
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      subscription_data: {
        trial_period_days: 90,
        metadata: { salon_id },
      },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancel`,
      metadata: { salon_id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const msg = error.message || '';
    let frError = msg;
    if (msg.includes('api key')) frError = 'Clé API Stripe invalide. Vérifie tes variables d\'environnement.';
    else if (msg.includes('price')) frError = 'Le Price ID Stripe est invalide. Vérifie la variable STRIPE_PRICE_ID.';
    return NextResponse.json({ error: frError }, { status: 500 });
  }
}
