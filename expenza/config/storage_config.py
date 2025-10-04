import os

# =============================================================================
### STORAGE CONFIGURATION ####
# =============================================================================


STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            "bucket_name": os.environ.get("AWS_STORAGE_BUCKET_NAME"),
            "access_key": os.environ.get("AWS_ACCESS_KEY_ID"),
            "secret_key": os.environ.get("AWS_SECRET_ACCESS_KEY"),
            "region_name": os.environ.get("AWS_S3_REGION_NAME"),
            "location": os.environ.get("AWS_BUCKET_FOLDER", "rex_architect"),  # This sets the root folder in S3
            "file_overwrite": False,
            
            
        }
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    }
}