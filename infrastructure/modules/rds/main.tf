# RDS PostgreSQL Module for PassAddis
# Uses db.t3.micro for FREE TIER eligibility

# Security group for RDS
resource "aws_security_group" "rds" {
  name        = "${var.name_prefix}-rds-sg"
  description = "Security group for PassAddis RDS"
  vpc_id      = var.vpc_id

  ingress {
    description = "PostgreSQL from VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # Allow public access for development (when publicly_accessible = true)
  dynamic "ingress" {
    for_each = var.publicly_accessible ? [1] : []
    content {
      description = "PostgreSQL from anywhere (DEV ONLY)"
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-rds-sg"
  }
}

# DB Subnet Group for private access
resource "aws_db_subnet_group" "private" {
  count      = var.publicly_accessible ? 0 : 1
  name       = "${var.name_prefix}-db-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.name_prefix}-db-subnet"
  }
}

# DB Subnet Group for public access (development only)
resource "aws_db_subnet_group" "public" {
  count      = var.publicly_accessible ? 1 : 0
  name       = "${var.name_prefix}-db-subnet-public"
  subnet_ids = var.public_subnet_ids

  tags = {
    Name = "${var.name_prefix}-db-subnet-public"
  }
}

# RDS PostgreSQL Instance - FREE TIER
resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-postgres"

  # FREE TIER: db.t3.micro with 20GB storage
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = var.instance_class
  allocated_storage    = 20
  max_allocated_storage = var.environment == "prod" ? 100 : 20  # Auto-scaling only in prod

  # Database settings
  db_name  = "passaddis"
  username = var.db_username
  password = var.db_password
  port     = 5432

  # Network
  db_subnet_group_name   = var.publicly_accessible ? aws_db_subnet_group.public[0].name : aws_db_subnet_group.private[0].name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = var.publicly_accessible

  # Storage
  storage_type          = "gp2"
  storage_encrypted     = true

  # Backup (free tier has limitations)
  backup_retention_period = var.environment == "prod" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # Performance insights (free for db.t3.micro)
  performance_insights_enabled = true
  performance_insights_retention_period = 7

  # Other settings
  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.name_prefix}-final-snapshot" : null
  deletion_protection       = var.environment == "prod"
  auto_minor_version_upgrade = true

  # Enable CloudWatch logs
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "${var.name_prefix}-postgres"
  }
}

# Parameter group for PostgreSQL optimization
resource "aws_db_parameter_group" "main" {
  name   = "${var.name_prefix}-pg-params"
  family = "postgres15"

  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"  # Log queries taking > 1 second
  }

  tags = {
    Name = "${var.name_prefix}-pg-params"
  }
}
