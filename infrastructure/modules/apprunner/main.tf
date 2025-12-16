# AWS App Runner Module for PassAddis Backend
# Deploys NestJS backend from GitHub

# IAM Role for App Runner to access ECR and other AWS services
resource "aws_iam_role" "apprunner_instance" {
  name = "${var.name_prefix}-apprunner-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.name_prefix}-apprunner-instance-role"
  }
}

# Policy for App Runner instance to access S3 and other services
resource "aws_iam_role_policy" "apprunner_instance" {
  name = "${var.name_prefix}-apprunner-instance-policy"
  role = aws_iam_role.apprunner_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      }
    ]
  })
}

# IAM Role for App Runner to access GitHub (via connection)
resource "aws_iam_role" "apprunner_access" {
  name = "${var.name_prefix}-apprunner-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.name_prefix}-apprunner-access-role"
  }
}

resource "aws_iam_role_policy_attachment" "apprunner_access" {
  role       = aws_iam_role.apprunner_access.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# VPC Connector for App Runner to access RDS in VPC
resource "aws_apprunner_vpc_connector" "main" {
  vpc_connector_name = "${var.name_prefix}-vpc-connector"
  subnets            = var.private_subnet_ids
  security_groups    = [aws_security_group.apprunner.id]

  tags = {
    Name = "${var.name_prefix}-vpc-connector"
  }
}

# Security group for App Runner VPC connector
resource "aws_security_group" "apprunner" {
  name        = "${var.name_prefix}-apprunner-sg"
  description = "Security group for App Runner VPC connector"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-apprunner-sg"
  }
}

# Allow App Runner to connect to RDS
resource "aws_security_group_rule" "rds_from_apprunner" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = var.rds_security_group_id
  source_security_group_id = aws_security_group.apprunner.id
  description              = "PostgreSQL from App Runner"
}

# App Runner Service
resource "aws_apprunner_service" "backend" {
  service_name = "${var.name_prefix}-backend"

  source_configuration {
    auto_deployments_enabled = true

    code_repository {
      repository_url = var.github_repository_url
      source_code_version {
        type  = "BRANCH"
        value = var.github_branch
      }

      code_configuration {
        configuration_source = "API"

        code_configuration_values {
          runtime       = "NODEJS_18"
          build_command = "cd backend && npm install && npm run build && npx prisma generate"
          start_command = "cd backend && npm run start:prod"
          port          = "3000"

          runtime_environment_variables = merge(
            {
              NODE_ENV        = var.environment
              PORT            = "3000"
              DATABASE_URL    = var.database_url
              JWT_SECRET      = var.jwt_secret
              FRONTEND_URL    = var.frontend_url
              AWS_REGION      = var.aws_region
              S3_BUCKET       = var.s3_bucket_name
            },
            var.extra_environment_variables
          )
        }
      }
    }

    authentication_configuration {
      connection_arn = var.github_connection_arn
    }
  }

  instance_configuration {
    cpu               = var.cpu
    memory            = var.memory
    instance_role_arn = aws_iam_role.apprunner_instance.arn
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.main.arn
    }
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.backend.arn

  tags = {
    Name = "${var.name_prefix}-backend"
  }
}

# Auto-scaling configuration - cost optimized
resource "aws_apprunner_auto_scaling_configuration_version" "backend" {
  auto_scaling_configuration_name = "${var.name_prefix}-backend-scaling"

  max_concurrency = 100
  max_size        = var.max_instances
  min_size        = var.min_instances

  tags = {
    Name = "${var.name_prefix}-backend-scaling"
  }
}
