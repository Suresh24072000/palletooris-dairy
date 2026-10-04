# Palletoori's Dairy Farm — Production Setup & Deployment Guide

This guide provides the complete, authoritative instructions for configuring, provisioning, and deploying **Palletoori's Dairy Farm** to production.

---

## Architecture Overview

- **Frontend & Server Components**: Next.js 16 (App Router, Turbopack, React 19)
- **Database & Auth Engine**: Supabase (PostgreSQL 15+, Supabase GoTrue Auth, Row Level Security)
- **Payment Processing**: Razorpay (Orders API, Server-side HMAC Signature Verification, Webhooks)
- **Deployment Platform**: Vercel

---

## 1. Supabase Project Setup

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Choose:
   - **Name**: `palletooris-dairy-production`
   - **Database Password**: Generate and store a secure 24+ character password.
   - **Region**: `ap-south-1 (Mumbai)` (lowest latency for India / Hyderabad customers).
   - **Pricing Plan**: Pro or Team (recommended for production database sizing and custom SMS rate limits).
4. Wait for the project provisioning to complete.

---

## 2. Supabase API Credentials

Once the project is created:
1. Navigate to **Project Settings** (gear icon) &rarr; **API**.
2. Locate the following keys:
   - **Project URL**: Format `https://<project-ref>.supabase.co` &rarr; Maps to `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key**: Format `eyJhbGciOi...` &rarr; Maps to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: Format `eyJhbGciOi...` &rarr; Maps to `SUPABASE_SERVICE_ROLE_KEY` (⚠️ **KEEP SECRET — Never expose to browser/client-side code**).

---

## 3. Database Schema Migrations

Apply the migration scripts in sequential order using the Supabase SQL Editor:

1. Open **SQL Editor** in the Supabase Dashboard.
2. Click **New Query**.
3. Copy and run [`supabase/migrations/20260301_initial_schema.sql`](file:///c:/Users/hp/OneDrive/Desktop/palletoori%27s%20dairy%20farm/palletooris-dairy/supabase/migrations/20260301_initial_schema.sql):
   - Creates extensions (`uuid-ossp`).
   - Creates baseline tables: `profiles`, `addresses`, `categories`, `products`, `product_variants`, `orders`, `order_items`, `subscriptions`, `payments`.
   - Sets up initial RLS policies.
4. Copy and run [`supabase/migrations/20261002_complete_schema_v2.sql`](file:///c:/Users/hp/OneDrive/Desktop/palletoori%27s%20dairy%20farm/palletooris-dairy/supabase/migrations/20261002_complete_schema_v2.sql):
   - Extends schemas with `inventory_batches`, `serviceability_pincodes`, `delivery_partners`, `order_status_history`, `support_tickets`, `coupons`.
   - Installs triggers for auto-updating timestamps and creating user profile records upon auth signup.
   - Updates RLS policies to restrict non-admin access and prevent customer price manipulation.

---

## 4. Phone Authentication & SMS Provider Configuration

> [!IMPORTANT]
> Supabase Phone OTP **requires an external SMS provider**. Supabase does not send SMS messages on its own without a configured provider.

### Supported Providers:
- **Twilio** (Global & India)
- **MessageBird / Bird**
- **Vonage**
- **Textlocal** (India DLT approved)

### Step-by-Step Configuration:
1. In the Supabase Dashboard, navigate to **Authentication** &rarr; **Providers** &rarr; **Phone**.
2. Toggle **Enable Phone Provider** to **ON**.
3. Choose your SMS Provider (e.g., **Twilio**):
   - **Twilio Account SID**: Paste from your Twilio Console.
   - **Twilio Auth Token**: Paste from your Twilio Console.
   - **Twilio Message Service SID** or **Phone Number**: e.g., `+1...` or verified Sender ID.
4. If operating in India, ensure your DLT (Distributed Ledger Technology) Entity ID and SMS Template IDs are registered with your telecom operator as required by TRAI regulations.
5. In **Authentication** &rarr; **Rate Limits**:
   - Set **SMS OTP Rate Limit**: Standard is 30 SMS per hour per IP / phone.
   - OTP Token Expiry: 600 seconds (10 minutes).
6. Click **Save**.

---

## 5. Email Authentication (Admin & Customer Fallback)

1. In Supabase Dashboard, navigate to **Authentication** &rarr; **Providers** &rarr; **Email**.
2. Ensure **Enable Email provider** is **ON**.
3. Toggle **Confirm email** as per your operational requirement (recommended **ON** for production).
4. Configure custom SMTP (SendGrid, Resend, Amazon SES, or Postmark) under **Authentication** &rarr; **SMTP Settings** for reliable branded delivery from `noreply@palletoorisdairy.com`.

---

## 6. Admin User Creation

To authorize the first Super Admin user:

1. Create a user via Supabase Dashboard &rarr; **Authentication** &rarr; **Users** &rarr; **Add User** (enter email or phone, and a temporary password).
2. Copy the resulting `User ID` (UUID).
3. Open **SQL Editor** and run the following query:

```sql
-- Replace with the real User ID created above:
INSERT INTO public.profiles (id, phone, full_name, email, role)
VALUES (
  'PASTE_AUTH_USER_UUID_HERE',
  '9876543210',
  'Operations Lead',
  'admin@palletoorisdairy.com',
  'super_admin'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  full_name = EXCLUDED.full_name;
```

Authorized admin roles recognized by proxy middleware and pages:
- `super_admin`
- `admin`
- `farm_manager`
- `operations`
- `delivery_manager`
- `inventory_manager`
- `support`

---

## 7. Razorpay Payment Gateway Configuration

### Test Mode (Development & Staging):
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Toggle switch in upper-left to **Test Mode**.
3. Navigate to **Account & Settings** &rarr; **API Keys** &rarr; **Generate Key**.
4. Copy:
   - `Key ID` (starts with `rzp_test_...`) &rarr; `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_ID`
   - `Key Secret` &rarr; `RAZORPAY_KEY_SECRET`

### Live Mode (Production):
1. Complete KYC verification on the Razorpay Dashboard.
2. Toggle to **Live Mode**.
3. Generate **Live API Keys**:
   - `Key ID` (starts with `rzp_live_...`)
   - `Key Secret`
4. Set up payment methods: Enable **UPI (Google Pay, PhonePe, Paytm, BHIM)**, **Cards**, and **Netbanking**.

---

## 8. Razorpay Webhook Configuration

1. In Razorpay Dashboard &rarr; **Account & Settings** &rarr; **Webhooks** &rarr; **Add New Webhook**.
2. Configure:
   - **Webhook URL**: `https://yourdomain.com/api/razorpay/webhook`
   - **Secret**: Generate a high-entropy secret (e.g. `openssl rand -hex 24`) &rarr; Maps to `RAZORPAY_WEBHOOK_SECRET`
   - **Alert Email**: `tech@palletoorisdairy.com`
   - **Active Events**:
     - `payment.captured`
     - `payment.failed`
     - `refund.created`
     - `refund.processed`
3. Click **Create Webhook**.

---

## 9. Vercel Production Deployment

### Add Environment Variables to Vercel:
Navigate to your project in **Vercel** &rarr; **Settings** &rarr; **Environment Variables**:

| Variable Name | Environments | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Supabase REST endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Server-only admin client |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Production, Preview | Razorpay checkout key |
| `RAZORPAY_KEY_ID` | Production, Preview | Razorpay backend key |
| `RAZORPAY_KEY_SECRET` | Production, Preview | Server-side signature verification |
| `RAZORPAY_WEBHOOK_SECRET` | Production, Preview | HMAC webhook validation |
| `NEXT_PUBLIC_BASE_URL` | Production | `https://palletoorisdairy.com` |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://palletoorisdairy.com` |
| `ALLOW_DEV_ADMIN_BYPASS` | Production | **Set to `false` or omit** |
| `NEXT_PUBLIC_ALLOW_DEV_ADMIN_BYPASS` | Production | **Set to `false` or omit** |

### Build Command & Settings:
- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Node.js Version**: 20.x or 22.x

---

## 10. Verification & Smoke Test Matrix

After deployment, perform these manual tests:

1. **Customer OTP Flow**:
   - Open `/login` or enter phone at checkout.
   - Enter your real mobile number (+91...).
   - Verify SMS receipt on device within 30 seconds.
   - Enter 6-digit OTP code &rarr; Session established, profile synced.
2. **Online Razorpay Payment**:
   - Add dairy products to cart.
   - Select "Online Payment" and proceed.
   - Razorpay modal opens with accurate server-calculated total.
   - Complete UPI/Card payment.
   - Server-side signature verification succeeds &rarr; Order confirmed & assigned order number.
3. **Admin Security**:
   - Attempt direct browser navigation to `/admin` as anonymous user &rarr; Redirects to `/admin/login`.
   - Login with non-admin customer account &rarr; Redirects to `/admin/login?error=access_denied`.
   - Login with verified `super_admin` account &rarr; Admin dashboard loads with full management controls.
