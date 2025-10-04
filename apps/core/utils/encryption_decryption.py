"""
Encryption and Decryption Utilities

This module provides secure encryption and decryption functionality using AES-256-CBC
for sensitive data handling in the Crediple CAR backend application.

Key Features:
- AES-256-CBC encryption with PBKDF2 key derivation
- Secure salt-based key generation
- Base64 encoding for encrypted data
- Comprehensive error handling
- Support for string, dict, and list data types

Security Features:
- Uses PBKDF2 with SHA-256 for key derivation (10,000 iterations)
- Random initialization vector (IV) for each encryption
- PKCS7 padding for data alignment
- Environment-based password and salt configuration

Dependencies:
- pycryptodome for AES encryption
- base64 for data encoding
- hashlib for key derivation
- json for data serialization

Author: Crediple Development Team
Security Level: High - Handles sensitive user data
"""

from asyncio.log import logger
import os
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import hashlib
from rest_framework import status
from rest_framework.exceptions import ValidationError
import json


def generate_key(password=None, salt_str=None):
    """
    Generate a 32-byte encryption key using PBKDF2 key derivation.

    This function uses PBKDF2 (Password-Based Key Derivation Function 2) with
    SHA-256 to derive a secure encryption key from a password and salt.
    The process is computationally intensive to prevent brute-force attacks.

    Args:
        password (str, optional): Password for key derivation.
                                 Defaults to ENCRYPTION_PASSWORD environment variable.
        salt_str (str, optional): Salt string for key derivation.
                                 Defaults to SALT_STR_KEY environment variable.

    Returns:
        bytes: 32-byte encryption key suitable for AES-256

    Raises:
        CustomValidation: If password or salt is not configured
    """
    # Use environment variables as defaults if not provided
    password = password or os.environ.get("ENCRYPTION_PASSWORD")
    salt_str = salt_str or os.environ.get("SALT_STR_KEY")

    if not password or not salt_str:
        raise ValidationError(
            "Encryption configuration error: ENCRYPTION_PASSWORD and SALT_STR_KEY must be set"
        )

    # Convert salt string to bytes
    salt = salt_str.encode("utf-8")

    # Generate key using PBKDF2 with 50,000 iterations
    # This makes brute-force attacks computationally expensive
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 50000, 32)

    return key


def decrypt(encrypted_data, password=None):
    """
    Decrypt data that was encrypted using the encrypt function.

    This function reverses the encryption process by:
    1. Decoding the base64-encoded encrypted data
    2. Extracting the initialization vector (first 16 bytes)
    3. Decrypting the remaining data using AES-256-CBC
    4. Removing PKCS7 padding
    5. Converting the result back to a string

    Args:
        encrypted_data (str): Base64-encoded encrypted data
        password (str, optional): Password used for encryption.
                                 Defaults to PASSWORD environment variable.

    Returns:
        str: Decrypted data as a string

    Raises:
        CustomValidation: If decryption fails due to invalid data, wrong password,
                         or corrupted encrypted data
    """
    try:
        # Decode base64-encoded encrypted data
        encrypted_bytes = base64.b64decode(encrypted_data)

        # Extract initialization vector (first 16 bytes)
        iv = encrypted_bytes[:16]

        # Extract actual encrypted data (remaining bytes)
        actual_encrypted_data = encrypted_bytes[16:]

        # Generate the same key used for encryption
        key = generate_key(password)

        # Create AES cipher in CBC mode with the extracted IV
        cipher = AES.new(key, AES.MODE_CBC, iv)

        # Decrypt the data
        decrypted_data = cipher.decrypt(actual_encrypted_data)

        # Remove PKCS7 padding
        decrypted_data = unpad(decrypted_data, AES.block_size)

        # Convert bytes back to string
        return decrypted_data.decode("utf-8")

    except (ValueError, KeyError, TypeError, AttributeError) as e:
        # Log the error for debugging (without exposing sensitive data)
        logger.error(f"Decryption error: {str(e)}")
        raise ValidationError(
            "Error in decrypting data. Please check your input and try again."
        )


def encrypt(data, password=None):
    """
    Encrypt data using AES-256-CBC encryption.

    This function encrypts data using the following process:
    1. Converts input data to bytes (handles strings, dicts, and lists)
    2. Generates a random initialization vector (IV)
    3. Creates an AES-256-CBC cipher with the IV
    4. Pads the data to AES block size using PKCS7
    5. Encrypts the padded data
    6. Combines IV and encrypted data
    7. Encodes the result in base64

    Args:
        data (str, dict, list): Data to encrypt. Can be a string, dictionary, or list.
        password (str, optional): Password for encryption.
                                 Defaults to PASSWORD environment variable.

    Returns:
        str: Base64-encoded encrypted data

    Raises:
        CustomValidation: If encryption fails due to invalid data or configuration
    """
    try:
        # Handle dict and list by converting them to JSON string
        if isinstance(data, (dict, list)):
            data = json.dumps(data)

        # Convert data to bytes if it's a string
        if isinstance(data, str):
            data = data.encode("utf-8")

        # Generate encryption key
        key = generate_key(password)

        # Create AES cipher with random initialization vector
        cipher = AES.new(key, AES.MODE_CBC)
        iv = cipher.iv

        # Pad data to be a multiple of 16 bytes (AES block size)
        padded_data = pad(data, AES.block_size)

        # Encrypt the padded data
        encrypted_data = cipher.encrypt(padded_data)

        # Combine IV and encrypted data, then encode to base64
        result = base64.b64encode(iv + encrypted_data).decode("utf-8")

        return result

    except Exception as e:
        # Log the error for debugging (without exposing sensitive data)
        print(f"Encryption error: {str(e)}")
        raise ValidationError(
            "Error in encrypting data. Please check your input and try again."
        )
