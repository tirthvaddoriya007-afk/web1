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
    .step.active .step-dot { border-color: #9f2089; color: #9f2089; border-width: 2.5px; }
    .step-lbl { font-size: 11px; color: #aaa; font-weight: 600; }
    .step.active .step-lbl { color: #9f2089; font-weight: 700; }

    /* ─── Section Card ─── */
    .section-card { background: #fff; margin-top: 8px; padding: 16px; }
    .cart-title { font-size: 1.05rem; font-weight: 800; color: #111; margin-bottom: 14px; }

    /* ─── Cart Item ─── */
    .cart-item-row { display: flex; gap: 12px; align-items: flex-start; }
    .item-img { width: 80px; height: 90px; object-fit: cover; border-radius: 6px; flex-shrink: 0; border: 1px solid #eee; }
    .item-details { flex: 1; }
    .item-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .item-name { font-size: 0.9rem; font-weight: 600; color: #9f2089; line-height: 1.35; flex: 1; padding-right: 6px; }
    .delete-btn { background: none; border: none; cursor: pointer; padding: 2px; color: #bbb; flex-shrink: 0; }
    .item-price-row { display: flex; align-items: center; gap: 8px; margin: 5px 0 10px; }
    .price-now { font-size: 0.95rem; font-weight: 700; color: #111; }
    .price-old { font-size: 0.82rem; color: #999; text-decoration: line-through; }
    .qty-row { display: inline-flex; align-items: center; border: 1.5px solid #ccc; border-radius: 4px; overflow: hidden; }
    .qty-btn { width: 30px; height: 28px; background: none; border: none; font-size: 1.2rem; font-weight: 700; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .qty-btn:active { background: #f0f0f0; }
    .qty-val { min-width: 32px; text-align: center; font-size: 0.9rem; font-weight: 700; color: #111; border-left: 1.5px solid #ccc; border-right: 1.5px solid #ccc; height: 28px; display: flex; align-items: center; justify-content: center; }

    /* ─── Delivery ─── */
    .delivery-title { font-size: 0.95rem; font-weight: 800; color: #111; margin-bottom: 12px; }
    .delivery-option {
        border: 1.5px solid #ddd; border-radius: 10px;
        padding: 13px 14px; margin-bottom: 10px;
        display: flex; align-items: center; gap: 12px; cursor: pointer;
    }
    .delivery-option.selected { border-color: #9f2089; background: #fdf3fc; }
    .radio-circle { width: 19px; height: 19px; border-radius: 50%; border: 2px solid #ccc; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .delivery-option.selected .radio-circle { border-color: #9f2089; }
    .radio-dot { width: 9px; height: 9px; border-radius: 50%; background: #9f2089; display: none; }
    .delivery-option.selected .radio-dot { display: block; }
    .delivery-info { flex: 1; }
    .delivery-name { font-size: 0.9rem; font-weight: 700; color: #222; }
    .delivery-sub { font-size: 0.78rem; color: #888; margin-top: 2px; }
    .delivery-price { font-size: 0.9rem; font-weight: 700; }
    .free-val { color: #008a00; font-weight: 700; }

    /* ─── Summary ─── */
    .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; font-size: 0.88rem; color: #444; }
    .summary-row .val { font-weight: 600; }
    .summary-divider { height: 1px; background: #f0f0f0; }
    .summary-row.total .label, .summary-row.total .val { font-size: 0.95rem; font-weight: 800; color: #111; }

    /* ─── Safety ─── */
    .safety-card { background: #fff; margin-top: 8px; overflow: hidden; display: flex; }
    .safety-img { width: 100%; height: auto; display: block; }

    /* ─── Empty ─── */
    .empty-wrap { text-align: center; padding: 40px 20px; }
    .empty-wrap h2 { font-size: 1rem; color: #555; margin: 12px 0 6px; }
    .empty-wrap p { font-size: 0.85rem; color: #999; margin-bottom: 20px; }
    .empty-wrap a { background: #9f2089; color: #fff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; }

    /* ─── Sticky Footer ─── */
    .sticky-footer {
        position: fixed; bottom: 0; left: 0; right: 0;
        background: #fff; border-top: 1px solid #eee;
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 16px; z-index: 999;
    }
    .footer-price { font-size: 1.1rem; font-weight: 800; color: #111; }
    .continue-btn {
        background: #9f2089; color: #fff; border: none; border-radius: 8px;
        padding: 13px 32px; font-size: 0.95rem; font-weight: 700; cursor: pointer;
    }
</style>

<!-- Step Bar -->
<div class="step-bar">
    <div class="step active">
        <div class="step-dot">1</div>
        <span class="step-lbl">Cart</span>
    </div>
    <div class="step">
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

<!-- Cart Items -->
<div class="section-card">
    <div class="cart-title">Cart</div>
    <div id="cartItemsList"></div>
    <div class="empty-wrap" id="emptyCart" style="display:none;">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <h2>Your cart is empty!</h2>
        <p>Add some products to continue.</p>
        <a href="index.php">Start Shopping</a>
    </div>
</div>

<!-- Delivery Options -->
<div class="section-card" id="deliverySection">
    <div class="delivery-title">Delivery Options</div>
    <div class="delivery-option selected" id="stdDelivery" onclick="selectDelivery('std')">
        <div class="radio-circle"><div class="radio-dot"></div></div>
        <div class="delivery-info">
            <div class="delivery-name">Standard Delivery</div>
            <div class="delivery-sub">Delivery in 4 to 5 days</div>
        </div>
        <div class="delivery-price free-val">FREE</div>
    </div>
    <div class="delivery-option" id="fastDelivery" onclick="selectDelivery('fast')">
        <div class="radio-circle"><div class="radio-dot"></div></div>
        <div class="delivery-info">
            <div class="delivery-name">Next Day Delivery</div>
            <div class="delivery-sub">Fast delivery by tomorrow</div>
        </div>
        <div class="delivery-price">₹49</div>
    </div>
</div>

<!-- Price Summary -->
<div class="section-card" id="summarySection">
    <div class="summary-row">
        <span class="label">Total Product Price:</span>
        <span class="val" id="pageCartTotal">₹0.00</span>
    </div>
    <div class="summary-divider"></div>
    <div class="summary-row">
        <span class="label">Shipping:</span>
        <span class="free-val" id="shippingVal">FREE</span>
    </div>
    <div class="summary-divider"></div>
    <div class="summary-row total">
        <span class="label">Order Total :</span>
        <span class="val" id="pageOrderTotal">₹0.00</span>
    </div>
</div>

<!-- Safety Banner -->
<div class="safety-card" id="safetySection">
    <img src="https://cdn.shopify.com/s/files/1/0987/4102/7106/files/WhatsApp_Image_2026-02-13_at_1.19.12_PM.jpg?v=1770980679" alt="Safety Priority" class="safety-img">
</div>

<!-- Sticky Footer -->
<div class="sticky-footer" id="stickyFooter" style="display:none;">
    <div class="footer-price" id="footerTotal">₹0.00</div>
    <button class="continue-btn" onclick="window.location.href='checkout.php'">Continue</button>
</div>

</main>

<script src="script.js"></script>
<script>
// Persist the selected delivery option so checkout/payment pages can use it.
let deliveryMode = localStorage.getItem('deliveryMode') || 'std';

function selectDelivery(mode) {
    // Only allow the two valid delivery modes.
    if (mode !== 'std' && mode !== 'fast') {
        mode = 'std';
    }

    deliveryMode = mode;

    // IMPORTANT: persist the choice for checkout/payment.php
    localStorage.setItem('deliveryMode', deliveryMode);

    // Update the selected UI state.
    const stdDelivery = document.getElementById('stdDelivery');
    const fastDelivery = document.getElementById('fastDelivery');

    if (stdDelivery) {
        stdDelivery.classList.toggle('selected', deliveryMode === 'std');
    }

    if (fastDelivery) {
        fastDelivery.classList.toggle('selected', deliveryMode === 'fast');
    }

    // Recalculate subtotal + shipping immediately.
    renderSummary();
}

function renderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const subtotal = cart.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);

    // Read the persisted selection so the displayed total always matches
    // what will be used later on checkout/payment.php.
    deliveryMode = localStorage.getItem('deliveryMode') || 'std';
    const shipping = deliveryMode === 'fast' ? 49 : 0;
    const total = subtotal + shipping;
    const fmt = v => '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    document.getElementById('pageCartTotal').textContent = fmt(subtotal);
    document.getElementById('shippingVal').textContent = shipping === 0 ? 'FREE' : fmt(shipping);
    document.getElementById('pageOrderTotal').textContent = fmt(total);
    document.getElementById('footerTotal').textContent = fmt(total);
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const listEl = document.getElementById('cartItemsList');
    const emptyEl = document.getElementById('emptyCart');
    const delivSec = document.getElementById('deliverySection');
    const sumSec = document.getElementById('summarySection');
    const safeSec = document.getElementById('safetySection');
    const footer = document.getElementById('stickyFooter');

    listEl.innerHTML = '';

    if (cart.length === 0) {
        emptyEl.style.display = 'block';
        delivSec.style.display = 'none';
        sumSec.style.display = 'none';
        safeSec.style.display = 'none';
        footer.style.display = 'none';
        return;
    }

    emptyEl.style.display = 'none';
    delivSec.style.display = 'block';
    sumSec.style.display = 'block';
    safeSec.style.display = 'flex';
    footer.style.display = 'flex';

    cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.style.cssText = 'border-bottom:1px solid #f0f0f0;padding-bottom:14px;margin-bottom:12px;';
        div.innerHTML = `
            <div class="cart-item-row">
                <img class="item-img" src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <div class="item-top">
                        <div class="item-name">${item.name}</div>
                        <button class="delete-btn" onclick="deleteItem(${idx})">
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                        </button>
                    </div>
                    <div class="item-price-row">
                        <span class="price-now">₹${item.price.toFixed(2)}</span>
                        ${item.original_price ? `<span class="price-old">₹${item.original_price}</span>` : ''}
                    </div>
                    <div class="qty-row">
                        <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
                    </div>
                </div>
            </div>
        `;
        listEl.appendChild(div);
    });

    renderSummary();
    // Sync the global cart variable in script.js so badge updates correctly
    try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch(e) {}
    if (window.updateCartUI) window.updateCartUI();
    // Directly update badge as fallback
    const latestCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalQty = latestCart.reduce((a, b) => a + b.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.innerText = totalQty;
        if (totalQty > 0) badge.classList.remove('d-none');
        else badge.classList.add('d-none');
    }
    const badgeSidebar = document.getElementById('cartBadgeSidebar');
    if (badgeSidebar) badgeSidebar.innerText = totalQty;
}

// Use setTimeout to ensure these override script.js DOMContentLoaded definitions
setTimeout(function() {
    // Restore the previously selected delivery option on page load.
    deliveryMode = localStorage.getItem('deliveryMode') || 'std';

    const stdDelivery = document.getElementById('stdDelivery');
    const fastDelivery = document.getElementById('fastDelivery');

    if (stdDelivery) {
        stdDelivery.classList.toggle('selected', deliveryMode === 'std');
    }

    if (fastDelivery) {
        fastDelivery.classList.toggle('selected', deliveryMode === 'fast');
    }

    window.deleteItem = function(idx) {
        const c = JSON.parse(localStorage.getItem('cart') || '[]');
        c.splice(idx, 1);
        localStorage.setItem('cart', JSON.stringify(c));
        // Sync script.js global cart
        if (typeof cart !== 'undefined') cart = JSON.parse(localStorage.getItem('cart') || '[]');
        renderCart();
    };

    window.changeQty = function(idx, delta) {
        const c = JSON.parse(localStorage.getItem('cart') || '[]');
        c[idx].quantity += delta;
        if (c[idx].quantity <= 0) c.splice(idx, 1);
        localStorage.setItem('cart', JSON.stringify(c));
        // Sync script.js global cart
        if (typeof cart !== 'undefined') cart = JSON.parse(localStorage.getItem('cart') || '[]');
        renderCart();
    };

    renderCart();
}, 0);
</script>
</body>
</html>
