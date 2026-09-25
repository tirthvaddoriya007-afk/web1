<?php require 'data.php'; ?>
<?php require 'header-minimal.php'; ?>

<style>
    *, *::before, *::after { box-sizing: border-box; }
    body { background: #f5f5f5; padding-bottom: 80px; }
    main { padding: 0; }

    /* ─── Step Bar ─── */
    .step-bar {
        background: #fff;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 14px 24px 10px;
        position: relative;
        border-bottom: 1px solid #eee;
    }
    .step-bar::after {
        content: '';
        position: absolute;
        top: 28px; left: 12%; width: 76%; height: 1.5px;
        background: #e0e0e0; z-index: 0;
    }
    .step { display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 1; }
    .step-dot {
        width: 30px; height: 30px; border-radius: 50%;
        border: 2px solid #ccc; background: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700; color: #bbb;
    }
    .step.done .step-dot  { border-color: #9f2089; color: #9f2089; background:#fdf3fc; }
    .step.active .step-dot { border-color: #9f2089; color: #9f2089; border-width: 2.5px; }
    .step-lbl { font-size: 11px; color: #aaa; font-weight: 600; }
    .step.done .step-lbl,
    .step.active .step-lbl { color: #9f2089; font-weight: 700; }

    /* ─── Page Header ─── */
    .page-heading {
        background: #fff;
        margin-top: 8px;
        padding: 18px 16px 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.15rem;
        font-weight: 800;
        color: #111;
        border-bottom: 1px solid #f0f0f0;
    }
    .page-heading svg { flex-shrink: 0; }

    /* ─── Address Form ─── */
    .form-card {
        background: #fff;
        margin-top: 8px;
        padding: 20px 16px 24px;
    }
    .field-wrap {
        position: relative;
        margin-bottom: 18px;
        border: 1.5px solid #ccc;
        border-radius: 6px;
        padding: 10px 12px 8px;
        background: #fff;
        transition: border-color .2s;
    }
    .field-wrap:focus-within { border-color: #9f2089; }
    .field-wrap label {
        position: absolute;
        top: -9px; left: 10px;
        background: #fff;
        padding: 0 4px;
        font-size: 12px;
        color: #888;
        font-weight: 500;
    }
    .field-wrap:focus-within label { color: #9f2089; }
    .field-wrap input {
        width: 100%;
        border: none;
        outline: none;
        font-size: 0.95rem;
        color: #222;
        background: transparent;
        padding: 4px 0 2px;
    }
    .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    /* ─── Trust Banner ─── */
    .trust-banner { margin-top: 8px; overflow: hidden; }
    .trust-banner img { width: 100%; height: auto; display: block; }

    /* ─── Sticky CTA ─── */
    .sticky-cta {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        background: #fff;
        padding: 12px 16px;
        z-index: 999;
        border-top: 1px solid #eee;
    }
    .sticky-cta button {
        width: 100%;
        background: #9f2089;
        border: none;
        border-radius: 8px;
        color: #fff;
        font-size: 1rem;
        font-weight: 700;
        padding: 15px;
        cursor: pointer;
        letter-spacing: .3px;
    }
    .sticky-cta button:active { opacity: .88; }
</style>

<!-- Step Bar -->
<script>
  if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout');
  }
</script>
<div class="step-bar">
    <div class="step done">
        <div class="step-dot">1</div>
        <span class="step-lbl">Cart</span>
    </div>
    <div class="step active">
        <div class="step-dot">2</div>
        <span class="step-lbl">Address</span>
    </div>
    <div class="step">
        <div class="step-dot">3</div>
        <span class="step-lbl">Payment</span>
    </div>
    <div class="step">
        <div class="step-dot">4</div>
        <span class="step-lbl">Summary</span>
    </div>
</div>

<!-- Page Heading -->
<div class="page-heading">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#e91e8c"/>
        <circle cx="12" cy="9" r="2.5" fill="#fff"/>
    </svg>
    Address
</div>

<!-- Address Form -->
<div class="form-card">
    <form id="addressForm" onsubmit="return submitAddress(event)">

        <div class="field-wrap">
            <label>Full Name</label>
            <input type="text" name="name" id="fname" placeholder="" autocomplete="name">
        </div>

        <div class="field-wrap">
            <label>Mobile number</label>
            <input type="tel" name="mobile" id="fmobile" placeholder="" autocomplete="tel" maxlength="10">
        </div>

        <div class="field-wrap">
            <label>Pincode</label>
            <input type="text" name="pincode" id="fpincode" placeholder="" maxlength="6" inputmode="numeric">
        </div>

        <div class="row-2">
            <div class="field-wrap" style="margin-bottom:0">
                <label>City</label>
                <input type="text" name="city" id="fcity" placeholder="" autocomplete="address-level2">
            </div>
            <div class="field-wrap" style="margin-bottom:0">
                <label>State</label>
                <input type="text" name="state" id="fstate" placeholder="" autocomplete="address-level1">
            </div>
        </div>
        <div style="margin-bottom:18px"></div>

        <div class="field-wrap">
            <label>House No., Building Name</label>
            <input type="text" name="house" id="fhouse" placeholder="" autocomplete="address-line1">
        </div>

        <div class="field-wrap" style="margin-bottom:0">
            <label>Road name, Area, Colony</label>
            <input type="text" name="area" id="farea" placeholder="" autocomplete="address-line2">
        </div>

    </form>
</div>

<!-- Trust Banner -->
<div class="trust-banner">
    <img src="https://cdn.shopify.com/s/files/1/0987/4102/7106/files/WhatsApp_Image_2026-02-13_at_1.19.11_PM.jpg?v=1770981110" alt="Secure Payments">
</div>

<!-- Sticky CTA -->
<div class="sticky-cta">
    <button onclick="submitAddress(event)">Save Address and Continue</button>
</div>

</main>

<script>
function submitAddress(e) {
    e.preventDefault();
    const name    = document.getElementById('fname').value.trim();
    const mobile  = document.getElementById('fmobile').value.trim();
    const pincode = document.getElementById('fpincode').value.trim();
    const city    = document.getElementById('fcity').value.trim();
    const state   = document.getElementById('fstate').value.trim();
    const house   = document.getElementById('fhouse').value.trim();
    const area    = document.getElementById('farea').value.trim();

    sessionStorage.setItem('address', JSON.stringify({ name, mobile, pincode, city, state, house, area }));
    window.location.href = 'payment.php';
    return false;
}
</script>
</body>
</html>


