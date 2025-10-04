"""
Management command to test OCR functionality.
Usage: python manage.py test_ocr
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from apps.expenses.services import (
    get_countries_and_currencies,
    convert_currency_api,
)
from decimal import Decimal
import requests


class Command(BaseCommand):
    help = 'Test OCR and API functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-currency',
            action='store_true',
            help='Test currency conversion API',
        )
        parser.add_argument(
            '--test-countries',
            action='store_true',
            help='Test countries API',
        )
        parser.add_argument(
            '--test-tesseract',
            action='store_true',
            help='Test Tesseract OCR installation',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🔍 Testing OCR and API functionality...\n')
        )

        # Test Tesseract if requested
        if options['test_tesseract']:
            self.test_tesseract()

        # Test currency API if requested
        if options['test_currency']:
            self.test_currency_api()

        # Test countries API if requested
        if options['test_countries']:
            self.test_countries_api()

        # If no specific tests requested, run all
        if not any([options['test_tesseract'], options['test_currency'], options['test_countries']]):
            self.test_tesseract()
            self.test_currency_api()
            self.test_countries_api()

        self.stdout.write(
            self.style.SUCCESS('\n✅ Testing completed!')
        )

    def test_tesseract(self):
        """Test Tesseract OCR installation."""
        self.stdout.write("🔤 Testing Tesseract OCR...")

        try:
            import pytesseract
            from PIL import Image
            import io

            # Configure Tesseract path if specified
            if hasattr(settings, 'TESSERACT_CMD') and settings.TESSERACT_CMD:
                pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

            # Create a simple test image with text
            img = Image.new('RGB', (200, 50), color='white')

            # Try to run OCR on the test image
            text = pytesseract.image_to_string(img)

            self.stdout.write(
                self.style.SUCCESS("   ✅ Tesseract OCR is working!")
            )

            # Show Tesseract version if possible
            try:
                version = pytesseract.get_tesseract_version()
                self.stdout.write(f"   📋 Tesseract version: {version}")
            except:
                self.stdout.write("   📋 Tesseract version: Unable to detect")

        except ImportError:
            self.stdout.write(
                self.style.ERROR("   ❌ pytesseract package not installed")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"   ❌ Tesseract OCR error: {str(e)}")
            )
            self.stdout.write(
                self.style.WARNING("   💡 Make sure Tesseract OCR is installed on your system")
            )

    def test_currency_api(self):
        """Test currency conversion API."""
        self.stdout.write("\n💱 Testing Currency Conversion API...")

        try:
            result = convert_currency_api(
                amount=Decimal('100.00'),
                from_currency='USD',
                to_currency='EUR'
            )

            if result:
                self.stdout.write(
                    self.style.SUCCESS(f"   ✅ Currency API working! 100 USD = {result} EUR")
                )
            else:
                self.stdout.write(
                    self.style.ERROR("   ❌ Currency conversion returned None")
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"   ❌ Currency API error: {str(e)}")
            )

    def test_countries_api(self):
        """Test countries and currencies API."""
        self.stdout.write("\n🌍 Testing Countries & Currencies API...")

        try:
            countries_data = get_countries_and_currencies()

            if countries_data:
                country_count = len(countries_data)
                self.stdout.write(
                    self.style.SUCCESS(f"   ✅ Countries API working! Found {country_count} countries")
                )

                # Show a few example countries
                examples = list(countries_data.items())[:3]
                for country, data in examples:
                    currencies = ', '.join(data['currencies'])
                    self.stdout.write(f"   📍 {country}: {currencies}")

            else:
                self.stdout.write(
                    self.style.ERROR("   ❌ Countries API returned no data")
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"   ❌ Countries API error: {str(e)}")
            )

    def test_settings(self):
        """Test OCR settings configuration."""
        self.stdout.write("\n⚙️  Checking OCR Settings...")

        # Check important settings
        settings_to_check = [
            'TESSERACT_CMD',
            'OCR_CONFIDENCE_THRESHOLD',
            'OCR_MAX_IMAGE_SIZE',
            'OCR_SUPPORTED_FORMATS',
        ]

        for setting_name in settings_to_check:
            if hasattr(settings, setting_name):
                value = getattr(settings, setting_name)
                self.stdout.write(f"   ✅ {setting_name}: {value}")
            else:
                self.stdout.write(
                    self.style.WARNING(f"   ⚠️  {setting_name}: Not configured")
                )