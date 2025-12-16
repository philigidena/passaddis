# AWS Elastic Beanstalk Module for PassAddis Backend
# Uses t3.micro for FREE TIER eligibility

# IAM Role for EC2 instances
resource "aws_iam_role" "eb_ec2_role" {
  name = "${var.name_prefix}-eb-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.name_prefix}-eb-ec2-role"
  }
}

# Attach required policies to EC2 role
resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "eb_worker_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

resource "aws_iam_role_policy_attachment" "eb_multicontainer_docker" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

# S3 access policy for the EC2 instances
resource "aws_iam_role_policy" "eb_s3_access" {
  name = "${var.name_prefix}-eb-s3-access"
  role = aws_iam_role.eb_ec2_role.id

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

# Instance profile for EC2
resource "aws_iam_instance_profile" "eb_ec2_profile" {
  name = "${var.name_prefix}-eb-ec2-profile"
  role = aws_iam_role.eb_ec2_role.name
}

# IAM Service Role for Elastic Beanstalk
resource "aws_iam_role" "eb_service_role" {
  name = "${var.name_prefix}-eb-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "elasticbeanstalk.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.name_prefix}-eb-service-role"
  }
}

resource "aws_iam_role_policy_attachment" "eb_enhanced_health" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "eb_managed_updates" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
}

# Security group for Elastic Beanstalk instances
resource "aws_security_group" "eb_sg" {
  name        = "${var.name_prefix}-eb-sg"
  description = "Security group for Elastic Beanstalk instances"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-eb-sg"
  }
}

# Allow EB instances to connect to RDS
resource "aws_security_group_rule" "rds_from_eb" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = var.rds_security_group_id
  source_security_group_id = aws_security_group.eb_sg.id
  description              = "PostgreSQL from Elastic Beanstalk"
}

# Elastic Beanstalk Application
resource "aws_elastic_beanstalk_application" "backend" {
  name        = "${var.name_prefix}-backend"
  description = "PassAddis Backend API"

  appversion_lifecycle {
    service_role          = aws_iam_role.eb_service_role.arn
    max_count             = 5
    delete_source_from_s3 = true
  }

  tags = {
    Name = "${var.name_prefix}-backend"
  }
}

# Elastic Beanstalk Environment
resource "aws_elastic_beanstalk_environment" "backend" {
  name                = "${var.name_prefix}-backend-env"
  application         = aws_elastic_beanstalk_application.backend.name
  solution_stack_name = "64bit Amazon Linux 2023 v6.7.0 running Node.js 20"

  # Instance settings - FREE TIER
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_ec2_profile.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.eb_sg.id
  }

  # VPC settings
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.public_subnet_ids)
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "true"
  }

  # Auto-scaling settings (single instance for free tier)
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = "1"
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = "1"
  }

  # Environment type - Single instance (no load balancer = cheaper)
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_role.eb_service_role.arn
  }

  # Application environment variables
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.environment
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "8080"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DATABASE_URL"
    value     = var.database_url
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "JWT_SECRET"
    value     = var.jwt_secret
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "FRONTEND_URL"
    value     = var.frontend_url
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "S3_BUCKET"
    value     = var.s3_bucket_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_REGION"
    value     = var.aws_region
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "CHAPA_SECRET_KEY"
    value     = var.chapa_secret_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "CHAPA_WEBHOOK_SECRET"
    value     = var.chapa_webhook_secret
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AFRO_SMS_API_KEY"
    value     = var.afro_sms_api_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AFRO_SMS_IDENTIFIER"
    value     = var.afro_sms_identifier
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AFRO_SMS_SENDER"
    value     = var.afro_sms_sender
  }

  # Health check
  setting {
    namespace = "aws:elasticbeanstalk:application"
    name      = "Application Healthcheck URL"
    value     = "/api/health"
  }

  # CloudWatch logs
  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "StreamLogs"
    value     = "true"
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "RetentionInDays"
    value     = "7"
  }

  tags = {
    Name = "${var.name_prefix}-backend-env"
  }
}
