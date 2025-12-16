output "endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "address" {
  description = "RDS address (hostname)"
  value       = aws_db_instance.main.address
}

output "port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "database_url" {
  description = "PostgreSQL connection URL"
  value       = "postgresql://${var.db_username}:${urlencode(var.db_password)}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}?schema=public"
  sensitive   = true
}

output "security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}
