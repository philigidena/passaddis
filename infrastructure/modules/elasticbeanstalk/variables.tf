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

# Payment & SMS Configuration
variable "chapa_secret_key" {
  description = "Chapa API secret key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "chapa_webhook_secret" {
  description = "Chapa webhook secret"
  type        = string
  sensitive   = true
  default     = ""
}

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
