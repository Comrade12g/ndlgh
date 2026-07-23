"""
End-to-end test: customer updates phone on /account, then signs in with the
new number using the synthetic email mapping.

Requires an existing customer test account. Set:
    TEST_CUSTOMER_PHONE   E.164 phone the customer currently signs in with
    TEST_CUSTOMER_PASSWORD

The test picks a fresh phone number, updates it via /account, signs out,
and confirms sign-in works with the new phone. On success it restores the
original phone so the test is repeatable.

Run:
    python3 tests/e2e/customer-phone-migration.py
"""
import asyncio, os, random, re, sys
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE = os.environ.get("APP_BASE_URL", "http://localhost:8080")
SHOTS = Path("/tmp/browser/ndl/phone-migration"); SHOTS.mkdir(parents=True, exist_ok=True)

ORIGINAL_PHONE = os.environ.get("TEST_CUSTOMER_PHONE")
PASSWORD = os.environ.get("TEST_CUSTOMER_PASSWORD")


def random_gh_phone() -> str:
    # +233 5X XXX XXXX — unlikely to collide with real accounts in the test window.
    return "+2335" + "".join(str(random.randint(0, 9)) for _ in range(8))


async def sign_in(page, identifier: str, password: str) -> None:
    await page.goto(f"{BASE}/", wait_until="domcontentloaded")
    await page.get_by_label("Phone (customers) or email (staff)").fill(identifier)
    await page.get_by_label("Password", exact=True).fill(password)
    await page.get_by_role("button", name="Sign in").click()


async def sign_out(page) -> None:
    # Portal has a sign-out control; fall back to clearing storage if it's not present.
    try:
        await page.goto(f"{BASE}/portal", wait_until="domcontentloaded")
        btn = page.get_by_role("button", name=re.compile("sign out|log out", re.I))
        await btn.first.click(timeout=2000)
    except Exception:
        await page.evaluate("window.localStorage.clear(); window.sessionStorage.clear();")
    await page.context.clear_cookies()


async def main() -> int:
    if not ORIGINAL_PHONE or not PASSWORD:
        print("SKIP: set TEST_CUSTOMER_PHONE and TEST_CUSTOMER_PASSWORD to run.")
        return 0

    new_phone = random_gh_phone()
    print(f"Original phone: {ORIGINAL_PHONE}\nNew phone:      {new_phone}")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # 1. Sign in as customer with the current phone.
        await sign_in(page, ORIGINAL_PHONE, PASSWORD)
        await page.wait_for_url(re.compile(r".*/portal.*"), timeout=15000)
        await page.screenshot(path=str(SHOTS / "1_signed_in.png"))

        # 2. Update phone on /account.
        await page.goto(f"{BASE}/account", wait_until="domcontentloaded")
        await page.get_by_label("New phone number").fill(new_phone)
        await page.get_by_role("button", name=re.compile("Update phone", re.I)).click()
        await expect(page.get_by_text(re.compile(f"Phone updated to \\{new_phone}", re.I))).to_be_visible(timeout=15000)
        await page.screenshot(path=str(SHOTS / "2_phone_updated.png"))

        # 3. Sign out and back in with the new phone.
        await sign_out(page)
        await sign_in(page, new_phone, PASSWORD)
        await page.wait_for_url(re.compile(r".*/portal.*"), timeout=15000)
        await page.screenshot(path=str(SHOTS / "3_signed_in_new_phone.png"))
        assert "/portal" in page.url, f"expected /portal, got {page.url}"
        print("PASS: signed in successfully with new phone number.")

        # 4. Cleanup: restore original phone so the test is repeatable.
        await page.goto(f"{BASE}/account", wait_until="domcontentloaded")
        await page.get_by_label("New phone number").fill(ORIGINAL_PHONE)
        await page.get_by_role("button", name=re.compile("Update phone", re.I)).click()
        await expect(page.get_by_text(re.compile("Phone updated to", re.I))).to_be_visible(timeout=15000)
        await page.screenshot(path=str(SHOTS / "4_restored.png"))

        await browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
