# 📬 Postman Collection Setup Guide

## 🎯 Overview
This guide shows you how to import and use the complete Postman collection for testing all Expenza OCR and expense APIs.

## 📁 Files Included
- `Expenza_OCR_APIs.postman_collection.json` - Complete API collection
- `Expenza_Development.postman_environment.json` - Development environment variables
- `Postman_Setup_Guide.md` - This guide

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Import Collection
1. **Open Postman**
2. **Click "Import"** (top left)
3. **Drag & drop** `Expenza_OCR_APIs.postman_collection.json`
4. **Click "Import"**

### Step 2: Import Environment
1. **Click gear icon** ⚙️ (top right, next to eye icon)
2. **Click "Import"**
3. **Drag & drop** `Expenza_Development.postman_environment.json`
4. **Click "Import"**

### Step 3: Select Environment
1. **Click dropdown** (top right, currently shows "No Environment")
2. **Select "Expenza Development"**

### Step 4: Update Variables
1. **Click eye icon** 👁️ (top right)
2. **Edit these variables**:
   - `base_url`: Your Django server URL (default: `http://127.0.0.1:8000`)
   - `user_email`: Your test user email
   - `user_password`: Your test user password
3. **Click "Save"**

---

## 🧪 Testing Workflow

### 1. **Authentication** 🔐
```
POST /api/auth/login/
```
- **Run this first!** It auto-saves JWT token
- Updates `jwt_token` environment variable
- All other requests use this token automatically

### 2. **Currency Conversion** 💱
```
POST /api/expenses/currency/convert/
```
- Test external API integration
- Works immediately (no dependencies)
- Try different currency pairs

### 3. **Countries & Currencies** 🌍
```
GET /api/expenses/countries-currencies/
```
- Fetches all countries and their currencies
- Works immediately (no dependencies)
- Large response (~195 countries)

### 4. **OCR Receipt Upload** 🔤
```
POST /api/expenses/ocr/upload/
```
- **Upload receipt image** for OCR processing
- Auto-saves created expense ID to environment
- **Requires Tesseract OCR installed**
- Returns extracted data + confidence scores

### 5. **Expense Management** 📊
- List, create, update, delete expenses
- All endpoints include OCR data now
- Role-based access control testing

---

## 📋 Collection Structure

### 🔐 Authentication
- **Login** - Get JWT tokens

### 🔤 OCR Processing
- **Upload Receipt for OCR** - Main OCR endpoint
- **Reprocess OCR for Expense** - Retry failed OCR

### 💱 Currency & Location
- **Convert Currency** - Live exchange rates
- **Get Countries & Currencies** - Country/currency data

### 📊 Expense Management
- **List Expenses** - With filters and pagination
- **Create Expense (Manual)** - Without OCR
- **Get Expense Details** - Full expense data + OCR
- **Update Expense** - Modify existing expense
- **Track Expense** - Approval status tracking
- **Delete Expense** - Remove expense

---

## 🔧 Environment Variables

### Auto-Populated Variables
- `jwt_token` - Set after successful login
- `created_expense_id` - Set after OCR upload
- `manual_expense_id` - Set after manual expense creation

### Configure These Variables
- `base_url` - Your Django server URL
- `ngrok_url` - For external access testing
- `user_email` - Test user email
- `user_password` - Test user password

---

## 🧪 Test Scripts Included

### Global Tests (All Requests)
- ✅ Response time < 5 seconds
- ✅ Proper response structure
- ✅ Status code validation

### Endpoint-Specific Tests
- ✅ **Login**: Auto-saves JWT token
- ✅ **OCR Upload**: Auto-saves expense ID, validates OCR data
- ✅ **Currency Convert**: Validates conversion result
- ✅ **Countries API**: Validates countries data
- ✅ **Expense APIs**: Validates expense structure

---

## 📷 OCR Testing Tips

### Supported Image Formats
- **JPEG** (.jpg, .jpeg) ✅
- **PNG** (.png) ✅
- **BMP** (.bmp) ✅
- **TIFF** (.tiff) ✅

### Best Practices
1. **Use clear receipts** - Good lighting, no blur
2. **Test different types** - Restaurant, retail, gas station
3. **Check confidence scores** - 0.8+ is high confidence
4. **Test file size limits** - Max 10MB by default

### Sample Receipt Testing
```
Receipt should contain:
✅ Merchant name
✅ Total amount
✅ Date
✅ Currency symbol ($, €, etc.)
✅ Tax/VAT amount
```

---

## 🔍 Troubleshooting

### Common Issues

#### ❌ "No module named 'pytesseract'"
```
Solution: pip install pytesseract
```

#### ❌ "TesseractNotFoundError"
```
Solution: Install Tesseract OCR system
- Windows: Download from GitHub releases
- Mac: brew install tesseract
- Linux: apt-get install tesseract-ocr
```

#### ❌ "Currency conversion failed"
```
Solution: Check internet connection
- API uses exchangerate-api.com
- Verify currency codes (USD, EUR, etc.)
```

#### ❌ "401 Unauthorized"
```
Solution: Re-run login request
- JWT tokens may have expired
- Check user credentials
```

### Response Status Codes
- **200** - Success
- **201** - Created (new expense)
- **400** - Bad request (validation error)
- **401** - Unauthorized (bad/expired token)
- **404** - Not found
- **500** - Server error

---

## 🚀 Advanced Testing

### Parallel Testing
Run multiple requests to test:
- **Concurrent OCR processing**
- **Rate limiting**
- **Server performance**

### Different User Roles
Test with different user types:
- **Admin** - See all expenses
- **Manager** - See subordinate expenses
- **Employee** - See own expenses only

### Error Scenarios
Test error handling:
- **Large files** (>10MB)
- **Invalid formats** (PDF, TXT)
- **Corrupted images**
- **Invalid currency codes**
- **Network timeouts**

---

## 🎉 Ready to Test!

Your Postman collection is now set up with:
- ✅ **Complete API coverage**
- ✅ **Automatic token management**
- ✅ **Environment variables**
- ✅ **Test assertions**
- ✅ **Example responses**
- ✅ **Error handling**

**Start with the Login request, then try OCR upload with a receipt image!** 🚀

---

## 📝 Notes

- Collection auto-manages JWT tokens
- Environment variables reduce manual work
- Test scripts validate responses automatically
- All OCR features work without Tesseract (will just fail gracefully)
- Currency/Countries APIs work immediately