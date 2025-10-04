"""
Quick test to check if the services file can be imported
"""
import sys
import os

# Add the project path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    # Test if we can import the services without syntax errors
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expenza.settings.development')

    import django
    django.setup()

    from apps.expenses.services import parse_receipt_data

    print("✅ Services imported successfully!")

    # Test the function with simple text
    result = parse_receipt_data("Test receipt\nTotal: $10.50\nDate: 01/15/2024")
    print(f"✅ Parse function works! Result: {result}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()