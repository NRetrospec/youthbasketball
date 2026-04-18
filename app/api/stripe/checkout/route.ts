import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(req: NextRequest) {
  try {
    const { challengeId, role, entryFee, userId, userEmail } = await req.json();

    if (!challengeId || !role || !entryFee || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const amountCents = Math.round(entryFee * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency:     'usd',
            unit_amount:  amountCents,
            product_data: {
              name:        '1v1 Basketball Challenge — Entry Fee',
              description: 'Skill-based competition entry fee. Platform-managed prize pool.',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: {
        challengeId,
        userId,
        role,
      },
      // {CHECKOUT_SESSION_ID} is replaced by Stripe automatically
      success_url: `${appUrl}/hooper/challenges/${challengeId}?session_id={CHECKOUT_SESSION_ID}&role=${role}&payment=success`,
      cancel_url:  `${appUrl}/hooper/challenges/${challengeId}?payment=cancelled`,
      payment_intent_data: {
        description: `Entry fee: 1v1 basketball skill-based competition`,
        metadata: {
          challengeId,
          userId,
          role,
          platform: 'HooperChallenge',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
