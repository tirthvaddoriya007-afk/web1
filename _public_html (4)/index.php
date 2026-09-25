<?php require 'data.php'; ?>
<?php require 'header.php'; ?>

<!-- Promo Section -->
<section class="home-promo">
    <img src="https://cdn.shopify.com/s/files/1/0981/2262/9416/files/2f53o_1.gif?v=1773923883" alt="Biggest Brand Bash" class="full-width-img">
    
    <img src="https://cdn.shopify.com/s/files/1/0739/7392/4006/files/related_products_banner.jpg?v=1775822440" alt="Related Products" class="full-width-img" style="object-fit: cover; width: 100%;">
    
    <div style="background: #570d48; padding: 5px 0; overflow: hidden; white-space: nowrap; display: flex;">
        <div style="display: flex; width: max-content; animation: seamless-marquee 10s linear infinite;">
            <span style="color: #ffffff; font-size: 0.85rem; font-weight: 600; padding-right: 50px; flex-shrink: 0;">Buy 2 Get 1 Free (Add 3 items to cart) &nbsp;&nbsp;&nbsp;&nbsp; Buy 2 Get 1 Free (Add 3 items to cart) &nbsp;&nbsp;&nbsp;&nbsp; Buy 2 Get 1 Free (Add 3 items to cart)</span>
            <span style="color: #ffffff; font-size: 0.85rem; font-weight: 600; padding-right: 50px; flex-shrink: 0;">Buy 2 Get 1 Free (Add 3 items to cart) &nbsp;&nbsp;&nbsp;&nbsp; Buy 2 Get 1 Free (Add 3 items to cart) &nbsp;&nbsp;&nbsp;&nbsp; Buy 2 Get 1 Free (Add 3 items to cart)</span>
        </div>
    </div>
    <style>
        @keyframes seamless-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
    </style>
    
    <img src="https://cdn.shopify.com/s/files/1/0981/2262/9416/files/xwgyl_800_1.webp?v=1773923882" alt="Benefits" class="full-width-img">
    
    <div class="deals-section" style="justify-content: center; padding: 1rem 0; border-top: 1px solid #fff3e0;">
        <div class="deals-container" style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: nowrap;">
            <p style="font-size: 1.1rem; font-weight: 700; color: #5c687e; margin: 0; display: flex; align-items: center; gap: 0.3rem; white-space: nowrap;">
                Meesho Daily Deals
                <span style="color: #e42526; font-size: 1.2rem; transform: translateY(-1px);">⚡</span>
            </p>
            <div class="meesho-timer-box" style="display: flex; align-items: center; background: #fff3e0; border: 1px solid #ff8a65; padding: 0.2rem 0.6rem; border-radius: 4px; gap: 0.4rem;">
                <span style="font-size: 1rem;">💣</span>
                <span id="deals-timer-text" style="color: #9F2089; font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 700; letter-spacing: 0.2px; white-space: nowrap;">
                    00h : 15m : 00s
                </span>
            </div>
        </div>
    </div>
</section>

<!-- Products Section -->
<section class="products container" id="products" style="margin-top: 1rem; padding-bottom: 4rem;">
    <h4 font-size="21px" font-weight="book" color="greyBase" class="sc-gswNZR wDrko">Products For You</h4>
    <div class="product-list">
        <?php foreach($products as $product): 
            $discount = $product['original_price'] > 0 ? round((($product['original_price'] - $product['price']) / $product['original_price']) * 100) : 0;
            $seed = crc32($product['id']);
            $rand_rating = number_format(3.5 + ($seed % 11) / 10, 1);
            $rand_reviews = 1111 + ($seed % 8889);
        ?>
        <a href="product.php?id=<?php echo $product['id']; ?>" class="product-card" data-id="<?php echo $product['id']; ?>">
            <div class="product-img img-loading">
                <img src="<?php echo $product['image']; ?>" alt="" onload="this.parentElement.classList.remove('img-loading')">
            </div>
            <div class="product-details">
                <h3 class="product-name"><?php echo $product['name']; ?></h3>
                <div class="product-price">
                    <span class="sell-price">₹<?php echo number_format($product['price'], 0); ?>.00</span>
                    <span class="mrp-price line-through">₹<?php echo number_format($product['original_price'], 0); ?>.00</span>
                    <span class="off-percentage m-0"><?php echo $discount; ?>% off</span>
                </div>

                <span class="NewProductCardstyled__OfferPill-sc-6y2tys-31 iMEkWH"><svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" iconsize="12" class="sc-bcXHqe eqGISc">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6A6 6 0 1 1 0 6a6 6 0 0 1 12 0ZM5.168 9.008l.8.17L3.554 6.49l-.005-.75h1.298c.383 0 .687-.076.91-.228.225-.152.375-.352.45-.6h-2.76l.261-.892h2.478c-.167-.507-.62-.76-1.36-.76h-1.38l.277-1h4.834l-.262.897H7.176c.174.245.287.533.338.863h1.037l-.257.891H7.52c-.076.54-.301.952-.678 1.238-.376.286-.908.457-1.596.512L6.88 8.493l.064-.826a.41.41 0 0 1 .437-.375.403.403 0 0 1 .373.436L7.59 9.88l-.004.012-.004.013a.42.42 0 0 1-.03.104l-.001.005a.263.263 0 0 1-.017.037.288.288 0 0 1-.011.031c-.018.026-.039.045-.06.065a.07.07 0 0 0-.006.008c-.004.004-.007.009-.013.012a.433.433 0 0 1-.12.068.417.417 0 0 1-.155.023c-.005.002-.01.003-.015.002-.019-.002-.037-.006-.054-.01l-2.102-.445a.407.407 0 0 1 .17-.797Z" fill="#219653"></path>
                    </svg><span font-size="10px" font-weight="demi" color="greenBase" class="sc-gswNZR bjrKWS"><?php echo $product['offer']; ?></span></span>
                <p class="free-delivery">Free Delivery</p>

                <div class="sc-kDvujY jTuxux NewProductCardstyled__RatingsRow-sc-6y2tys-8 heKerA NewProductCardstyled__RatingsRow-sc-6y2tys-8 heKerA" color="white">
                    <div class="NewProductCardstyled__RatingSection-sc-6y2tys-9 fyvrGC"><span label="4.3" class="sc-fbYMXx jUvjLH"><span font-size="13px" font-weight="demi" color="#ffffff" class="sc-gswNZR jrrvJf"><?php echo $rand_rating; ?></span><svg width="10" height="10" viewBox="0 0 20 20" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" ml="4" iconsize="10" class="sc-bcXHqe cyUZOu">
                                <g clip-path="url(#clip0)">
                                    <path d="M19.5399 6.85L13.6199 5.5L10.5099 0.29C10.3999 0.11 10.2099 0 9.99993 0C9.78993 0 9.59993 0.11 9.48993 0.29L6.37993 5.5L0.45993 6.85C0.25993 6.9 0.0899297 7.05 0.0299297 7.25C-0.0300703 7.45 0.00992969 7.67 0.14993 7.83L4.13993 12.4L3.58993 18.44C3.56993 18.65 3.65993 18.85 3.82993 18.98C3.99993 19.1 4.21993 19.13 4.41993 19.05L9.99993 16.64L15.5799 19.03C15.6599 19.06 15.7399 19.08 15.8099 19.08C15.8099 19.08 15.8099 19.08 15.8199 19.08C16.1199 19.09 16.4199 18.82 16.4199 18.48C16.4199 18.42 16.4099 18.36 16.3899 18.31L15.8499 12.38L19.8399 7.81C19.9799 7.65 20.0199 7.43 19.9599 7.23C19.9099 7.04 19.7399 6.89 19.5399 6.85Z" fill="#ffffff"></path>
                                </g>
                                <defs>
                                    <clipPath id="clip0">
                                        <rect width="20" height="19.08" fill="white"></rect>
                                    </clipPath>
                                </defs>
                            </svg></span><span font-size="11px" font-weight="book" color="greyT2" class="sc-gswNZR gTFgDk NewProductCardstyled__RatingCount-sc-6y2tys-21 jZyLzI NewProductCardstyled__RatingCount-sc-6y2tys-21 jZyLzI">(<?php echo $rand_reviews; ?>)</span></div><svg width="55" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" iconsize="20" class="sc-bcXHqe fUjwpe">
                        <path d="M9.901 5.496a2 2 0 0 1 2-2h41.6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-41.6a2 2 0 0 1-2-2v-9Z" fill="#FFE7FB"></path>
                        <path d="M24.712 6H19.5v1.03h2.052v5.843h1.12V7.03h2.041V6ZM24.698 8.229v4.644h1.06v-2.17c0-1.09.52-1.532 1.228-1.532a.95.95 0 0 1 .353.06V8.198a.85.85 0 0 0-.363-.068c-.55 0-1.031.314-1.267.844h-.02v-.746h-.991ZM32.226 12.873V8.229h-1.07v2.67c0 .697-.481 1.188-1.09 1.188-.56 0-.884-.383-.884-1.1V8.23h-1.06v2.975c0 1.129.628 1.816 1.63 1.816.658 0 1.188-.314 1.443-.766h.05v.619h.981ZM35.25 13.02c1.1 0 1.846-.59 1.846-1.532 0-1.855-2.543-1.03-2.543-2.052 0-.304.236-.55.698-.55.422 0 .765.246.814.59l.992-.207c-.167-.706-.893-1.188-1.836-1.188-1.03 0-1.728.57-1.728 1.434 0 1.856 2.543 1.03 2.543 2.052 0 .393-.265.658-.756.658-.481 0-.874-.255-.992-.668l-.972.197c.226.795.943 1.266 1.934 1.266ZM40.083 12.97c.343 0 .638-.058.795-.136l-.118-.855a.992.992 0 0 1-.471.099c-.501 0-.747-.226-.747-.914V9.132h1.287v-.903h-1.287V6.746l-1.07.206V8.23h-.844v.903h.844v2.21c0 1.207.658 1.629 1.61 1.629ZM45.823 11.744l-.894-.265c-.206.422-.589.657-1.09.657-.746 0-1.256-.53-1.355-1.305h3.525v-.265c-.02-1.6-1.03-2.485-2.297-2.485-1.365 0-2.308 1.07-2.308 2.485 0 1.403.992 2.454 2.425 2.454.933 0 1.61-.442 1.994-1.276ZM43.73 8.906c.6 0 1.12.373 1.169 1.198h-2.406c.118-.766.56-1.198 1.237-1.198ZM46.776 10.556c0 1.463.923 2.464 2.17 2.464.619 0 1.237-.255 1.542-.854h.03v.707h.981V6h-1.07v2.828c-.246-.432-.766-.747-1.463-.747-1.247 0-2.19.992-2.19 2.475Zm1.07 0c0-.874.501-1.542 1.316-1.542.805 0 1.296.638 1.296 1.542 0 .893-.49 1.522-1.296 1.522-.795 0-1.315-.648-1.315-1.522Z" fill="#9F2089"></path>
                        <path d="M16.5 3.239 9.027.059a.746.746 0 0 0-.585 0L.969 3.24a.782.782 0 0 0-.47.721v6.36c0 5.321 3.139 7.611 7.947 9.622a.746.746 0 0 0 .576 0c4.809-2.01 7.948-4.3 7.948-9.622V3.96c0-.316-.186-.6-.47-.721Z" fill="#FFE7FB"></path>
                        <path d="m15.748 3.894-6.75-2.871a.673.673 0 0 0-.528 0l-6.75 2.87a.706.706 0 0 0-.424.652v5.745c0 4.806 2.835 6.874 7.178 8.69.167.07.353.07.52 0 4.343-1.816 7.178-3.884 7.178-8.69V4.545a.706.706 0 0 0-.424-.651Z" fill="#60014A"></path>
                        <path d="M10.852 6.455c.804.006 1.482.28 2.04.817.565.54.843 1.185.837 1.946l-.023 3.58c-.003.426-.37.77-.824.77-.45-.003-.814-.35-.81-.777l.022-3.58a1.098 1.098 0 0 0-.367-.85 1.216 1.216 0 0 0-.885-.35 1.247 1.247 0 0 0-.921.372c-.23.227-.344.54-.347.856l-.02 3.528c-.003.432-.376.782-.833.78-.458-.004-.828-.357-.824-.79l.022-3.548c.004-.31-.11-.617-.334-.844a1.254 1.254 0 0 0-.918-.378 1.253 1.253 0 0 0-.892.34c-.24.23-.37.513-.37.845l-.022 3.576c-.004.43-.373.777-.827.774-.455-.003-.818-.353-.815-.783l.023-3.564c.003-.66.25-1.308.714-1.799.6-.632 1.34-.948 2.199-.942.82.006 1.521.285 2.082.853.578-.565 1.272-.835 2.093-.832Z" fill="#FF9D00"></path>
                    </svg>
                </div>
            </div>
        </a>
        <?php endforeach; ?>
    </div>
</section>

<?php require 'footer.php'; ?>
