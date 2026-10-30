#!/bin/bash
echo "Starting ПРОТОКОЛ: ПЕРЕЗАПУСК..."
cd "$(dirname "$0")"
npm run build
node server/dist/server/src/index.js
