### DATABASE CONFIGURATION ####

import os
import dj_database_url

DATABASES = {
    "default": dj_database_url.config(
        default='postgresql://neondb_owner:npg_D4GvmxhMW1AH@ep-small-dream-adcxr59j-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        conn_max_age=600,   # keeps connections open longer
    )
}
