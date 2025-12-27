# PassAddis Backend Deployment Guide

## AWS Elastic Beanstalk Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- Python 3.x installed (for creating deployment bundles)
- Node.js and npm installed

### Deployment Bundle Structure

The deployment bundle MUST have this exact structure (matching v13/v19 which worked):

```
deploy-vXX/
├── Procfile              # Contains: web: npm run start:prod
├── package.json
├── package-lock.json
├── nest-cli.json
├── tsconfig.json
├── dist/                 # Compiled JavaScript
│   ├── src/              # MUST be dist/src/, NOT dist/deploy_pkg/src/
│   │   ├── main.js
│   │   ├── app.module.js
│   │   └── ... (all compiled modules)
│   └── prisma/
│       └── seed.js
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma
└── src/                  # Source TypeScript (needed for Prisma)
```

### Critical Points

1. **Clean Build Required**: Before creating a deployment bundle, ALWAYS clean the dist folder:
   ```bash
   rm -rf dist
   npm run build
   ```
   This prevents old deployment artifacts from polluting the build.

2. **Correct dist/ Structure**: The dist folder should contain `dist/src/` and `dist/prisma/`, NOT nested folders like `dist/deploy_pkg/src/`.

3. **Linux-Compatible Archive**: Windows creates archives with backslashes and CRLF line endings. Use the Python script to create compatible bundles.

4. **Procfile Must Have Unix Line Endings**: The Procfile must use LF (not CRLF).

### Step-by-Step Deployment

#### 1. Build the Backend
```bash
cd backend
rm -rf dist
npm run build
```

#### 2. Create Deployment Directory
```bash
# Create fresh deployment directory
rm -rf deploy-vXX
mkdir deploy-vXX

# Copy configuration files
cp Procfile package.json package-lock.json nest-cli.json tsconfig.json deploy-vXX/

# Copy source directories
cp -r prisma deploy-vXX/
cp -r src deploy-vXX/

# Copy ONLY the required dist contents (not old deployment folders)
mkdir deploy-vXX/dist
cp -r dist/src deploy-vXX/dist/
cp -r dist/prisma deploy-vXX/dist/
cp dist/check-db.* deploy-vXX/dist/ 2>/dev/null
cp dist/tsconfig.build.tsbuildinfo deploy-vXX/dist/ 2>/dev/null
```

#### 3. Create Linux-Compatible Zip

Update `create-zip.py` with the new version number:
```python
zip_path = 'deploy-vXX.zip'
source_dir = 'deploy-vXX'
```

Run:
```bash
python create-zip.py
```

The Python script ensures:
- Forward slashes in paths (Linux compatibility)
- Unix line endings (LF) for text files
- node_modules is excluded

#### 4. Upload to S3
```bash
aws s3 cp --region eu-north-1 deploy-vXX.zip s3://elasticbeanstalk-eu-north-1-080744443396/passaddis-dev-backend/vXX.zip
```

#### 5. Create Application Version
```bash
aws elasticbeanstalk create-application-version \
  --region eu-north-1 \
  --application-name passaddis-dev-backend \
  --version-label vXX \
  --source-bundle S3Bucket=elasticbeanstalk-eu-north-1-080744443396,S3Key=passaddis-dev-backend/vXX.zip
```

#### 6. Deploy to Environment
```bash
aws elasticbeanstalk update-environment \
  --region eu-north-1 \
  --environment-name passaddis-dev-backend-env \
  --version-label vXX
```

#### 7. Monitor Deployment
```bash
# Check health (wait ~30-60 seconds)
aws elasticbeanstalk describe-environment-health \
  --region eu-north-1 \
  --environment-name passaddis-dev-backend-env \
  --attribute-names All

# Check events for errors
aws elasticbeanstalk describe-events \
  --region eu-north-1 \
  --environment-name passaddis-dev-backend-env \
  --max-items 10
```

#### 8. Verify Deployment
```bash
curl http://passaddis-dev-backend-env.eba-bvsaimrn.eu-north-1.elasticbeanstalk.com/api/health
```

### Database Migrations

After deploying new schema changes, run Prisma commands:

```bash
# Set DATABASE_URL (note: # must be URL-encoded as %23)
export DATABASE_URL="postgresql://passaddis_admin:Atsed2025%23@passaddis-dev-postgres.ctm4gw4ymzq7.eu-north-1.rds.amazonaws.com:5432/passaddis?schema=public"

# Push schema changes
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Source bundle has issues" | Wrong archive format or structure | Use Python script, verify dist/src/ structure |
| "Cannot find module" | Missing dist files | Clean rebuild, verify dist/ contents |
| Connection timeout on S3 upload | Wrong region | Add `--region eu-north-1` flag |
| Prisma connection error | Password with special chars | URL-encode special characters (# = %23) |
| CRLF errors | Windows line endings | Use Python script to convert to LF |

### Environment Variables (Set in EB Console)

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: production
- `PORT`: 8080 (EB default)

### AWS Resources

- **Application**: passaddis-dev-backend
- **Environment**: passaddis-dev-backend-env
- **S3 Bucket**: elasticbeanstalk-eu-north-1-080744443396
- **Region**: eu-north-1 (Stockholm)
- **RDS**: passaddis-dev-postgres.ctm4gw4ymzq7.eu-north-1.rds.amazonaws.com

### Working Versions Reference

- **v13**: First working deployment (baseline structure)
- **v19**: Working deployment with admin, organizer, shop-owner modules
