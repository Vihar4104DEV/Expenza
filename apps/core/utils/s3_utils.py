"""
S3 Utility Functions

This module provides utility functions for S3 file operations using Django's
default storage system configured with S3Boto3Storage, including presigned URL generation.
"""

import os
import re
import uuid
import boto3
import logging
import unicodedata
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.base import ContentFile
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def validate_storage_config():
    """
    Validate that the storage configuration has all required environment variables.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    required_vars = [
        "AWS_STORAGE_BUCKET_NAME",
        "AWS_ACCESS_KEY_ID", 
        "AWS_SECRET_ACCESS_KEY",
        "AWS_S3_REGION_NAME",
        "AWS_BUCKET_FOLDER"  # Added this as required
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        logger.error(error_msg)
        return False, error_msg
    
    return True, "Storage configuration is valid"


def get_s3_client():
    """
    Get configured S3 client for presigned URL operations.
    
    Returns:
        boto3.client: Configured S3 client
        
    Raises:
        ValueError: If configuration is invalid
    """
    is_valid, error_msg = validate_storage_config()
    if not is_valid:
        raise ValueError(error_msg)
    
    return boto3.client(
        's3',
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        region_name=os.environ.get("AWS_S3_REGION_NAME")
    )


def get_renamed_file(uploaded_file):
    """
    Rename uploaded file with a unique identifier.
    
    Args:
        uploaded_file: Django uploaded file object
        
    Returns:
        InMemoryUploadedFile: Renamed file object
    """
    if not uploaded_file:
        return None
    
    try:
        # Get file extension
        file_extension = os.path.splitext(uploaded_file.name)[1]
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Create new file object with unique name
        renamed_file = InMemoryUploadedFile(
            uploaded_file.file,
            uploaded_file.field_name,
            unique_filename,
            uploaded_file.content_type,
            uploaded_file.size,
            uploaded_file.charset
        )
        
        return renamed_file
    except Exception as e:
        logger.error(f"Error renaming file: {str(e)}")
        return uploaded_file  # Return original file if renaming fails


def upload_file_to_storage(file_obj, upload_path):
    """
    Upload file using Django's default storage (configured S3).
    
    Args:
        file_obj: File object to upload
        upload_path (str): Storage path prefix (e.g., "rex_construction/user_profile_pictures/")
        
    Returns:
        str: Storage path/name if successful
        
    Raises:
        Exception: If upload fails
    """
    if not file_obj:
        raise ValueError("File object is required")
    
    try:
        # Prepare storage path
        storage_path = f"{upload_path.rstrip('/')}/{file_obj.name}"
        
        # Reset file pointer to beginning
        file_obj.seek(0)
        print("storage path",storage_path)
        # Save file using Django's storage system
        saved_path = default_storage.save(storage_path, file_obj)
        
        logger.info(f"File uploaded successfully to storage: {saved_path}")
        return saved_path
        
    except Exception as e:
        logger.error(f"Failed to upload file to storage: {str(e)}")
        raise Exception(f"File upload failed: {str(e)}")


def delete_file_from_storage(file_path):
    """
    Delete file using Django's default storage (configured S3).
    
    Args:
        file_path (str): Storage file path to delete
        
    Returns:
        bool: True if successful, False otherwise
    """
    if not file_path:
        return False
    
    try:
        # Validate storage configuration first
        is_valid, error_msg = validate_storage_config()
        if not is_valid:
            logger.error(f"Storage configuration invalid: {error_msg}")
            return False
            
        if default_storage.exists(file_path):
            default_storage.delete(file_path)
            logger.info(f"File deleted successfully from storage: {file_path}")
            return True
        else:
            logger.info(f"File does not exist in storage, skipping deletion: {file_path}")
            return True  # Consider it successful if file doesn't exist
    except Exception as e:
        logger.error(f"Failed to delete file from storage: {str(e)}")
        return False


def get_file_url(file_path):
    """
    Get the URL for a file stored in the default storage.
    
    Args:
        file_path (str): Storage file path
        
    Returns:
        str: File URL if exists, None otherwise
    """
    if not file_path:
        return None
    
    try:
        # Validate storage configuration first
        is_valid, error_msg = validate_storage_config()
        if not is_valid:
            logger.error(f"Storage configuration invalid: {error_msg}")
            return None
            
        if default_storage.exists(file_path):
            return default_storage.url(file_path)
        return None
    except Exception as e:
        logger.error(f"Failed to get file URL: {str(e)}")
        return None


def get_bucket_folder():
    """
    Get the configured AWS bucket folder from environment variables.
    
    Returns:
        str: Bucket folder path
    """
    return os.environ.get("AWS_BUCKET_FOLDER", "rex_architect")


def generate_presigned_url(file_path, expiration=3600, http_method='GET'):
    """
    Generate a presigned URL for S3 object access.
    
    Args:
        file_path (str): S3 object key/path
        expiration (int): URL expiration time in seconds (default: 1 hour)
        http_method (str): HTTP method for the presigned URL (GET, PUT, DELETE)
        
    Returns:
        str: Presigned URL if successful, None otherwise
    """
    if not file_path:
        return None
    print("file Path",file_path)
    try:
        s3_client = get_s3_client()
        bucket_name = os.environ.get("AWS_STORAGE_BUCKET_NAME")
        bucket_folder = get_bucket_folder()
        print("Bucket Name",bucket_name)
        print("Bucket Folder",bucket_folder)
        
        # Check if file exists first
        if http_method == 'GET':
            try:
                s3_client.head_object(Bucket=bucket_name, Key=f"{bucket_folder}/{file_path}")
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    logger.warning(f"File not found for presigned URL: {file_path}")
                    return None
                raise
        print("Bucket Name", bucket_name)
        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': f"{bucket_folder}/{file_path}"},
            ExpiresIn=expiration
        )
        
        logger.info(f"Generated presigned URL for: {file_path}")
        return presigned_url
        
    except Exception as e:
        logger.error(f"Failed to generate presigned URL for {file_path}: {str(e)}")
        return None


def generate_presigned_upload_url(file_path, expiration=3600, content_type=None):
    """
    Generate a presigned URL for uploading files to S3.
    
    Args:
        file_path (str): S3 object key/path where file will be uploaded
        expiration (int): URL expiration time in seconds (default: 1 hour)
        content_type (str): Expected content type of the file
        
    Returns:
        dict: Dictionary with 'url' and 'fields' for POST upload, None if failed
    """
    if not file_path:
        return None
    
    try:
        s3_client = get_s3_client()
        bucket_name = os.environ.get("AWS_STORAGE_BUCKET_NAME")
        
        conditions = []
        if content_type:
            conditions.append(['starts-with', '$Content-Type', content_type.split('/')[0]])
        
        # Generate presigned POST URL
        presigned_post = s3_client.generate_presigned_post(
            Bucket=bucket_name,
            Key=file_path,
            Fields={'Content-Type': content_type} if content_type else None,
            Conditions=conditions if conditions else None,
            ExpiresIn=expiration
        )
        
        logger.info(f"Generated presigned upload URL for: {file_path}")
        return presigned_post
        
    except Exception as e:
        logger.error(f"Failed to generate presigned upload URL for {file_path}: {str(e)}")
        return None 
    
    
def sanitize_filename(filename):
    """
    Converts filename to a flat string by removing spaces, special characters, and normalizing it.
    Example: "My File (2024).pdf" -> "My_File_2024.pdf"
    """
    filename = unicodedata.normalize('NFKD', filename).encode('ascii', 'ignore').decode('utf-8')
    filename = re.sub(r'[^\w.-]', '_', filename)  # Replace special characters with underscores
    return filename