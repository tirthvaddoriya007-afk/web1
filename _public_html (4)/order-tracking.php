<?php require 'data.php'; ?>
<?php require 'header.php'; ?>

<main class="order-tracking-page">
    <div class="container">
        <div class="tracking-header">
            <h1>Track Your Order</h1>
            <p>Enter your details to see the current status of your order.</p>
        </div>

        <div class="tracking-form-container">
            <form id="trackingForm" class="tracking-form">
                <div class="form-group">
                    <label for="customerName">Full Name</label>
                    <input type="text" id="customerName" name="customerName" placeholder="Enter your name" required>
                </div>
                <div class="form-group">
                    <label for="mobileNumber">Mobile Number</label>
                    <input type="tel" id="mobileNumber" name="mobileNumber" placeholder="Enter 10-digit mobile number" pattern="[0-9]{10}" required>
                </div>
                <button type="submit" class="btn-track">Track Order</button>
            </form>
        </div>

        <div id="trackingResult" class="tracking-result" style="display: none;">
            <div class="status-card">
                <div class="status-header">
                    <span class="status-badge shipping">In Shipping</span>
                    <span class="order-id">Order #MEE739481</span>
                </div>
                
                <div class="status-timeline">
                    <div class="timeline-item completed">
                        <div class="timeline-icon">✓</div>
                        <div class="timeline-content">
                            <h3>Order Placed</h3>
                            <p></p>
                        </div>
                    </div>
                    <div class="timeline-item active">
                        <div class="timeline-icon pulse">🚚</div>
                        <div class="timeline-content">
                            <h3>Shipping</h3>
                            <p>In transit to your city</p>
                        </div>
                    </div>
                    <div class="timeline-item pending">
                        <div class="timeline-icon">📍</div>
                        <div class="timeline-content">
                            <h3>Out for Delivery</h3>
                            <p>Expected soon</p>
                        </div>
                    </div>
                </div>

                <div class="delivery-message">
                    <p>Your order is on its way! <br><strong>Delivered in 3 to 5 days</strong></p>
                </div>
            </div>
        </div>
    </div>
</main>

<script>
document.getElementById('trackingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Simulate tracking search
    const btn = e.target.querySelector('.btn-track');
    btn.innerHTML = 'Searching...';
    btn.disabled = true;
    
    setTimeout(() => {
        document.getElementById('trackingResult').style.display = 'block';
        window.scrollTo({
            top: document.getElementById('trackingResult').offsetTop - 100,
            behavior: 'smooth'
        });
        btn.innerHTML = 'Track Order';
        btn.disabled = false;
    }, 800);
});
</script>

<?php require 'footer.php'; ?>
