variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["http://localhost:8081", "http://localhost:19006", "https://passaddis.vercel.app"]
}

variable "enable_cloudfront" {
  description = "Enable CloudFront CDN for S3"
  type        = bool
  default     = false  # Disable by default to save costs
}
