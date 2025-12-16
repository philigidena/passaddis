variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for RDS"
  type        = list(string)
}

variable "db_username" {
  description = "Database master username"
  type        = string
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"  # FREE TIER eligible
}

variable "publicly_accessible" {
  description = "Make RDS publicly accessible (for development only)"
  type        = bool
  default     = false
}

variable "public_subnet_ids" {
  description = "Public subnet IDs (required if publicly_accessible is true)"
  type        = list(string)
  default     = []
}
