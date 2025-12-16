# PassAddis Infrastructure

AWS Infrastructure for PassAddis Event Ticketing Platform using Terraform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                      VPC                             │    │
│  │  ┌──────────────┐         ┌──────────────┐         │    │
│  │  │   Public     │         │   Private    │         │    │
│  │  │   Subnets    │         │   Subnets    │         │    │
│  │  │  ┌───────┐   │         │  ┌───────┐   │         │    │
│  │  │  │  ALB  │   │         │  │  ECS  │   │         │    │
│  │  │  └───────┘   │         │  │Fargate│   │         │    │
│  │  │              │         │  └───────┘   │         │    │
│  │  │              │         │  ┌───────┐   │         │    │
│  │  │              │         │  │  RDS  │   │         │    │
│  │  │              │         │  │  PG   │   │         │    │
│  │  │              │         │  └───────┘   │         │    │
│  │  └──────────────┘         └──────────────┘         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │     S3      │    │     ECR     │    │  CloudWatch │     │
│  │   Uploads   │    │   Images    │    │    Logs     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Cost Estimate (Free Tier)

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| RDS PostgreSQL (db.t3.micro) | 750 hrs/month | $0 (first year) |
| S3 Storage | 5GB | $0 |
| ECS Fargate | Pay per use | ~$5-10 |
| CloudWatch Logs | 5GB | $0 |
| VPC + ALB | - | ~$16 |

**Total (Dev):** ~$0-5/month (without ECS)
**Total (Prod):** ~$20-30/month (with ECS)

## Prerequisites

1. AWS CLI configured with credentials
2. Terraform >= 1.0 installed
3. An AWS account with free tier eligibility

## Quick Start

### 1. Initialize Terraform

```bash
cd infrastructure
terraform init
```

### 2. Set Database Password

```bash
# Linux/Mac
export TF_VAR_db_password="your-secure-password-here"

# Windows PowerShell
$env:TF_VAR_db_password="your-secure-password-here"
```

### 3. Plan (Development)

```bash
terraform plan -var-file="environments/dev/terraform.tfvars"
```

### 4. Apply (Development)

```bash
terraform apply -var-file="environments/dev/terraform.tfvars"
```

### 5. Get Outputs

```bash
terraform output
terraform output -raw database_url  # Get connection string
```

## Modules

### VPC Module
- Creates VPC with public and private subnets
- Internet Gateway for public access
- VPC Endpoint for S3 (saves data transfer costs)

### S3 Module
- S3 bucket for file uploads (event images, QR codes)
- CORS configuration for frontend uploads
- Optional CloudFront CDN

### RDS Module
- PostgreSQL 15 on db.t3.micro (FREE TIER)
- 20GB storage
- Encrypted at rest
- Performance Insights enabled

### ECS Module (Optional)
- ECS Fargate cluster
- Uses FARGATE_SPOT for 70% savings
- ALB for load balancing
- ECR repository for Docker images
- Auto-scaling configuration

## Deployment Options

### Option 1: Free Tier (Recommended for Starting)
```
- Database: Supabase (external, free 500MB)
- Backend: Railway or Render (free tier)
- Storage: AWS S3 (5GB free)
- Frontend: Vercel (free)
```

### Option 2: AWS Free Tier
```
- Database: AWS RDS (db.t3.micro, free 12 months)
- Backend: ECS Fargate (pay per use)
- Storage: AWS S3 (5GB free)
- Frontend: Vercel (free)
```

### Option 3: AWS Production
```
- Database: AWS RDS (db.t3.small or larger)
- Backend: ECS Fargate with auto-scaling
- Storage: S3 + CloudFront CDN
- Frontend: Vercel or S3 + CloudFront
```

## Cleanup

```bash
terraform destroy -var-file="environments/dev/terraform.tfvars"
```

## Files Structure

```
infrastructure/
├── main.tf                 # Root module
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── modules/
│   ├── vpc/               # VPC, subnets, routing
│   ├── s3/                # S3 bucket, policies
│   ├── rds/               # PostgreSQL database
│   └── ecs/               # ECS Fargate cluster
└── environments/
    ├── dev/
    │   └── terraform.tfvars
    └── prod/
        └── terraform.tfvars
```
