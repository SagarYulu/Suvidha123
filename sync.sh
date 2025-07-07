#!/bin/bash
# Simple sync script to keep client and frontend in sync
# Run this whenever you make changes to the frontend code

echo "Syncing frontend to client..."
rm -rf client
cp -r frontend client
echo "Sync complete!"