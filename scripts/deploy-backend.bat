@echo off
REM Deploy PassAddis Backend to AWS Elastic Beanstalk
REM Usage: scripts\deploy-backend.bat

echo PassAddis Backend Deployment Script
echo ========================================

REM Check if we're in the right directory
if not exist "backend" (
    echo Error: Run this script from the project root directory
    exit /b 1
)

cd backend

echo Installing dependencies...
call npm ci

echo Generating Prisma Client...
call npx prisma generate

echo Building application...
call npm run build

echo Creating deployment package...
if exist deploy rmdir /s /q deploy
if exist deploy.zip del deploy.zip
mkdir deploy

REM Copy required files
xcopy /E /I dist deploy\dist
xcopy /E /I prisma deploy\prisma
copy package.json deploy\
copy package-lock.json deploy\

REM Create Procfile
echo web: npm run start:prod > deploy\Procfile

REM Create .ebextensions directory and config
mkdir deploy\.ebextensions
(
echo option_settings:
echo   aws:elasticbeanstalk:container:nodejs:
echo     NodeCommand: "npm run start:prod"
echo   aws:elasticbeanstalk:application:environment:
echo     NODE_ENV: production
) > deploy\.ebextensions\nodecommand.config

REM Create zip (requires PowerShell or 7-Zip)
echo Creating ZIP file...
powershell -Command "Compress-Archive -Path deploy\* -DestinationPath deploy.zip -Force"

echo.
echo Deployment package created: backend\deploy.zip
echo.
echo To deploy to AWS Elastic Beanstalk:
echo.
echo 1. Go to AWS Elastic Beanstalk Console
echo 2. Select 'passaddis-dev-backend-env'
echo 3. Click 'Upload and Deploy'
echo 4. Upload backend\deploy.zip
echo 5. Click 'Deploy'
echo.
echo Don't forget to run database migrations after deployment!

cd ..
