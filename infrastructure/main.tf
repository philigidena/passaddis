# PassAddis Infrastructure
# AWS Infrastructure for Event Ticketing Platform

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 backend for state management
  # backend "s3" {
  #   bucket         = "passaddis-terraform-state"
  #   key            = "state/terraform.tfstate"
  #   region         = "eu-north-1"
  #   encrypt        = true
  #   dynamodb_table = "passaddis-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "PassAddis"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Local variables
locals {
  name_prefix = "passaddis-${var.environment}"
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  name_prefix = local.name_prefix
  environment = var.environment
}

# S3 Module for file uploads
module "s3" {
  source = "./modules/s3"

  name_prefix = local.name_prefix
  environment = var.environment
}

# RDS PostgreSQL Module (Free Tier)
module "rds" {
  source = "./modules/rds"

  name_prefix         = local.name_prefix
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  public_subnet_ids   = module.vpc.public_subnet_ids
  db_username         = var.db_username
  db_password         = var.db_password
  publicly_accessible = var.rds_publicly_accessible
}

# ECS Fargate Module (Optional - for backend hosting)
module "ecs" {
  source = "./modules/ecs"
  count  = var.enable_ecs ? 1 : 0

  name_prefix        = local.name_prefix
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids

  # Container settings
  container_image    = var.container_image
  container_port     = 3000

  # Environment variables for the container
  environment_variables = {
    NODE_ENV     = var.environment
    DATABASE_URL = module.rds.database_url
    AWS_REGION   = var.aws_region
    S3_BUCKET    = module.s3.bucket_name
  }
}

# App Runner Module (Optional - for backend hosting)
module "apprunner" {
  source = "./modules/apprunner"
  count  = var.enable_apprunner ? 1 : 0

  name_prefix        = local.name_prefix
  environment        = var.environment
  aws_region         = var.aws_region
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids

  # RDS access
  rds_security_group_id = module.rds.security_group_id

  # GitHub configuration
  github_repository_url = var.github_repository_url
  github_branch         = var.github_branch
  github_connection_arn = var.github_connection_arn

  # Application configuration
  database_url   = module.rds.database_url
  jwt_secret     = var.jwt_secret
  frontend_url   = var.frontend_url
  s3_bucket_name = module.s3.bucket_name
  s3_bucket_arn  = module.s3.bucket_arn

  # Extra environment variables (Chapa, SMS, etc.)
  extra_environment_variables = {
    CHAPA_SECRET_KEY     = var.chapa_secret_key
    CHAPA_WEBHOOK_SECRET = var.chapa_webhook_secret
    AFRO_SMS_API_KEY     = var.afro_sms_api_key
    AFRO_SMS_IDENTIFIER  = var.afro_sms_identifier
    AFRO_SMS_SENDER      = var.afro_sms_sender
  }

  # Instance configuration (cost optimized)
  cpu           = "256"   # 0.25 vCPU
  memory        = "512"   # 0.5 GB
  min_instances = 1
  max_instances = 3
}

# Elastic Beanstalk Module (Recommended - FREE TIER eligible)
module "elasticbeanstalk" {
  source = "./modules/elasticbeanstalk"
  count  = var.enable_elasticbeanstalk ? 1 : 0

  name_prefix       = local.name_prefix
  environment       = var.environment
  aws_region        = var.aws_region
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids

  # RDS access
  rds_security_group_id = module.rds.security_group_id

  # Application configuration
  database_url   = module.rds.database_url
  jwt_secret     = var.jwt_secret
  frontend_url   = var.frontend_url
  s3_bucket_name = module.s3.bucket_name
  s3_bucket_arn  = module.s3.bucket_arn

  # Payment & SMS configuration
  chapa_secret_key     = var.chapa_secret_key
  chapa_webhook_secret = var.chapa_webhook_secret
  afro_sms_api_key     = var.afro_sms_api_key
  afro_sms_identifier  = var.afro_sms_identifier
  afro_sms_sender      = var.afro_sms_sender
}
