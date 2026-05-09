# 🚀 MaveFlow Production Launch Checklist

Before taking MaveFlow live to real users, ensure all the following checks are completed.

## 1. Infrastructure & Hosting
- [ ] **Database Setup**: Connect to a managed Postgres instance (e.g., Neon DB). Ensure `pgbouncer` or connection pooling is enabled since Next.js serverless functions can exhaust DB connections.
- [ ] **Redis Setup**: Upstash for Rate Limiting. Render/Railway for a dedicated persistent BullMQ Redis instance (BullMQ requires TCP sockets, which serverless functions struggle with).
- [ ] **Worker Deployment**: Deploy the BullMQ `queue.ts` workers as a standalone Node.js process (e.g., a Docker container on Railway) separate from the Next.js web app.
- [ ] **Domain Setup**: Attach custom domain in Vercel. Ensure SSL certificates are successfully provisioned.

## 2. Security Hardening
- [ ] **Environment Secrets Rotated**: NEVER use local/development `.env` values in production. Generate fresh values for `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, and `WEBHOOK_SECRET`.
- [ ] **Google OAuth Production Config**:
  - Verify app ownership in Google Cloud Console.
  - Set strictly allowed **Authorized Origins** (e.g., `https://maveflow.com`) and **Redirect URIs** (no wildcard `*`).
  - Submit the app for Google Trust & Safety Verification if you request sensitive scopes (Gmail, Drive) for general public usage.
- [ ] **Database Connection String**: Ensure `?sslmode=require` is appended to the `DATABASE_URL`.
- [ ] **Headers Audit**: Check that Next.js config sets strict `X-Frame-Options: DENY`, `Strict-Transport-Security`, and strong CSP policies.

## 3. Continuous Integration & Deployment (CI/CD)
- [ ] **GitHub Actions active**: Verify that the CI pipeline correctly blocks PRs that fail Vitest or TypeScript checks.
- [ ] **Vercel Preview**: Ensure Vercel is configured to build PR Previews.
- [ ] **Rollback Strategy**: Tag GitHub releases (e.g., `v1.0.0`). Vercel allows instant rollback via the dashboard deployment history.

## 4. Performance Optimization
- [ ] **Lazy Loading**: Verify that the heavy React Flow components (`@xyflow/react`) are wrapped in `next/dynamic` (`ssr: false`) to reduce main bundle size.
- [ ] **Caching**: Verify CDN caching for static assets.
- [ ] **Bundle Analysis**: Run `@next/bundle-analyzer` locally to ensure no unexpected huge dependencies (like unused AWS SDKs or heavy chart libs) are creeping into the client bundle.

## 5. Monitoring, Alerting & Observability
- [ ] **Sentry Integration**: Configure the Production DSN. Enable Slack/Email alerts if the error rate jumps > 1%.
- [ ] **Health Monitoring**: Configure an external service like *Better Uptime* or *Checkly* to ping `https://maveflow.com/api/health` every 1 minute.
- [ ] **Prisma Logs**: Enable Prisma query logging and monitor for N+1 issues or slow queries (> 500ms).

## 6. Integrations Readiness
- [ ] **OpenClaw Engine**: Verify the remote OpenClaw instance is active and reachable via the production API URL.
- [ ] **Stripe Webhooks**: Configure Stripe production webhooks to point to `https://maveflow.com/api/stripe/webhook` and verify the Live Secret Key.
- [ ] **Google Pub/Sub**: Register the domain and push endpoint `https://maveflow.com/api/webhooks/gmail` in the Google Cloud Pub/Sub Topic for real-time Gmail triggers.

> *Once all items are checked, you are cleared for Launch!* 🚀
