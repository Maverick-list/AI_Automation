import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-04-10" as any,
  appInfo: {
    name: "MaveFlow Automation",
    version: "1.0.0",
  },
});
