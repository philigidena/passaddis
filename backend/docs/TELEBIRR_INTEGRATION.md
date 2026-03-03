# Telebirr C2B WebCheckout Integration Guide

## Overview
This document contains the complete Telebirr API integration documentation for PassAddis.

---

## Environment URLs

| Environment | API Base URL | Web Checkout URL |
|-------------|-------------|------------------|
| **Testbed** | `https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway` | `https://196.188.120.3:38443/payment/web/paygate?` |
| **Production** | `https://telebirrappcube.ethiomobilemoney.et:38443/apiaccess/payment/gateway` | `https://telebirrappcube.ethiomobilemoney.et:38443/payment/web/paygate?` |

---

## Step 1: Apply Fabric Token

Get authentication token to communicate with the SuperApp API.

### API Information
- **Endpoint**: `/payment/v1/token`
- **Method**: POST
- **Content-Type**: application/json

### Request Headers
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| X-APP-Key | String | M | Fabric App ID from Telebirr portal |

### Request Body
```json
{
  "appSecret": "851bdccee2f83622658a45e3ddc40188"
}
```

### Response
```json
{
  "effectiveDate": "20221101132422",
  "expirationDate": "20221101142422",
  "token": "Bearer 94cc42be4412696d754508c06ca1db20"
}
```

---

## Step 2: Create Order (PreOrder)

Create a payment order. Requires fabric token from Step 1.

### API Information
- **Endpoint**: `/payment/v1/merchant/preOrder`
- **Method**: POST
- **Content-Type**: application/json

### Request Headers
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| X-APP-Key | String | M | Fabric App ID |
| Authorization | String | M | Fabric Token from Step 1 |

### Request Body
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| timestamp | string(13) | M | UTC timestamp in seconds |
| method | string | M | Fixed: "payment.preorder" |
| nonce_str | string(32) | M | Random 32-char alphanumeric string |
| sign_type | string | M | Fixed: "SHA256WithRSA" |
| sign | string(512) | M | Request signature |
| version | string(4) | M | Fixed: "1.0" |
| biz_content | object | M | Business content object |

### biz_content Object
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| notify_url | string(512) | M | Callback URL for payment notifications |
| redirect_url | string(512) | O | Redirect URL after payment |
| appid | string(32) | M | Merchant Application ID |
| merch_code | string(16) | M | Merchant Short Code |
| merch_order_id | string(64) | M | Unique order ID (letters, numbers, underscores) |
| trade_type | string | M | "Checkout" for web payments |
| title | string(512) | M | Order title |
| total_amount | string(20) | M | Amount (max 2 decimal places) |
| trans_currency | string(3) | M | Currency: "ETB" |
| timeout_express | string(10) | M | Timeout: "120m" |
| business_type | string(32) | M | Fixed: "BuyGoods" |
| payee_identifier | string | O | Merchant Short Code |
| payee_identifier_type | string | O | "04" for short code |
| payee_type | string | O | "5000" for organization |

### Request Example
```json
{
  "timestamp": "1535166225",
  "method": "payment.preorder",
  "nonce_str": "fcab0d2949e64a69a212aa83eab6ee1d",
  "sign": "JYyVqFAmdgBG4n1eBQYUwNlC...",
  "sign_type": "SHA256WithRSA",
  "version": "1.0",
  "biz_content": {
    "appid": "1072905731584000",
    "business_type": "BuyGoods",
    "merch_code": "000000",
    "merch_order_id": "201907161732001",
    "notify_url": "http://test.payment.com/notify",
    "redirect_url": "http://test.payment.com/redirect",
    "timeout_express": "120m",
    "title": "iphone1",
    "total_amount": "12",
    "trade_type": "Checkout",
    "trans_currency": "ETB"
  }
}
```

### Response
```json
{
  "result": "SUCCESS",
  "code": "0",
  "msg": "success",
  "nonce_str": "97fe4ae0c0604854a749fbf2cc1cc712",
  "sign": "Eo4Bvwx9rpaWAO+iYzaaXHoWBWbYcCGnVZMEcG5TPb8w...",
  "sign_type": "SHA256WithRSA",
  "biz_content": {
    "merch_order_id": "1705460512562",
    "prepay_id": "080075a4e3213924de2b3b84ad3cac0a6a6001"
  }
}
```

---

## Step 3: Generate Checkout URL

Build the checkout URL using prepay_id from Step 2.

### URL Format
```
{webBaseUrl}{rawRequest}&version=1.0&trade_type=Checkout
```

### rawRequest Parameters
```
appid={appid}&merch_code={merch_code}&nonce_str={nonce_str}&prepay_id={prepay_id}&timestamp={timestamp}&sign={sign}&sign_type=SHA256WithRSA
```

### Example
```javascript
function createRawRequest(prepayId) {
  let map = {
    appid: config.merchantAppId,
    merch_code: config.merchantCode,
    nonce_str: tools.createNonceStr(),
    prepay_id: prepayId,
    timestamp: tools.createTimeStamp(),
  };
  let sign = tools.signRequestObject(map);

  let rawRequest = [
    "appid=" + map.appid,
    "merch_code=" + map.merch_code,
    "nonce_str=" + map.nonce_str,
    "prepay_id=" + map.prepay_id,
    "timestamp=" + map.timestamp,
    "sign=" + sign,
    "sign_type=SHA256WithRSA",
  ].join("&");

  return rawRequest;
}
```

---

## Step 5: Query Order

Query payment status when callback is not received.

### API Information
- **Endpoint**: `/payment/v1/merchant/queryOrder`
- **Method**: POST

### Request Body
```json
{
  "timestamp": "1535166225",
  "method": "payment.queryorder",
  "nonce_str": "fcab0d2949e64a69a212aa83eab6ee1d",
  "sign": "...",
  "sign_type": "SHA256WithRSA",
  "version": "1.0",
  "biz_content": {
    "appid": "1072905731584000",
    "merch_code": "000000",
    "merch_order_id": "201907161732001"
  }
}
```

### Response trade_status Values
| Status | Description |
|--------|-------------|
| PAY_SUCCESS | Payment successful |
| PAY_FAILED | Payment failed or expired |
| WAIT_PAY | Waiting for payment |
| ORDER_CLOSED | Order closed |
| PAYING | Payment in progress |

---

## Step 7: Notify (Callback)

Telebirr sends payment notification to your notify_url.

### Callback Body
```json
{
  "notify_url": "http://197.156.68.29:5050/v2/api/order-v2/mini/payment",
  "appid": "853694808089634",
  "notify_time": "1670575472482",
  "merch_code": "245445",
  "merch_order_id": "1670575560882",
  "payment_order_id": "00801104C911443200001002",
  "total_amount": "10.00",
  "trans_id": "49485948475845",
  "trans_currency": "ETB",
  "trade_status": "Completed",
  "trans_end_time": "1670575472000",
  "sign": "AOwWQF0QDg0jzzs5otLYOunoR65GGgC3hyr+oYn8mm1Qph6Een7C...",
  "sign_type": "SHA256WithRSA"
}
```

### trade_status Values
| Status | Description |
|--------|-------------|
| Completed | Payment successful |
| Pending | Awaiting synchronization |
| Paying | Payment in progress |
| Expired | Order expired |
| Failure | Payment failed |

---

## Step 8: Refund Order

Process refunds for successful payments.

### API Information
- **Endpoint**: `/payment/v1/merchant/refund`
- **Method**: POST

### biz_content for Refund
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| appid | string(32) | M | Merchant App ID |
| merch_code | string(16) | M | Merchant Short Code |
| merch_order_id | string(64) | M | Original order ID |
| refund_request_no | string(64) | M | Transaction ID to refund |
| actual_amount | string | M | Refund amount |
| trans_currency | string(3) | M | Currency: "ETB" |
| refund_reason | string(256) | O | Reason for refund |

---

## Signature Process

### Steps to Sign a Request

1. **Exclude fields**: `sign`, `sign_type`, `biz_content` (as object)
2. **Flatten**: Include all `biz_content` fields in the map
3. **Sort**: Alphabetically (A-Z)
4. **Join**: `key=value` pairs with `&`
5. **Sign**: Using SHA256WithRSA algorithm

### Example String to Sign
```
appid=1227484825753601&merch_code=101011&merch_order_id=1755866910890&method=payment.preorder&nonce_str=H5QN4M6EAB2TXXVFK8SVV0RW6UFASICS&notify_url=https://www.google.com&timeout_express=120m&timestamp=1755866911&title=diamond_1.5&total_amount=1.5&trade_type=Checkout&trans_currency=ETB&version=1.0
```

### JavaScript Signature Code
```javascript
const crypto = require("crypto");

function signRequestObject(requestObject) {
  const excludeFields = ["sign", "sign_type", "biz_content"];
  let fieldMap = {};

  // Add top-level fields
  for (let key in requestObject) {
    if (excludeFields.indexOf(key) >= 0) continue;
    fieldMap[key] = requestObject[key];
  }

  // Flatten biz_content
  if (requestObject.biz_content) {
    for (let key in requestObject.biz_content) {
      fieldMap[key] = requestObject.biz_content[key];
    }
  }

  // Sort and join
  let fields = Object.keys(fieldMap).sort();
  let signStrList = fields.map(key => key + "=" + fieldMap[key]);
  let signOriginStr = signStrList.join("&");

  // Sign with RSA-SHA256
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signOriginStr);
  return sign.sign(privateKey, 'base64');
}
```

---

## Configuration Reference

### Environment Variables
```env
# Credentials from Telebirr Portal
TELEBIRR_MERCHANT_APP_ID=your_merchant_app_id
TELEBIRR_FABRIC_APP_ID=your_fabric_app_id
TELEBIRR_APP_SECRET=your_app_secret
TELEBIRR_SHORT_CODE=your_short_code
TELEBIRR_PRIVATE_KEY=your_private_key_base64
TELEBIRR_PUBLIC_KEY=telebirr_public_key_base64

# API URLs
TELEBIRR_API_URL=https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway
TELEBIRR_WEB_CHECKOUT_URL=https://196.188.120.3:38443/payment/web/paygate?

# Callback URL (must use whitelisted IP)
API_URL=http://your_whitelisted_ip:port
```

### Whitelisted IPs
Your server IPs must be whitelisted with Telebirr:
- 51.20.62.58 (Elastic IP)
- 13.62.2.79 (Auto-assigned IP)

---

## Error Codes

| Error Code | Description |
|------------|-------------|
| 49401026001 | API not found - check request URL |
| verify sign failed | Signature verification failed |

---

## Troubleshooting

### Common Issues

1. **"can not find api"**: URL path is incorrect
2. **"verify sign failed"**: Check signature algorithm and field ordering
3. **Connection timeout**: Check if IPs are whitelisted
4. **Token error**: Check appSecret and X-APP-Key

### Debug Checklist
- [ ] Credentials match Telebirr portal exactly
- [ ] Private key is in correct format (base64 or PEM)
- [ ] Timestamp format is correct
- [ ] Nonce is 32 characters
- [ ] All required fields are included
- [ ] Fields are sorted alphabetically for signing
- [ ] API URL includes full path
