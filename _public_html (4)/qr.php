<?php
$amount = isset($_GET['price']) ? (float)$_GET['price'] : 0;
if ($amount <= 0) {
    $amount = 1;
}

$upiId = 'mab.037327020830028@axisbank';
$payeeName = 'Meesho Private Limited';
$txnRef = 'ND' . time();
$note = 'Meesho Order';

$upiUrl = 'upi://pay?' . http_build_query([
    'pa' => $upiId,
    'pn' => $payeeName,
    'am' => number_format($amount, 2, '.', ''),
    'cu' => 'INR',
    'tn' => $note,
    'tr' => $txnRef
]);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scan To Pay - Meesho Private Limited</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        *{box-sizing:border-box}
        body{
            margin:0;
            min-height:100vh;
            background:#f5f5f5;
            font-family:'Outfit',sans-serif;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        }
        .card{
            width:100%;
            max-width:390px;
            background:#fff;
            border-radius:18px;
            padding:24px;
            box-shadow:0 8px 30px rgba(0,0,0,.10);
            text-align:center;
        }
        h1{font-size:22px;margin:0 0 8px;color:#222}
        .sub{font-size:14px;color:#666;margin-bottom:18px}
        #qrcode{
            width:240px;
            min-height:240px;
            margin:0 auto 18px;
            padding:10px;
            border:1px solid #eee;
            border-radius:14px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#fff;
        }
        #qrcode img, #qrcode canvas{max-width:100%!important;height:auto!important}
        .amount{font-size:28px;font-weight:800;color:#9f2089;margin:8px 0}
        .name{font-weight:700;color:#222;margin-top:6px}
        .upi{font-size:13px;color:#666;word-break:break-all;margin:6px 0 18px}
        .open-btn{
            display:block;
            width:100%;
            background:#9f2089;
            color:#fff;
            text-decoration:none;
            padding:14px 18px;
            border-radius:10px;
            font-size:16px;
            font-weight:700;
        }
        .back{
            display:inline-block;
            margin-top:14px;
            color:#555;
            text-decoration:none;
            font-size:14px;
        }
    </style>
</head>
<body>
<div class="card">
    <h1>Scan To Pay</h1>
    <div class="sub">Scan this QR using any UPI app</div>

    <div id="qrcode"></div>

    <div class="amount">₹<?= htmlspecialchars(number_format($amount, 2)) ?></div>
    <div class="name"><?= htmlspecialchars($payeeName) ?></div>

    
    <a class="back" href="javascript:history.back()">← Back to Payment</a>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script>
    const upiUrl = <?= json_encode($upiUrl, JSON_UNESCAPED_SLASHES) ?>;

    if (typeof QRCode === 'undefined') {
        document.getElementById('qrcode').innerHTML =
            '<p style="color:#c00;font-size:14px">QR library could not load. Please check internet connection.</p>';
    } else {
        new QRCode(document.getElementById('qrcode'), {
            text: upiUrl,
            width: 220,
            height: 220,
            correctLevel: QRCode.CorrectLevel.H
        });
    }
</script>
</body>
</html>