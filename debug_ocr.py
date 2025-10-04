"""
Debug script to test OCR functionality step by step
Run this to identify where the NoneType error is occurring
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append('C:/Users/PALAK/OneDrive/Desktop/Odoo-IITG/Expenza')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expenza.settings.development')
django.setup()

def test_tesseract():
    """Test if Tesseract is working"""
    print("🔤 Testing Tesseract OCR...")
    try:
        import pytesseract
        from PIL import Image

        # Check if Tesseract path is configured
        from django.conf import settings
        if hasattr(settings, 'TESSERACT_CMD'):
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
            print(f"   Tesseract path: {settings.TESSERACT_CMD}")

        # Create a simple test image
        img = Image.new('RGB', (200, 50), color='white')

        # Try OCR
        text = pytesseract.image_to_string(img)
        print(f"   ✅ Tesseract working! Extracted: '{text.strip()}'")
        return True

    except Exception as e:
        print(f"   ❌ Tesseract error: {str(e)}")
        return False

def test_ocr_parsing():
    """Test OCR text parsing"""
    print("\n📝 Testing OCR text parsing...")
    try:
        from apps.expenses.services import parse_receipt_data

        # Test with sample receipt text
        sample_text = """McDonald's
Receipt #12345
Total: $15.67 USD
Date: 01/15/2024
Tax: $1.25"""

        print(f"   Input text: {repr(sample_text)}")

        result = parse_receipt_data(sample_text)
        print(f"   ✅ Parsing successful!")
        print(f"   Merchant: {result.get('merchant_name')}")
        print(f"   Amount: {result.get('total_amount')}")
        print(f"   Currency: {result.get('currency')}")
        print(f"   Date: {result.get('date')}")
        print(f"   Confidence: {result.get('confidence_score')}")
        return True

    except Exception as e:
        print(f"   ❌ Parsing error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_empty_parsing():
    """Test parsing with empty/None text"""
    print("\n🔍 Testing empty text parsing...")
    try:
        from apps.expenses.services import parse_receipt_data

        # Test with None
        result1 = parse_receipt_data(None)
        print("   ✅ None input handled")

        # Test with empty string
        result2 = parse_receipt_data("")
        print("   ✅ Empty string handled")

        # Test with whitespace
        result3 = parse_receipt_data("   \n  \t  ")
        print("   ✅ Whitespace handled")

        return True

    except Exception as e:
        print(f"   ❌ Empty parsing error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_currency_conversion():
    """Test currency conversion"""
    print("\n💱 Testing currency conversion...")
    try:
        from apps.expenses.services import convert_currency_api
        from decimal import Decimal

        result = convert_currency_api(Decimal('100'), 'USD', 'EUR')
        if result:
            print(f"   ✅ Currency conversion working: 100 USD = {result} EUR")
        else:
            print("   ⚠️  Currency conversion returned None (check internet)")
        return True

    except Exception as e:
        print(f"   ❌ Currency conversion error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting OCR Debug Tests...\n")

    # Run all tests
    tests = [
        test_tesseract,
        test_empty_parsing,
        test_ocr_parsing,
        test_currency_conversion,
    ]

    results = []
    for test in tests:
        results.append(test())

    print(f"\n📊 Results: {sum(results)}/{len(results)} tests passed")

    if all(results):
        print("🎉 All tests passed! OCR should be working.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")