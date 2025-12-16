# PassAddis Development Environment
# Free Tier optimized configuration

aws_region  = "eu-north-1"  # Stockholm - closest to Ethiopia
environment = "dev"

# Database credentials (change these!)
db_username = "passaddis_admin"
# db_password = "your-secure-password-here"  # Set via environment variable or secrets

# Start without ECS (use Supabase + Railway for free tier)
enable_ecs = false

# Make RDS publicly accessible for local development
# WARNING: Set to false in production!
rds_publicly_accessible = true

# When ready to deploy to ECS:
# enable_ecs      = true
# container_image = "123456789.dkr.ecr.eu-north-1.amazonaws.com/passaddis-dev-api:latest"
