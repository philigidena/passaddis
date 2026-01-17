#!/bin/bash
cd /var/app/staging
npm ci --production
npx prisma generate
