<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture rules

- Menu, add-ons, coupons and orders live in the Cloud database; UI reads menu via `getMenu` + `menuQuery` — keeps data admin-editable.
- All price/tax/coupon math lives in `src/lib/pricing.ts`; the server recomputes totals in `placeOrder` — never trust client totals.
- Payment methods go through `src/lib/payments.ts` providers; only available providers may place orders — lets a real gateway drop in.
- Cart state is client-only (`src/lib/cart.tsx`, localStorage) — no account needed to browse.
- Account/checkout/order pages live under `src/routes/_authenticated/` (redirects to /login).
