#!/usr/bin/env bash
# Lance l'API FastAPI (8000) et le frontend Next.js (3000)
set -e
cd "$(dirname "$0")"
trap 'kill 0' EXIT
(cd api && python -m uvicorn main:app --host 127.0.0.1 --port 8000) &
(cd frontend && npm run dev) &
echo "Site : http://localhost:3000  ·  API : http://localhost:8000"
wait
