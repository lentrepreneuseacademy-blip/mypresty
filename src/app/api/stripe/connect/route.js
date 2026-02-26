import { NextResponse } from 'next/server';

function translateStripeError(msg) {
  if (!msg) return 'Une erreur est survenue avec Stripe.';
  const m = msg.toLowerCase();
  if (m.includes('platform-profile') || m.includes('managing losses')) {
    return 'Tu dois d\'abord configurer ton profil plateforme Stripe Connect. Va sur dashboard.stripe.com → Connect → Settings → Platform profile, et remplis les informations demandées. Ensuite réessaie.';
  }
  if (m.includes('api key')) return 'Clé API Stripe invalide. Vérifie tes variables d\'environnement.';
  if (m.includes('connect') && m.includes('not enabled')) return 'Stripe Connect n\'est pas activé. Active-le dans ton dashboard Stripe → Connect.';
  return msg;
}

export async function POST(request) {
  try {
    const { salon_id, email, salon_name } = await request.json();
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create a connected account for the pro
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: salon_name,
        mcc: '7230', // Beauty & barber shops
      },
      metadata: { salon_id },
    });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe=success&account=${account.id}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url, account_id: account.id });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json({ error: translateStripeError(error.message) }, { status: 500 });
  }
}
