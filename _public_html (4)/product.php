<?php require 'data.php'; ?>
<?php 
$id = isset($_GET['id']) ? (string)$_GET['id'] : '11472';
// Find product by id
$product = null;
foreach($products as $p) {
    if($p['id'] == $id) {
        $product = $p;
        break;
    }
}
if(!$product) $product = $products[0];

// Calculate discount
$discount = $product['original_price'] > 0 ? round((($product['original_price'] - $product['price']) / $product['original_price']) * 100) : 0;
?>
<?php require 'header-minimal.php'; ?>
<script>
  fbq('track', 'ViewContent', {
      content_name: '<?php echo addslashes($product['name']); ?>',
      content_ids: ['<?php echo (string)$product['id']; ?>'],
      content_type: 'product',
      value: <?php echo (float)$product['price']; ?>,
      currency: 'INR'
  });
</script>
    <!-- Image Gallery -->
    <div class="product-gallery">
        <div class="main-image-container img-loading">
            <img id="mainImage" src="<?php echo $product['image']; ?>" alt="" onload="this.parentElement.classList.remove('img-loading')">
            <div class="image-indicator">
                <span class="dot active"></span>
            </div>
        </div>
        
        <?php if(isset($product['gallery'])): ?>
        <div class="similar-products-section">
            <p class="section-title"><?php echo count($product['gallery']); ?> Similar Products</p>
            <div class="thumbnail-list">
                <?php foreach($product['gallery'] as $img): ?>
                <div class="thumb-item img-loading" onclick="document.getElementById('mainImage').src='<?php echo $img; ?>'">
                    <img src="<?php echo $img; ?>" alt="" onload="this.parentElement.classList.remove('img-loading')">
                </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>

    <!-- Product Info -->
    <div class="product-info-card">
        <h1 class="product-title"><?php echo $product['name']; ?></h1>
        
        <div class="pricing-row">
            <span class="current-price">₹<?php echo number_format($product['price'], 0); ?>.00</span>
            <span class="mrp-price">₹<?php echo number_format($product['original_price'], 0); ?>.00</span>
            <span class="discount-pill"><?php echo $discount; ?>% off</span>
        </div>

        <div class="special-offer-pill">
            <span><?php echo $product['offer']; ?></span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 18l6-6-6-6"/></svg>
        </div>

        <div class="rating-trust-row">
            <div class="rating-badge">
                <span><?php echo $product['rating']; ?></span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <span class="review-count"><?php echo $product['reviews']; ?> ratings and 66 reviews</span>
            <span class="divider">•</span>
            <div class="trusted-badge-mini">
                <svg width="55" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" iconsize="20" class="sc-bcXHqe fUjwpe">
                    <path d="M9.901 5.496a2 2 0 0 1 2-2h41.6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-41.6a2 2 0 0 1-2-2v-9Z" fill="#FFE7FB"></path>
                    <path d="M24.712 6H19.5v1.03h2.052v5.843h1.12V7.03h2.041V6ZM24.698 8.229v4.644h1.06v-2.17c0-1.09.52-1.532 1.228-1.532a.95.95 0 0 1 .353.06V8.198a.85.85 0 0 0-.363-.068c-.55 0-1.031.314-1.267.844h-.02v-.746h-.991ZM32.226 12.873V8.229h-1.07v2.67c0 .697-.481 1.188-1.09 1.188-.56 0-.884-.383-.884-1.1V8.23h-1.06v2.975c0 1.129.628 1.816 1.63 1.816.658 0 1.188-.314 1.443-.766h.05v.619h.981ZM35.25 13.02c1.1 0 1.846-.59 1.846-1.532 0-1.855-2.543-1.03-2.543-2.052 0-.304.236-.55.698-.55.422 0 .765.246.814.59l.992-.207c-.167-.706-.893-1.188-1.836-1.188-1.03 0-1.728.57-1.728 1.434 0 1.856 2.543 1.03 2.543 2.052 0 .393-.265.658-.756.658-.481 0-.874-.255-.992-.668l-.972.197c.226.795.943 1.266 1.934 1.266ZM40.083 12.97c.343 0 .638-.058.795-.136l-.118-.855a.992.992 0 0 1-.471.099c-.501 0-.747-.226-.747-.914V9.132h1.287v-.903h-1.287V6.746l-1.07.206V8.23h-.844v.903h.844v2.21c0 1.207.658 1.629 1.61 1.629ZM45.823 11.744l-.894-.265c-.206.422-.589.657-1.09.657-.746 0-1.256-.53-1.355-1.305h3.525v-.265c-.02-1.6-1.03-2.485-2.297-2.485-1.365 0-2.308 1.07-2.308 2.485 0 1.403.992 2.454 2.425 2.454.933 0 1.61-.442 1.994-1.276ZM43.73 8.906c.6 0 1.12.373 1.169 1.198h-2.406c.118-.766.56-1.198 1.237-1.198ZM46.776 10.556c0 1.463.923 2.464 2.17 2.464.619 0 1.237-.255 1.542-.854h.03v.707h.981V6h-1.07v2.828c-.246-.432-.766-.747-1.463-.747-1.247 0-2.19.992-2.19 2.475Zm1.07 0c0-.874.501-1.542 1.316-1.542.805 0 1.296.638 1.296 1.542 0 .893-.49 1.522-1.296 1.522-.795 0-1.315-.648-1.315-1.522Z" fill="#9F2089"></path>
                    <path d="M16.5 3.239 9.027.059a.746.746 0 0 0-.585 0L.969 3.24a.782.782 0 0 0-.47.721v6.36c0 5.321 3.139 7.611 7.947 9.622a.746.746 0 0 0 .576 0c4.809-2.01 7.948-4.3 7.948-9.622V3.96c0-.316-.186-.6-.47-.721Z" fill="#FFE7FB"></path>
                    <path d="m15.748 3.894-6.75-2.871a.673.673 0 0 0-.528 0l-6.75 2.87a.706.706 0 0 0-.424.652v5.745c0 4.806 2.835 6.874 7.178 8.69.167.07.353.07.52 0 4.343-1.816 7.178-3.884 7.178-8.69V4.545a.706.706 0 0 0-.424-.651Z" fill="#60014A"></path>
                    <path d="M10.852 6.455c.804.006 1.482.28 2.04.817.565.54.843 1.185.837 1.946l-.023 3.58c-.003.426-.37.77-.824.77-.45-.003-.814-.35-.81-.777l.022-3.58a1.098 1.098 0 0 0-.367-.85 1.216 1.216 0 0 0-.885-.35 1.247 1.247 0 0 0-.921.372c-.23.227-.344.54-.347.856l-.02 3.528c-.003.432-.376.782-.833.78-.458-.004-.828-.357-.824-.79l.022-3.548c.004-.31-.11-.617-.334-.844a1.254 1.254 0 0 0-.918-.378 1.253 1.253 0 0 0-.892.34c-.24.23-.37.513-.37.845l-.022 3.576c-.004.43-.373.777-.827.774-.455-.003-.818-.353-.815-.783l.023-3.564c.003-.66.25-1.308.714-1.799.6-.632 1.34-.948 2.199-.942.82.006 1.521.285 2.082.853.578-.565 1.272-.835 2.093-.832Z" fill="#FF9D00"></path>
                </svg>
            </div>
        </div>

        <div class="free-delivery-tag">Free Delivery</div>
    </div>

    <!-- Size Selector -->
    <div class="product-details-card">
        <h2 class="card-title">Select Size</h2>
        <div class="size-options">
            <button class="size-btn" onclick="selectSize(this)">S</button>
            <button class="size-btn " onclick="selectSize(this)">M</button>
            <button class="size-btn active" onclick="selectSize(this)">L</button>
            <button class="size-btn" onclick="selectSize(this)">XL</button>
            <button class="size-btn" onclick="selectSize(this)">2XL</button>
            <button class="size-btn" onclick="selectSize(this)">3XL</button>
            <button class="size-btn" onclick="selectSize(this)">4XL</button>
        </div>
    </div>
    <script>
    function selectSize(btn) {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    </script>

    <!-- Seller Information -->
    <div class="seller-card">
        <div class="seller-left">
            <div class="shop-icon-blue">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2c0 .55.45 1 1 1v5h10v-5h6c.55 0 1-.45 1-1zm-9 4H5v-3h7v3zm7 0h-5v-3h5v3z"/></svg>
            </div>
            <div class="seller-info-text">
                <div class="seller-name-row">
                    <span class="sold-by-badge">Sold by</span>
                    <span class="seller-shop-name">meesho official</span>
                </div>
                <div class="seller-rating-badge">
                    <span>4.4</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
            </div>
        </div>
        <div class="seller-right">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#666" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
        </div>
    </div>

    <!-- Product Details -->
    <?php if(isset($product['details'])): ?>
    <div class="product-details-card">
        <h2 class="card-title">Product Details</h2>
        <div class="details-list">
            <?php foreach($product['details'] as $key => $value): ?>
                <?php if(is_array($value)): ?>
                    <p class="detail-category"><strong><?php echo $key; ?>:</strong></p>
                    <ul>
                        <?php foreach($value as $subKey => $subVal): ?>
                            <li><?php echo is_string($subKey) ? "<strong>$subKey</strong> - $subVal" : $subVal; ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php else: ?>
                    <p><strong><?php echo $key; ?>:</strong> <?php echo $value; ?></p>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>

    <!-- Description & Size Chart -->
    <div class="product-details-card" style="margin-top: 8px;">
        <h2 class="card-title">Description</h2>
        <div style="padding: 0 16px 16px; font-size: 0.85rem; color: #444; line-height: 1.6;">
            <p style="margin-bottom: 12px;">Elevate your ethnic wardrobe with our Premium Suit Sets and Kurtas, thoughtfully designed to bring you the perfect blend of tradition and modern elegance. Crafted from authentic, breathable fabrics, these outfits ensure absolute comfort without compromising on style.</p>
            <p style="margin-bottom: 12px;">Featuring intricate patterns, exquisite detailing, and vibrant hues, each piece is meant to make you stand out. Whether you're attending a festive celebration or an elegant outing, our collection brings a graceful touch to every occasion.</p>
            <p>👉 Premium &amp; breathable fabric for all-day wear</p>
            <p>👉 Elegant prints, embroidery, &amp; gorgeous finishing</p>
            <p>👉 Perfect for festive, casual, and party occasions</p>
            <p>👉 Flawless stitching and enduring color quality</p>
            <p style="margin-bottom: 16px;">👉 Easy to maintain for a lasting fresh look</p>
            <div style="margin-bottom: 16px; color: #666; font-size: 0.8rem;"><?php echo isset($product['desc']) ? $product['desc'] : ''; ?></div>

            <h3 style="font-size: 0.9rem; font-weight: 700; color: #333; margin-bottom: 12px;">Size Chart</h3>
            <div style="padding: 0px 0px 1rem; color: rgb(85, 85, 85); font-size: 0.88rem; line-height: 1.7; overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; color: rgb(51, 51, 51);"><thead><tr><th rowspan="2" style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(51, 51, 51); font-size: 0.78rem; white-space: nowrap;">Size</th><th colspan="2" style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(51, 51, 51); font-size: 0.78rem; white-space: nowrap;">Bust</th><th colspan="2" style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(51, 51, 51); font-size: 0.78rem; white-space: nowrap;">Length</th><th colspan="2" style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(51, 51, 51); font-size: 0.78rem; white-space: nowrap;">Shoulder</th></tr><tr><th style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(224, 92, 42); font-size: 0.78rem; white-space: nowrap;">cm</th><th style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(224, 92, 42); font-size: 0.78rem; white-space: nowrap;">inch</th><th style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(224, 92, 42); font-size: 0.78rem; white-space: nowrap;">cm</th><th style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(224, 92, 42); font-size: 0.78rem; white-space: nowrap;">inch</th><th style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(224, 92, 42); font-size: 0.78rem; white-space: nowrap;">cm</th><th style="padding: 6px 8px; text-align: center; font-weight: 600; border-bottom: 1px solid rgb(229, 231, 235); color: rgb(224, 92, 42); font-size: 0.78rem; white-space: nowrap;">inch</th></tr></thead><tbody><tr><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">S</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">106</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">41.7</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">73</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">28.7</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">44.5</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">17.5</td></tr><tr><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">M</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">112</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">44.1</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">75</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">29.5</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">46</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">18.1</td></tr><tr><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">L</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">118</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">46.5</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">77</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">30.3</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">47.5</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">18.7</td></tr><tr><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">XL</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">124</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">48.8</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">79</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">31.1</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">49</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">19.3</td></tr><tr><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">2XL</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">132</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">52</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">81</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">31.9</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">50.5</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">19.9</td></tr><tr><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">3XL</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">140</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">55.1</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">83</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">32.7</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">52</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">20.5</td></tr><tr><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">4XL</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">148</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">58.3</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">85</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">33.5</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">53.5</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">21.1</td></tr><tr><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">5XL</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">156</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">61.4</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">87</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">34.3</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">55</td><td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid rgb(240, 240, 240); font-size: 0.8rem; color: rgb(68, 68, 68);">21.7</td></tr></tbody></table><p style="margin-top: 10px; font-size: 0.75rem; color: rgb(119, 119, 119);">Due to manual measurement, there may be an error of 1-3cm</p></div>
        </div>
    </div>

    <!-- Updated Hardcoded Reviews Section (20 Reviews, 4.2 Rating) -->
    <div class="new-reviews-container">
        <div class="reviews-modal-header">
            <span>AISHANI PRETTY KURTIS</span>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </div>
        
        <div class="reviews-summary-new">
            <div class="summary-left">
                <div class="main-rating-green">
                    <span>4.2</span>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <div class="summary-counts">
                    <p>3738 ratings</p>
                    <p>256 reviews</p>
                </div>
            </div>
            
            <div class="summary-bars">
                <div class="summary-bar-row">
                    <span>Very Good</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: 43%; background: #059669;"></div></div>
                    <span>1480</span>
                </div>
                <div class="summary-bar-row">
                    <span>Good</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: 36%; background: #10b981;"></div></div>
                    <span>1190</span>
                </div>
                <div class="summary-bar-row">
                    <span>Ok-Ok</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: 14%; background: #facc15;"></div></div>
                    <span>980</span>
                </div>
                <div class="summary-bar-row">
                    <span>Bad</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: 3.5%; background: #f97316;"></div></div>
                    <span>54</span>
                </div>
                <div class="summary-bar-row">
                    <span>Very Bad</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: 3.5%; background: #ef4444;"></div></div>
                    <span>34</span>
                </div>
            </div>
        </div>

        <div class="new-review-list">
            <?php 
            $sample_reviews = [
                ['name' => 'Meesho User', 'rating' => 3, 'status' => 'Ok-Ok', 'date' => '14 Dec, 2025', 'comment' => 'Achha hai thanks meesho 🙏😊💗'],
                ['name' => 'Sahadevan', 'rating' => 3, 'status' => 'Ok-Ok', 'date' => '27 Dec, 2025', 'comment' => 'Nice product but delivery was slow'],
                ['name' => 'Aneesha Ibrahim', 'rating' => 4, 'status' => 'Good', 'date' => '20 Dec, 2025', 'comment' => 'super product quality is good'],
                ['name' => 'Divya Shukla', 'rating' => 4, 'status' => 'Good', 'date' => '18 Dec, 2025', 'comment' => 'I liked it very much thank you meesho'],
                ['name' => 'Rahul Sharma', 'rating' => 5, 'status' => 'Very Good', 'date' => '05 Jan, 2026', 'comment' => 'Really impressed with the quality. It looks great and works perfectly. Totally satisfied with this purchase!'],
                ['name' => 'Priya G', 'rating' => 4, 'status' => 'Good', 'date' => '02 Jan, 2026', 'comment' => 'Product is exactly as shown in the pictures. Delivery was quick and packaging was neat. Recommended!'],
                ['name' => 'Amit S', 'rating' => 4, 'status' => 'Good', 'date' => '30 Dec, 2025', 'comment' => 'Good value for money product'],
                ['name' => 'Sneha K', 'rating' => 5, 'status' => 'Very Good', 'date' => '28 Dec, 2025', 'comment' => 'Great value for money. The quality exceeded my expectations and I’m happy with the overall experience.'],
                ['name' => 'Vikram R', 'rating' => 3, 'status' => 'Ok-Ok', 'date' => '25 Dec, 2025', 'comment' => 'Ok product for the price'],
                ['name' => 'Pooja B', 'rating' => 4, 'status' => 'Good', 'date' => '22 Dec, 2025', 'comment' => 'Nice product with good finishing. Worth buying if youre looking for something reliable and affordable.'],
                ['name' => 'Arjun M', 'rating' => 5, 'status' => 'Very Good', 'date' => '15 Dec, 2025', 'comment' => 'I was not sure before ordering, but it turned out to be really good. Happy with my purchase 😊'],
                ['name' => 'Neha J', 'rating' => 4, 'status' => 'Good', 'date' => '12 Dec, 2025', 'comment' => 'Thanks meesho for this'],
                ['name' => 'Karan H', 'rating' => 2, 'status' => 'Bad', 'date' => '10 Dec, 2025', 'comment' => 'Loved this product! Totally worth it 👍'],
                ['name' => 'Simran T', 'rating' => 5, 'status' => 'Very Good', 'date' => '08 Dec, 2025', 'comment' => 'Very happy with my purchase 😊'],
                ['name' => 'Abhay D', 'rating' => 4, 'status' => 'Good', 'date' => '05 Dec, 2025', 'comment' => 'Superb quality and fast delivery'],
                ['name' => 'Mani P', 'rating' => 3, 'status' => 'Ok-Ok', 'date' => '02 Dec, 2025', 'comment' => 'Ok ok not too great but not bad'],
                ['name' => 'Rohini V', 'rating' => 5, 'status' => 'Very Good', 'date' => '30 Nov, 2025', 'comment' => 'Mindblowing product, just wow'],
                ['name' => 'Faisal K', 'rating' => 4, 'status' => 'Good', 'date' => '28 Nov, 2025', 'comment' => 'Worth it, definitely recommend'],
                ['name' => 'Jyoti L', 'rating' => 5, 'status' => 'Very Good', 'date' => '25 Nov, 2025', 'comment' => 'Must buy, quality is very high'],
                ['name' => 'Sameer Q', 'rating' => 4, 'status' => 'Good', 'date' => '22 Nov, 2025', 'comment' => 'Nice product, gifted to my sister']
            ];

            $gallery_photos = isset($product['gallery']) && count($product['gallery']) > 0 ? $product['gallery'] : [$product['image']];
            $photo_index = 0;

            foreach ($sample_reviews as $rev): ?>
            <div class="new-review-card">
                <p class="reviewer-name"><?php echo $rev['name']; ?></p>
                <div class="review-status-row">
                    <div class="status-badge <?php echo ($rev['rating'] >= 4) ? 'green' : 'yellow'; ?>">
                        <span><?php echo $rev['rating']; ?></span>
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    <span class="status-txt"><?php echo $rev['status']; ?></span>
                    <span class="dot">•</span>
                    <span class="review-date">Posted on <?php echo $rev['date']; ?></span>
                </div>
                <p class="review-comment"><?php echo $rev['comment']; ?></p>
                <div class="review-images-pair">
                    <img src="<?php echo $gallery_photos[$photo_index % count($gallery_photos)]; ?>" alt="">
                    <?php $photo_index++; ?>
                    <img src="<?php echo $gallery_photos[$photo_index % count($gallery_photos)]; ?>" alt="">
                    <?php $photo_index++; ?>
                </div>
                <div class="helpful-btn-new">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    <span>Helpful</span>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</main>

<div class="button-container flex">
        <button class="buynow-button buynow-button-white product-page-buy add_cart" onclick="add_to_cart()">
            <svg width="21" height="21" fill="none" xmlns="http://www.w3.org/2000/svg" ml="4" mr="4" iconsize="20" class="sc-gswNZR egWgdn">
                <g clip-path="url(#cart_svg__a)">
                    <path fill="#fff" d="M.394.479h20v20h-20z"></path>
                    <g clip-path="url(#cart_svg__b)">
                        <g clip-path="url(#cart_svg__c)">
                            <path d="M4.396 4.293h15.139c.507 0 .907.491.849 1.046l-.762 7.335c-.068.619-.536 1.1-1.102 1.12l-12.075.492-2.05-9.993Z" fill="#C53EAD"></path>
                            <path d="M10.193 20.478c.674 0 1.22-.598 1.22-1.334s-.546-1.334-1.22-1.334c-.674 0-1.22.597-1.22 1.334 0 .737.546 1.335 1.22 1.335ZM15.181 20.478c.674 0 1.22-.598 1.22-1.335s-.546-1.334-1.22-1.334c-.674 0-1.22.597-1.22 1.334 0 .737.546 1.335 1.22 1.335Z" fill="#9F2089"></path>
                            <path d="M1.126 3.28 4.152 4.7 6.68 16.784c.127.608.615 1.035 1.18 1.035h9.615" stroke="#9F2089" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </g>
                    </g>
                </g>
                <defs>
                    <clipPath id="cart_svg__a">
                        <path fill="#fff" transform="translate(.394 .479)" d="M0 0h20v20H0z"></path>
                    </clipPath>
                    <clipPath id="cart_svg__b">
                        <path fill="#fff" transform="translate(.394 .479)" d="M0 0h20v20H0z"></path>
                    </clipPath>
                    <clipPath id="cart_svg__c">
                        <path fill="#fff" transform="translate(.394 2.479)" d="M0 0h20v18H0z"></path>
                    </clipPath>
                </defs>
            </svg>
            Add to Cart
        </button>
        <button class=" buynow-button product-page-buy buy_now" onclick="add_to_cart('buyNow')">
            <svg width="21" height="21" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" ml="4" mr="4" stroke="transparent" btntype="solid" class="sc-gswNZR dXbsni PdpFooter__SolidButtonBigStyled-sc-rnhxff-1 kEhBpR" iconsize="20">
                <path d="M1.894 4.546v11.796a.5.5 0 0 0 .837.369l6.74-6.18a.5.5 0 0 0-.017-.752l-6.74-5.617a.5.5 0 0 0-.82.384ZM11.894 4.546v11.796a.5.5 0 0 0 .837.369l6.74-6.18a.5.5 0 0 0-.017-.752l-6.74-5.617a.5.5 0 0 0-.82.384Z" fill="#fff"></path>
            </svg>
            Buy Now
        </button>
    </div>

<script>
    function add_to_cart(type) {
        console.log('add_to_cart called', type);
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const titleEl = document.querySelector('.product-title');
        const priceEl = document.querySelector('.current-price');
        const imgEl = document.querySelector('#mainImage');
        
        if (!titleEl || !priceEl) {
            console.error('Missing product info');
            return;
        }

        const id = new URLSearchParams(window.location.search).get('id') || '11472';
        const name = titleEl.innerText;
        const price = parseFloat(priceEl.innerText.replace(/[^0-9.]/g, ''));
        const image = imgEl ? imgEl.src : '';

        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        
        if (typeof fbq === 'function') {
            fbq('track', 'AddToCart', {
                content_name: name,
                content_ids: [id],
                content_type: 'product',
                value: price,
                currency: 'INR'
            });
        }
        
        // Trigger UI update if function exists
        if (window.updateCartUI) {
            window.updateCartUI();
        } else {
            // Minimal fallback update for the badge
            const badge = document.getElementById('cartBadge');
            if (badge) {
                const count = cart.reduce((acc, curr) => acc + curr.quantity, 0);
                badge.innerText = count;
                badge.classList.remove('d-none');
            }
        }

        if (type === 'buyNow') {
            window.location.href = 'cart.php';
        } else {
            if (window.openCart) {
                window.openCart();
            } else {
                // Inline open cart logic
                const popup = document.getElementById('cartPopup');
                const overlay = document.getElementById('cartOverlay');
                if (popup && overlay) {
                    popup.classList.add('active');
                    overlay.classList.add('active');
                }
            }
        }
    }
</script>
<script src="script.js"></script>
<!-- Offers Popup -->
<style>
.offers-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}
.offers-popup-overlay.show {
    opacity: 1;
    visibility: visible;
}
.offers-popup-box {
    background: #fff;
    width: 90%;
    max-width: 380px;
    border-radius: 16px;
    text-align: center;
    position: relative;
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    transform: translateY(20px) scale(0.95);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
}
.offers-popup-overlay.show .offers-popup-box {
    transform: translateY(0) scale(1);
}
.offers-urgency-banner {
    background: #ef4444;
    color: white;
    padding: 14px 20px;
    font-weight: 700;
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    animation: flashBg 2s infinite;
}
@keyframes flashBg {
    0%, 100% { background: #ef4444; }
    50% { background: #dc2626; }
}
#offerTimer {
    font-variant-numeric: tabular-nums;
    background: rgba(255,255,255,0.2);
    padding: 3px 8px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 1.2rem;
    letter-spacing: 1px;
}
.offers-popup-content {
    padding: 24px;
}
.offers-close-btn {
    position: absolute;
    top: 6px;
    right: 12px;
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: rgba(255,255,255,0.8);
    line-height: 1;
    z-index: 10;
}
.offers-close-btn:hover {
    color: white;
}
.offers-popup-title {
    color: #9F2089;
    font-size: 1.3rem;
    margin-top: 5px;
    margin-bottom: 20px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.offers-popup-list {
    list-style: none;
    padding: 0;
    margin: 0 0 24px 0;
    text-align: left;
}
.offers-popup-list li {
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
    color: #831843;
    padding: 14px 16px;
    margin-bottom: 12px;
    border-radius: 10px;
    font-weight: 700;
    border: 1px solid #fbcfe8;
    display: flex;
    align-items: center;
    font-size: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.offers-popup-list li::before {
    content: '🔥';
    margin-right: 14px;
    font-size: 1.4rem;
}
.offers-action-btn {
    background: linear-gradient(to right, #9F2089, #e83e8c);
    color: #fff;
    border: none;
    padding: 14px 24px;
    border-radius: 30px;
    font-size: 1.15rem;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    box-shadow: 0 6px 12px rgba(159, 32, 137, 0.3);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.offers-action-btn:active {
    transform: scale(0.97);
    box-shadow: 0 2px 6px rgba(159, 32, 137, 0.2);
}
</style>

<div class="offers-popup-overlay" id="offersPopupOverlay">
    <div class="offers-popup-box">
        <button class="offers-close-btn" onclick="closeOffersPopup()">&times;</button>
        <div class="offers-urgency-banner">
            ⏳ Offer closes in <span id="offerTimer">15:00</span>! Hurry up!
        </div>
        <div class="offers-popup-content">
            <h3 class="offers-popup-title">Mega Sale Is Live</h3>
            <ul class="offers-popup-list">
                <li>Buy 2 Get 1 Free</li>
                <li>Buy 3 Get 2 Free</li>
                <li>Buy 4 Get 3 Free</li>
                <li>Buy 5 Get 5 Free</li>
            </ul>
            <div class="offers-popup-footer">
                <button class="offers-action-btn" onclick="closeOffersPopup()">Claim Offer Now</button>
            </div>
        </div>
    </div>
</div>

<script>
function closeOffersPopup() {
    document.getElementById('offersPopupOverlay').classList.remove('show');
}

function startOfferTimer() {
    let timerDisplay = document.getElementById('offerTimer');
    // Check if we have a saved end time in sessionStorage to keep timer consistent during navigation
    let endTime = sessionStorage.getItem('offerEndTime');
    
    if (!endTime) {
        // Set end time 15 minutes from now
        endTime = new Date().getTime() + (15 * 60 * 1000);
        sessionStorage.setItem('offerEndTime', endTime);
    } else {
        endTime = parseInt(endTime);
    }
    
    let timerInterval = setInterval(function() {
        let now = new Date().getTime();
        let distance = endTime - now;
        
        if (distance < 0) {
            clearInterval(timerInterval);
            timerDisplay.innerHTML = "00:00";
            return;
        }
        
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        
        timerDisplay.innerHTML = minutes + ":" + seconds;
    }, 1000);
}

window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('offersPopupOverlay').classList.add('show');
        startOfferTimer();
    }, 1200); // Show popup after 1.2s
});
</script>
</body>
</html>
