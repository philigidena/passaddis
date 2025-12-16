# PassAddis Infrastructure Outputs

output "s3_bucket_name" {
  description = "S3 bucket name for file uploads"
  value       = module.s3.bucket_name
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = module.s3.bucket_arn
}

output "database_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.endpoint
}

output "database_url" {
  description = "PostgreSQL connection URL"
  value       = module.rds.database_url
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = var.enable_ecs ? module.ecs[0].cluster_name : null
}

output "api_url" {
  description = "API Load Balancer URL"
  value       = var.enable_ecs ? module.ecs[0].alb_dns_name : null
}

output "apprunner_url" {
  description = "App Runner service URL"
  value       = var.enable_apprunner ? module.apprunner[0].service_url : null
}

output "elasticbeanstalk_url" {
  description = "Elastic Beanstalk environment URL"
  value       = var.enable_elasticbeanstalk ? module.elasticbeanstalk[0].endpoint_url : null
}

output "elasticbeanstalk_environment_name" {
  description = "Elastic Beanstalk environment name"
  value       = var.enable_elasticbeanstalk ? module.elasticbeanstalk[0].environment_name : null
}
