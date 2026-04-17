#!/bin/bash
# Run this after loading the extension to update the native messaging manifest
# Usage: ./update_extension_id.sh YOUR_EXTENSION_ID

ID="$1"
if [ -z "$ID" ]; then
    echo "Usage: $0 <extension-id>"
    echo "Find your extension ID at chrome://extensions/"
    exit 1
fi

MANIFEST="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.mcallorum.patricia.json"

# Replace the placeholder
sed -i '' "s/EXTENSION_ID_HERE/$ID/" "$MANIFEST"

echo "Updated manifest for extension ID: $ID"
echo ""
cat "$MANIFEST"
