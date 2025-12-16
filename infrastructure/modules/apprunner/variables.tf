# App Runner Module Variables

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

variable "private_subnet_ids" {
  description = "Private subnet IDs for VPC connector"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "RDS security group ID to allow App Runner access"
  type        = string
}

# GitHub Configuration
variable "github_repository_url" {
  description = "GitHub repository URL (e.g., https://github.com/username/repo)"
  type        = string
}

variable "github_branch" {
  description = "GitHub branch to deploy from"
  type        = string
  default     = "main"
}

variable "github_connection_arn" {
  description = "ARN of the GitHub connection in App Runner"
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

variable "extra_environment_variables" {
  description = "Additional environment variables for the backend"
  type        = map(string)
  default     = {}
}

# Instance Configuration
variable "cpu" {
  description = "CPU units (256, 512, 1024, 2048, 4096)"
  type        = string
  default     = "256"  # 0.25 vCPU - cheapest option
}

variable "memory" {
  description = "Memory in MB (512, 1024, 2048, 3072, 4096, 6144, 8192, 10240, 12288)"
  type        = string
  default     = "512"  # 0.5 GB - cheapest option
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 3
}
