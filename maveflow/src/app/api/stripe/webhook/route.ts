import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    if (!sig || !endpointSecret) throw new Error("Missing Stripe signature or secret.");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(\`[Stripe Webhook] Error: \${err.message}\`);
    return new NextResponse(\`Webhook Error: \${err.message}\`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.client_reference_id;
        
        if (userId) {
          // Upgrade user to PRO based on successful payment
          await db.user.update({
            where: { id: userId },
            data: { plan: "PRO" }
          });
          console.log(\`[Stripe] User \${userId} upgraded to PRO.\`);
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        // Search user by stripe customer ID if saved, or just rely on manual handling
        // For standard implementation, you'd store stripeCustomerId in User model
        console.log(\`[Stripe] Subscription deleted: \${subscription.id}\`);
        break;
      }

      default:
        console.log(\`[Stripe] Unhandled event type \${event.type}\`);
    }
  } catch (error) {
    console.error("[Stripe Webhook Handler] Error:", error);
    return new NextResponse("Database Error", { status: 500 });
  }

  return new NextResponse("OK", { status: 200 });
}
