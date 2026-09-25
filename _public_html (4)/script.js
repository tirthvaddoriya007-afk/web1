// Cart Globals
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (window.updateCartUI) window.updateCartUI();
}

// Global functions for onclick handlers
window.openCart = function() {
    const popup = document.getElementById('cartPopup');
    const overlay = document.getElementById('cartOverlay');
    if (popup && overlay) {
        popup.classList.add('active');
        overlay.classList.add('active');
    }
};

window.closeCart = function() {
    const popup = document.getElementById('cartPopup');
    const overlay = document.getElementById('cartOverlay');
    if (popup && overlay) {
        popup.classList.remove('active');
        overlay.classList.remove('active');
    }
};

window.add_to_cart = function(type) {
    console.log('add_to_cart triggered', type);
    
    // Get info from DOM
    const titleEl = document.querySelector('.product-title');
    const priceEl = document.querySelector('.current-price');
    const imgEl = document.querySelector('#mainImage');
    
    if (!titleEl || !priceEl) {
        console.error('Could not find product info on page');
        return;
    }

    const id = new URLSearchParams(window.location.search).get('id') || '11472';
    const name = titleEl.innerText;
    const price = parseFloat(priceEl.innerText.replace(/[^0-9.]/g, ''));
    const image = imgEl ? imgEl.src : '';

    console.log('Adding to cart:', { id, name, price });

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }

    saveCart();

    if (typeof fbq === 'function') {
        fbq('track', 'AddToCart', {
            content_name: name,
            content_ids: [id],
            content_type: 'product',
            value: price,
            currency: 'INR'
        });
    }

    if (type === 'buyNow') {
        window.location.href = 'cart.php';
    } else {
        window.openCart();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Timer Logic
    const timerText = document.getElementById('deals-timer-text');
    if (timerText) {
        let endTime = localStorage.getItem('dealsEndTime_15m');
        if (!endTime || new Date().getTime() > endTime) {
            endTime = new Date().getTime() + (15) * 60 * 1000;
            localStorage.setItem('dealsEndTime_15m', endTime);
        }
        setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;
            if (distance < 0) {
                timerText.innerText = '00h : 00m : 00s';
                return;
            }
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timerText.innerText = `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
        }, 1000);
    }

    // UI Elements
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartBadge = document.getElementById('cartBadge');
    const cartBadgeSidebar = document.getElementById('cartBadgeSidebar');
    const pageCartItems = document.getElementById('pageCartItems');
    const pageCartTotal = document.getElementById('pageCartTotal');
    const pageOrderTotal = document.getElementById('pageOrderTotal');
    const pageOrderSummary = document.getElementById('pageOrderSummary');

    window.updateCartUI = function() {
        let total = 0;
        
        // Popup
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">Your cart is empty.</p>';
            }
        }

        // Cart Page
        if (pageCartItems) {
            pageCartItems.innerHTML = '';
            if (cart.length === 0) {
                pageCartItems.innerHTML = '<p>Your cart is empty. <a href="index.php">Go shopping</a></p>';
            }
        }

        if (pageOrderSummary) pageOrderSummary.innerHTML = '';

        cart.forEach((item, index) => {
            total += item.price * item.quantity;

            // Sidebar Item HTML
            if (cartItemsContainer) {
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <img src="${item.image}" alt="" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price-row">₹${item.price.toFixed(2)}</div>
                        <div class="cart-item-actions">
                            <div class="qty-controls">
                                <button class="qty-btn qty-minus" onclick="changeQty(${index}, -1)">−</button>
                                <span class="qty-num">${item.quantity}</span>
                                <button class="qty-btn qty-plus" onclick="changeQty(${index}, 1)">+</button>
                            </div>
                            <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(div);
            }

            // Checkout Page Item HTML
            if (pageOrderSummary) {
                const div = document.createElement('div');
                div.className = 'flex justify-between mb-2';
                div.innerHTML = `<span>${item.name} x ${item.quantity}</span><span>₹${(item.price * item.quantity).toFixed(2)}</span>`;
                pageOrderSummary.appendChild(div);
            }
        });

        const formattedTotal = total.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        if (cartTotalEl) cartTotalEl.innerText = '₹' + formattedTotal;
        if (pageCartTotal) pageCartTotal.innerText = '₹' + formattedTotal;
        if (pageOrderTotal) pageOrderTotal.innerText = '₹' + formattedTotal;

        const count = cart.reduce((acc, curr) => acc + curr.quantity, 0);
        if (cartBadge) {
            cartBadge.innerText = count;
            // Support both old d-none class and new always-visible badge
            if (cartBadge.classList.contains('d-none') || cartBadge.classList.contains('cart-badge-count')) {
                if (count > 0) {
                    cartBadge.classList.remove('d-none');
                } else {
                    cartBadge.classList.add('d-none');
                }
            }
        }
        if (cartBadgeSidebar) cartBadgeSidebar.innerText = count;
    };

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        saveCart();
    };

    window.changeQty = function(index, delta) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
    };

    // Initial UI Update
    window.updateCartUI();

    // Event Listeners for existing static buttons
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCart');
    if (cartOverlay) cartOverlay.addEventListener('click', window.closeCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', window.closeCart);
});
