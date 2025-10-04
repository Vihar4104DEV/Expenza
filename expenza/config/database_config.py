### DATABASE CONFIGURATION ####

import os
import dj_database_url
print(os.environ.get("DB_NAME"))
print(os.environ.get("DB_USER"))
print(os.environ.get("DB_PWD"))
print(os.environ.get("DB_HOST"))
print(os.environ.get("DB_PORT"))
print(os.environ.get("DB_SSL_MODE"))
print(os.environ.get("DB_CHANNEL_BINDING"))

DATABASES = {
    "default": dj_database_url.config(
        default='postgresql://neondb_owner:npg_D4GvmxhMW1AH@ep-small-dream-adcxr59j-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        conn_max_age=600,   # keeps connections open longer
    )
}
