import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-04-10" as any,
  appInfo: {
    name: "MaveFlow Automation",
    version: "1.0.0",
  },
});
