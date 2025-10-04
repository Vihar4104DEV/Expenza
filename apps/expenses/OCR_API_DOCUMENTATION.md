# OCR Receipt Processing API Documentation

## Overview
This API provides automatic receipt processing using OCR (Optical Character Recognition) technology. Users can upload receipt images and the system will automatically extract expense data including amounts, dates, merchant names, and more.

## Base URL
```
/api/expenses/
```

## Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔤 OCR Endpoints

### 1. Upload Receipt for OCR Processing
**POST** `/api/expenses/ocr/upload/`

Upload a receipt image and automatically create an expense with extracted data.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```
  receipt_image: File (required) - Image file (JPEG, PNG, etc.)
  category: String (optional) - Expense category
  description: String (optional) - Manual description override
  ```

#### Example Request
```javascript
const formData = new FormData();
formData.append('receipt_image', fileInput.files[0]);
formData.append('category', 'Food');

fetch('/api/expenses/ocr/upload/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-jwt-token',
  },
  body: formData
})
```

#### Response
```json
{
  "success": true,
  "message": "Receipt processed and expense created successfully",
  "data": {
    "expense": {
      "id": "uuid",
      "amount": "45.67",
      "original_currency": "USD",
      "category": "Food",
      "description": "Expense at McDonald's",
      "expense_date": "2024-01-15",
      "processing_status": "completed",
      "ocr_confidence_score": 0.85,
      "ocr_merchant_name": "McDonald's",
      "ocr_extracted_amount": "45.67",
      "ocr_extracted_currency": "USD",
      "ocr_extracted_date": "2024-01-15"
    },
    "ocr_result": {
      "success": true,
      "confidence_score": 0.85,
      "extracted_data": {
        "merchant_name": "McDonald's",
        "total_amount": "45.67",
        "currency": "USD",
        "date": "2024-01-15",
        "tax_amount": "3.67"
      }
    }
  }
}
```

### 2. Reprocess OCR for Existing Expense
**POST** `/api/expenses/{expense_id}/ocr/process/`

Reprocess OCR for an existing expense (useful if initial processing failed).

#### Response
```json
{
  "success": true,
  "message": "OCR processing completed",
  "data": {
    "expense": { /* updated expense data */ },
    "ocr_result": { /* OCR processing results */ }
  }
}
```

---

## 💱 Currency & Location Endpoints

### 3. Convert Currency
**POST** `/api/expenses/currency/convert/`

Convert amounts between currencies using live exchange rates.

#### Request Body
```json
{
  "amount": 100.00,
  "from_currency": "USD",
  "to_currency": "EUR"
}
```

#### Response
```json
{
  "success": true,
  "message": "Currency conversion successful",
  "data": {
    "original_amount": "100.00",
    "from_currency": "USD",
    "to_currency": "EUR",
    "converted_amount": "85.23"
  }
}
```

### 4. Get Countries and Currencies
**GET** `/api/expenses/countries-currencies/`

Get list of all countries and their supported currencies.

#### Response
```json
{
  "success": true,
  "message": "Countries and currencies data retrieved successfully",
  "data": {
    "countries": {
      "United States": {
        "currencies": ["USD"],
        "primary_currency": "USD"
      },
      "Germany": {
        "currencies": ["EUR"],
        "primary_currency": "EUR"
      }
    },
    "total_countries": 195
  }
}
```

---

## 📋 Enhanced Expense Endpoints

All existing expense endpoints now include OCR data in responses:

### Get Expense Details
**GET** `/api/expenses/{expense_id}/`

Now includes additional OCR fields:
```json
{
  "ocr_extracted_currency": "USD",
  "ocr_confidence_score": 0.85,
  "merchant_address": "123 Main St, City",
  "receipt_total": "45.67",
  "tax_amount": "3.67",
  "processing_status": "completed",
  "line_items": [
    {
      "description": "Big Mac Meal",
      "quantity": "1.00",
      "unit_price": "12.99",
      "total_price": "12.99",
      "category": "Food",
      "ocr_confidence": 0.9
    }
  ]
}
```

---

## 🔧 Configuration

### Environment Variables
Add to your `.env` file:
```env
# OCR Configuration
TESSERACT_CMD=tesseract
OCR_CONFIDENCE_THRESHOLD=0.5
OCR_MAX_IMAGE_SIZE=10485760
CURRENCY_API_TIMEOUT=10
COUNTRIES_API_TIMEOUT=10

# Optional: Google Vision API (for better OCR)
USE_GOOGLE_VISION=False
GOOGLE_VISION_API_KEY=
```

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- BMP (.bmp)
- TIFF (.tiff)

### File Size Limits
- Maximum: 10MB (configurable via `OCR_MAX_IMAGE_SIZE`)

---

## 🎯 OCR Data Extraction

The system automatically extracts:

### Basic Receipt Data
- ✅ **Merchant Name**: Restaurant/store name
- ✅ **Total Amount**: Final amount paid
- ✅ **Currency**: Currency code (USD, EUR, etc.)
- ✅ **Date**: Transaction date
- ✅ **Tax Amount**: VAT/GST/Sales tax

### Advanced Features
- ✅ **Line Items**: Individual items with quantities and prices
- ✅ **Merchant Address**: Store location
- ✅ **Confidence Scores**: Accuracy ratings for each field
- ✅ **Receipt Total vs Line Items**: Validation between totals

### Confidence Scoring
- **0.8 - 1.0**: High confidence (green) - Auto-fill recommended
- **0.5 - 0.8**: Medium confidence (orange) - Review recommended
- **0.0 - 0.5**: Low confidence (red) - Manual verification required

---

## 🚨 Error Handling

### Common Error Responses

#### Image Too Large
```json
{
  "success": false,
  "message": "Image file too large. Maximum size is 10.0MB."
}
```

#### Unsupported Format
```json
{
  "success": false,
  "message": "Unsupported file format. Supported formats: JPEG, PNG, BMP"
}
```

#### OCR Processing Failed
```json
{
  "success": false,
  "message": "No text could be extracted from image"
}
```

#### Currency Conversion Failed
```json
{
  "success": false,
  "message": "Currency conversion failed. Please check currency codes."
}
```

---

## 🧪 Testing

### Test OCR Functionality
```bash
python manage.py test_ocr --test-tesseract
```

### Test Currency API
```bash
python manage.py test_ocr --test-currency
```

### Test Countries API
```bash
python manage.py test_ocr --test-countries
```

---

## 📱 Frontend Integration Examples

### React Upload Component
```jsx
const ReceiptUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('receipt_image', file);

    const response = await fetch('/api/expenses/ocr/upload/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    const data = await response.json();
    setResult(data);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload & Process</button>

      {result && (
        <div>
          <h3>Extracted Data:</h3>
          <p>Merchant: {result.data.expense.ocr_merchant_name}</p>
          <p>Amount: {result.data.expense.amount}</p>
          <p>Confidence: {(result.data.ocr_result.confidence_score * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};
```

### Currency Converter Hook
```javascript
const useCurrencyConverter = () => {
  const convertCurrency = async (amount, from, to) => {
    const response = await fetch('/api/expenses/currency/convert/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
        from_currency: from,
        to_currency: to
      })
    });

    return await response.json();
  };

  return { convertCurrency };
};
```

---

## 🎉 Ready to Use!

The OCR receipt processing feature is now fully integrated and ready for production use. Simply:

1. Install Tesseract OCR on your system
2. Run database migrations
3. Start uploading receipt images via the API!

The system will automatically extract expense data and create pre-filled expense records for your users. 🚀