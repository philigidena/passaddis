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
