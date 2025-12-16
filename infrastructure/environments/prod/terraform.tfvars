# PassAddis Production Environment

aws_region  = "eu-north-1"
environment = "prod"

# Database credentials (use AWS Secrets Manager in production)
db_username = "passaddis_admin"
# db_password = ""  # Set via TF_VAR_db_password environment variable

# Enable ECS for production
enable_ecs = true
# container_image = "123456789.dkr.ecr.eu-north-1.amazonaws.com/passaddis-prod-api:latest"
