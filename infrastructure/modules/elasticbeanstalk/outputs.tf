# Elastic Beanstalk Module Outputs

output "application_name" {
  description = "Elastic Beanstalk application name"
  value       = aws_elastic_beanstalk_application.backend.name
}

output "environment_name" {
  description = "Elastic Beanstalk environment name"
  value       = aws_elastic_beanstalk_environment.backend.name
}

output "environment_id" {
  description = "Elastic Beanstalk environment ID"
  value       = aws_elastic_beanstalk_environment.backend.id
}

output "endpoint_url" {
  description = "Elastic Beanstalk environment URL"
  value       = "http://${aws_elastic_beanstalk_environment.backend.cname}"
}

output "cname" {
  description = "Elastic Beanstalk environment CNAME"
  value       = aws_elastic_beanstalk_environment.backend.cname
}
