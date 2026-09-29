# Palletoori's Dairy Farm (పల్లెటూరి డెయిరీ ఫామ్)

> **"Pure. Fresh. From our farm."**  
> *Goodness that comes from home.*

A production-ready full-stack dairy ecommerce & morning subscription platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL & Auth)**, and **Razorpay**.

---

## 1. Project Architecture & Structure

```
palletooris-dairy/
├── app/
│   ├── page.tsx                     # Premium Home with autoplay farm video & catalog
│   ├── layout.tsx                   # App Root with Auth & Cart Context Providers, SEO tags
│   ├── globals.css                  # Zero-overflow layout & theme tokens
│   ├── products/
│   │   ├── page.tsx                 # Full dairy catalog with live category filtering & sorting
│   │   └── [slug]/
│   │       └── page.tsx             # Product details with dynamic variant pricing & stock
│   ├── cart/
│   │   └── page.tsx                 # Real shopping cart with inline variant switcher & coupons
│   ├── checkout/
│   │   └── page.tsx                 # 5-step Checkout (Address, Delivery Slot, Razorpay & COD)
│   ├── orders/
│   │   ├── page.tsx                 # My Orders list with status badges
│   │   └── [id]/
│   │       └── page.tsx             # Live Order Details with status tracking timeline & invoice
│   ├── subscriptions/
│   │   └── page.tsx                 # Daily milk subscription manager (Pause, Resume, Skip, Modify)
│   ├── profile/
│   │   └── page.tsx                 # Customer profile with saved addresses & order history
│   ├── login/
│   │   └── page.tsx                 # Phone + OTP authentication flow
│   ├── about/
│   │   └── page.tsx                 # Our Farm heritage, Vedic Bilona method & lab tests
│   ├── contact/
│   │   └── page.tsx                 # Farm contact info, WhatsApp support, and inquiry form
│   ├── admin/
│   │   └── page.tsx                 # Complete Admin Suite (Overview, Orders, Deliveries, Products, Inventory, Subscriptions, Customers, Analytics)
│   └── api/
│       └── razorpay/
│           ├── create-order/route.ts  # Razorpay backend order initialization
│           ├── verify-payment/route.ts# Server-side HMAC SHA256 signature verification
│           └── webhook/route.ts       # Razorpay webhook event processor
├── components/
│   ├── Header.tsx                   # Responsive header with real-time cart badge & search
│   ├── Footer.tsx                   # Farm footer with trust badges, timings, WhatsApp CTA
│   ├── ProductCard.tsx              # Interactive product card with variant selector & stock status
│   └── OrderTimeline.tsx            # Live stepper (Confirmed -> Preparing -> Packed -> Out for Delivery -> Delivered)
├── lib/
│   ├── context/
│   │   ├── CartContext.tsx          # Cart store with localStorage persistence & coupon discounts
│   │   └── AuthContext.tsx          # Mobile OTP auth state & address manager
│   ├── data/
│   │   └── mockData.ts              # Seed data (Cow Milk, Buffalo Milk, Curd, Ghee, Butter, Paneer, Shakes)
│   ├── db/
│   │   └── store.ts                 # Local storage and Supabase sync adapter
│   ├── razorpay/
│   │   └── client.ts                # Razorpay client & HMAC SHA256 signature verifier
│   └── supabase/
│       ├── client.ts                # Browser Supabase client
│       └── server.ts                # Admin Supabase client with Service Role
├── public/
│   ├── logo.png                     # Official Palletoori's brand logo
│   ├── dairy-video.mp4              # Farm video (autoplay, muted, loop, playsInline)
│   ├── milk.png                     # Cow & Buffalo milk asset
│   ├── Curd.png                     # Fresh curd asset
│   ├── Buttermilk.png               # Spiced chaas asset
│   ├── Paneer.png                   # Handcrafted malai paneer asset
│   ├── Ghee.png                     # Pure A2 Vedic Bilona ghee asset
│   └── Butter.png                   # Fresh white makkhan asset
├── supabase/
│   ├── migrations/
│   │   └── 20260301_initial_schema.sql # 16 PostgreSQL tables, RLS policies, and indexes
│   └── seed/
│       └── seed.sql                 # Ready-to-run seed data SQL
└── .env.example                     # Environment variables template
```

---

## 2. Database Schema (Supabase PostgreSQL)

The database schema (`supabase/migrations/20260301_initial_schema.sql`) contains 16 normalized tables:

1. **`profiles`** - User accounts, mobile numbers, roles (`customer`, `admin`, `delivery`).
2. **`addresses`** - Multi-address book (House, Street, Area, City, State, Pincode, Landmark, Instructions).
3. **`categories`** - Fresh Milk, Curd & Buttermilk, Ghee & Butter, Fresh Paneer, Milkshakes.
4. **`products`** - Product details, descriptions, ingredients, shelf life, storage, fat content.
5. **`product_variants`** - Sizes (500 ml, 1 L, 250 g, 500 g, 1 kg), prices, stock, units.
6. **`product_images`** - Multi-image gallery.
7. **`inventory`** - Variant stock tracking, low-stock threshold (default 15/40), units sold.
8. **`delivery_slots`** - Morning (6:00 AM – 9:00 AM) and Evening (5:00 PM – 8:00 PM) with cutoff times.
9. **`coupons`** - Discounts (e.g. `PALLETOORI50` for ₹50 off, `FARM20` for 20% off).
10. **`orders`** - Order records, delivery slots, totals, payment statuses, Razorpay order/payment IDs.
11. **`order_items`** - Itemized snapshot of variants, prices, and quantities.
12. **`payments`** - Payment transaction logs, signatures, gateways, payloads.
13. **`subscriptions`** - Daily/Alternate/Weekly recurring milk plans with next delivery date and frequency.
14. **`deliveries`** - Morning dispatch records, rider assignment, and delivery statuses.
15. **`admin_users`** - Authorized business managers.
16. **`notifications`** - SMS / WhatsApp / In-app alerts for order updates and subscription reminders.

---

## 3. Environment Variables

Create `.env.local` based on `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Business Information
NEXT_PUBLIC_BUSINESS_NAME="Palletoori's Dairy Farm"
NEXT_PUBLIC_BUSINESS_PHONE="+91 98765 43210"
NEXT_PUBLIC_BUSINESS_WHATSAPP="+919876543210"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## 4. Supabase Setup Steps

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard.
3. Paste and run the contents of [`supabase/migrations/20260301_initial_schema.sql`](supabase/migrations/20260301_initial_schema.sql).
4. Run [`supabase/seed/seed.sql`](supabase/seed/seed.sql) to populate categories, products, variants, delivery slots, and coupons.
5. In **Project Settings** -> **API**, copy your `URL`, `anon public key`, and `service_role key` into `.env.local`.
6. For SMS OTP Auth, go to **Authentication** -> **Providers** -> **Phone** and enable your SMS provider (Twilio, MessageBird, or Supabase default).

---

## 5. Razorpay Setup Steps

1. Sign up / Log in to [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Go to **Settings** -> **API Keys** -> **Generate Test Key**.
3. Copy `Key Id` and `Key Secret` into `.env.local`.
4. Under **Webhooks**, add your webhook endpoint: `https://your-domain.vercel.app/api/razorpay/webhook`.
5. Select active events: `payment.captured`, `payment.failed`, `order.paid`.
6. Copy the secret into `RAZORPAY_WEBHOOK_SECRET`.

---

## 6. Local Development Commands

```bash
# Install dependencies
npm install

# Start Next.js local development server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Run production build
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the customer app.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) to view the Admin Operations Dashboard.

---

## 7. Production Deployment (GitHub & Vercel)

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete production dairy ecommerce and admin platform"
   git push origin main
   ```
2. Import the repository into [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, add the variables from `.env.example`.
4. Click **Deploy**. Vercel will build and assign an SSL production domain.

---

## 8. Testing Checklist

- [x] **Home Page**: Hero video (`/dairy-video.mp4`) autoplays muted in loop with zero horizontal overflow.
- [x] **Header**: Mobile drawer navigation, search input with instant matching, and live cart counter.
- [x] **Product Catalog**: Live category filter pills, price sorting, variant selection, and Add to Cart.
- [x] **Product Details**: Large image, description, shelf-life, variant switcher updating price live, Add to Cart & Buy Now.
- [x] **Cart**: LocalStorage persistence, quantity increments/decrements, inline size switcher, and promo code `PALLETOORI50`.
- [x] **Checkout**: 5-step flow with customer details, saved address selector, delivery slots (Morning/Evening), and Razorpay/COD options.
- [x] **Order Tracking**: Unique order ID generation, itemized invoice, and live fulfillment timeline.
- [x] **Subscriptions**: Daily milk builder, frequency selector, Pause/Resume, Skip next drop, and quantity modifications.
- [x] **Admin Operations**: Multi-tab dashboard (`/admin`) for Orders, Fleet Deliveries, Products CRUD, Stock restock, and Sales Analytics.
- [x] **TypeScript & Build**: Clean `npm run build` with zero errors.
