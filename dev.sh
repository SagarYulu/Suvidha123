#!/bin/bash
# Development script that automatically syncs directories

echo "Starting development server with auto-sync..."

# Function to sync directories
sync_dirs() {
    rm -rf frontend
    cp -r client frontend
    echo "✓ Directories synced"
}

# Initial sync
sync_dirs

# Watch for changes in client directory
echo "Watching for changes in client directory..."
while true; do
    # Check if client has been modified in last 2 seconds
    if [ -d "client" ]; then
        find client -type f -mtime -2s 2>/dev/null | head -1 | grep -q . && sync_dirs
    fi
    sleep 2
done &

# Store the watcher PID
WATCHER_PID=$!

# Run the dev server
npm run dev

# Clean up watcher on exit
trap "kill $WATCHER_PID 2>/dev/null" EXIT