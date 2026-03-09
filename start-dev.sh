#!/bin/bash
export PATH="/Users/pipiotrsmolenotrsmolen/.nvm/versions/node/v22.22.1/bin:$PATH"
export DATABASE_URL="file:./prisma/dev.db"
npm run dev
