"""
Direct-link role access test.

Signs in as the current sandbox Supabase session, then hits every staff
route directly and asserts each one is either rendered (role allowed) or
redirected to /dashboard (role denied), based on the caller's roles.

Run:
    python3 tests/e2e/role-access.py
"""
import asyncio, json, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE = os.environ.get("APP_BASE_URL", "http://localhost:8080")
SHOTS = Path("/tmp/browser/ndl/role-access"); SHOTS.mkdir(parents=True, exist_ok=True)

# Must mirror ROUTE_ROLES in src/routes/_authenticated.tsx.
ROUTE_ROLES = {
    "/dashboard": {"admin","ops_warehouse","sales_accountant","sales","accountant",
                   "customer_service","sourcing_agent","driver"},
    "/admin/users": {"admin"},
    "/crm/contacts": {"admin","sales","sales_accountant","customer_service","sourcing_agent"},
    "/support": {"admin","customer_service"},
    "/sourcing/pos": {"admin","sourcing_agent"},
    "/treasury/accounts": {"admin","accountant","sales_accountant"},
    "/packages": {"admin","ops_warehouse","customer_service"},
    "/shipments": {"admin","ops_warehouse","sales","sales_accountant","customer_service"},
    "/tracking": {"admin","ops_warehouse","customer_service","sourcing_agent"},
    "/deliveries": {"admin","ops_warehouse","driver","customer_service"},
    "/invoices": {"admin","accountant","sales","sales_accountant"},
    "/rates": {"admin","accountant","sales","sales_accountant"},
    "/reports": {"admin","accountant","sales_accountant"},
}


async def main() -> int:
    storage_key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
    session_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
    cookies_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON")
    if not (storage_key and session_json):
        print("SKIP: no LOVABLE_BROWSER_SUPABASE_SESSION available")
        return 0

    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        ctx = await b.new_context(viewport={"width": 1280, "height": 1200})
        if cookies_json:
            cookies = json.loads(cookies_json)
            for c in cookies: c["url"] = BASE
            await ctx.add_cookies(cookies)
        page = await ctx.new_page()

        await page.goto(BASE, wait_until="domcontentloaded")
        await page.evaluate(
            f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(session_json)})"
        )

        # Land on an authenticated route so the client hydrates the session,
        # then read the caller's roles via the app's own supabase client.
        await page.goto(f"{BASE}/dashboard", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        roles_json = await page.evaluate(
            """async () => {
                const mod = await import('/src/integrations/supabase/client.ts');
                const u = await mod.supabase.auth.getUser();
                if (!u.data.user) return [];
                const r = await mod.supabase.from('user_roles').select('role').eq('user_id', u.data.user.id);
                return (r.data ?? []).map(x => x.role);
            }"""
        )
        my_roles = set(roles_json or [])
        print(f"caller roles: {sorted(my_roles) or '(none)'}")

        failures: list[str] = []
        for path, allowed in ROUTE_ROLES.items():
            should_allow = bool(my_roles & allowed)
            await page.goto(f"{BASE}{path}", wait_until="networkidle")
            await page.wait_for_timeout(1500)
            final = page.url.replace(BASE, "") or "/"
            landed_here = final.startswith(path)
            ok = landed_here if should_allow else (not landed_here)
            verdict = "PASS" if ok else "FAIL"
            print(f"  {verdict}  {path:20s} allow={should_allow} → {final}")
            if not ok:
                failures.append(f"{path} (expected {'allow' if should_allow else 'deny'}, landed {final})")
                await page.screenshot(path=str(SHOTS / f"fail_{path.strip('/').replace('/','_')}.png"))

        await b.close()

        if failures:
            print(f"\n{len(failures)} failure(s):")
            for f in failures: print(f"  - {f}")
            return 1
        print(f"\nAll {len(ROUTE_ROLES)} routes gated correctly for roles: {sorted(my_roles)}")
        return 0


sys.exit(asyncio.run(main()))
