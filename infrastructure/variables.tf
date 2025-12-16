# PassAddis Infrastructure Variables

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"  # Stockholm - closest to Ethiopia
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "passaddis_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "enable_ecs" {
  description = "Enable ECS Fargate for backend hosting"
  type        = bool
  default     = false  # Start with false, enable when ready to deploy
}

variable "container_image" {
  description = "Docker image for backend"
  type        = string
  default     = ""
}

variable "rds_publicly_accessible" {
  description = "Make RDS publicly accessible (for development only - NOT for production)"
  type        = bool
  default     = false
}
