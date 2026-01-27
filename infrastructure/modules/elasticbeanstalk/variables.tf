# Elastic Beanstalk Module Variables

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for EC2 instances"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "RDS security group ID to allow EB access"
  type        = string
}

# Application Configuration
variable "database_url" {
  description = "PostgreSQL connection URL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
}

variable "s3_bucket_name" {
  description = "S3 bucket name for file uploads"
  type        = string
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN"
  type        = string
}

# Payment Configuration - Telebirr
variable "telebirr_merchant_app_id" {
  description = "Telebirr Merchant App ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "telebirr_fabric_app_id" {
  description = "Telebirr Fabric App ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "telebirr_app_secret" {
  description = "Telebirr App Secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "telebirr_short_code" {
  description = "Telebirr Short Code"
  type        = string
  default     = ""
}

variable "telebirr_private_key" {
  description = "Telebirr RSA Private Key"
  type        = string
  sensitive   = true
  default     = ""
}

# SMS Configuration
variable "afro_sms_api_key" {
  description = "Afro Message SMS API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "afro_sms_identifier" {
  description = "Afro Message sender identifier"
  type        = string
  default     = ""
}

variable "afro_sms_sender" {
  description = "Afro Message sender name"
  type        = string
  default     = "PassAddis"
}
