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

# App Runner Configuration
variable "enable_apprunner" {
  description = "Enable App Runner for backend hosting"
  type        = bool
  default     = false
}

# Elastic Beanstalk Configuration
variable "enable_elasticbeanstalk" {
  description = "Enable Elastic Beanstalk for backend hosting (FREE TIER eligible)"
  type        = bool
  default     = false
}

variable "github_repository_url" {
  description = "GitHub repository URL for App Runner"
  type        = string
  default     = "https://github.com/philigidena/passaddis"
}

variable "github_branch" {
  description = "GitHub branch to deploy"
  type        = string
  default     = "main"
}

variable "github_connection_arn" {
  description = "ARN of the AWS App Runner GitHub connection"
  type        = string
  default     = ""
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
  default     = ""
}

variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
  default     = "https://passaddis.vercel.app"
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
