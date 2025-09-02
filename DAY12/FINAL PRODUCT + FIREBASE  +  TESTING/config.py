# Configuration file for the application
import os

# Novu Configuration
NOVU_API_KEY = os.environ.get('NOVU_API_KEY', 'd1e3f13b59c09badf6851f023845abfa')
NOVU_BASE_URL = os.environ.get('NOVU_BASE_URL', 'https://api.novu.co/v1')
NOVU_WORKFLOW_ID = os.environ.get('NOVU_WORKFLOW_ID', 'medpredict')
NOVU_SUBSCRIBER_ID = os.environ.get('NOVU_SUBSCRIBER_ID', '68a9b02f064b1af91d47d8b1')
NOVU_SUBSCRIBER_EMAIL = os.environ.get('NOVU_SUBSCRIBER_EMAIL', '727722euai032@skcet.ac.in')

# Flask Configuration
FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
FLASK_DEBUG = os.environ.get('FLASK_DEBUG', '1')

# Snowflake Configuration
SNOWFLAKE_USER = os.environ.get('SNOWFLAKE_USER', 'Logesh0904')
SNOWFLAKE_PASSWORD = os.environ.get('SNOWFLAKE_PASSWORD', 'Logi@123456789')
SNOWFLAKE_ACCOUNT = os.environ.get('SNOWFLAKE_ACCOUNT', 'pawcpyq-it31682')
SNOWFLAKE_WAREHOUSE = os.environ.get('SNOWFLAKE_WAREHOUSE', 'COMPUTE_WH')
SNOWFLAKE_ROLE = os.environ.get('SNOWFLAKE_ROLE', 'ACCOUNTADMIN')
SNOWFLAKE_DATABASE = os.environ.get('SNOWFLAKE_DATABASE', 'MEDPREDICT')
SNOWFLAKE_SCHEMA = os.environ.get('SNOWFLAKE_SCHEMA', 'PUBLIC')
