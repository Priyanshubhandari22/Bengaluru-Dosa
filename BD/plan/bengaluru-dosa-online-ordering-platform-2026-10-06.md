# Bengaluru Dosa — Online Ordering Platform

Rebuild the site in this project as a full dosa ordering app: Home → Menu → Product → Cart → Login → Checkout → Payment → Confirmation → Order history.

## Visual direction

- Warm palette: saffron orange, turmeric gold, chilli red, banana-leaf green accents on cream backgrounds.
- Fonts: Fraunces (headings) + Manrope (body). Rounded cards, soft shadows, subtle kolam-style pattern accents.
- Generated food photography for the hero and each dosa item.
- Motion via Motion for React: hero entrance, parallax dosa, scroll-reveal cards, cart drawer, modal, toasts, add-to-cart fly animation.

## Pages

- `/` Home: hero, popular dosas, categories, best sellers, offers, why us, how it works, reviews, promo banner, about, location, footer.
- `/menu`: 11 categories, search (name/ingredient/category), filters (price, category, veg, spicy, popular), sorting, product modal with add-ons, spice level, notes, live price.
- `/cart`, plus a slide-out cart drawer and a navbar badge.
- `/checkout`: customer details, delivery/pickup choice, coupons (DOSA10, FIRSTORDER, BENGALURU20), taxes, delivery fee, summary.
- Payment step: UPI, card, net banking, cash on delivery. Online payments are clearly marked "not yet connected", so only cash on delivery actually places an order. The setup is ready to add Razorpay later.
- `/order/$id` confirmation with a status tracker.
- `/login`, `/register`, `/forgot-password`.
- `/account`: profile, orders with statuses, saved addresses, payment preferences, logout.
- `/about`, `/contact`, `/terms`, `/privacy`, `/refunds`.

## Backend (Lovable Cloud)

- Real sign-in with email and password (passwords are stored securely).
- The database stores menu items, categories, add-ons, coupons, orders, profiles, addresses, and admin roles, so a future admin dashboard can manage everything.
- Coupons are checked on the server, and order totals are recalculated there too.
- The cart is saved in the browser, so it survives a page refresh.

## Quality

- Mobile-first layout with large touch targets and a sticky cart button on mobile.
- Lazy-loaded images, accessible labels, visible keyboard focus, and loading, empty, and error states everywhere.

## Technical details

- Menu data lives in the database with its own data-access layer, and pages read it through a query layer.
- The cart uses a Zustand-style context saved to localStorage. Pricing is handled in one pure module that both the client and the server use.
- The payment layer uses a provider interface (`PaymentProvider`). Cash on delivery works now. UPI, card, and net banking are stubs.
- Account pages sit behind an `_authenticated` gate. Roles are stored in a separate `user_roles` table.
- Every route has its own head() metadata.
