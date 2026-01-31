#!/bin/sh
set -e

# Create deployments.json if it doesn't exist
DEPLOYMENTS_FILE="/app/client/src/deployments.json"
if [ ! -f "$DEPLOYMENTS_FILE" ]; then
  echo "Creating deployments.json file..."
  mkdir -p /app/client/src
  echo '{"networks": {}}' > "$DEPLOYMENTS_FILE"
fi

# Execute the command passed to the container
exec "$@"




