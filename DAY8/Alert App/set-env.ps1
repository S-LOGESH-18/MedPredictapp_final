$env:PORT = "5000"
$env:NODE_ENV = "development"
$env:UPLOAD_DIR = "./uploads"
$env:MAX_FILE_SIZE = "5242880"
$env:NOVU_API_KEY = "56df734ee4df74197cfa7ac8b6d6a7d3"
$env:NOVU_SUBSCRIBER_ID = "medi-alert-system"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PHONE = "+1234567890"

# Start the server with the environment variables
node --experimental-modules --es-module-specifier-resolution=node server.js
