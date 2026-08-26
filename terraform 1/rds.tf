# -----------------------------------------------------------------------
# RDS (MySQL) — private, no public endpoint. You reach it by starting an
# SSM port-forward session through the Jenkins instance (which already has
# AmazonSSMManagedInstanceCore + network access to this DB's SG), e.g.:
#
#   aws ssm start-session \
#     --target <jenkins-instance-id> \
#     --document-name AWS-StartPortForwardingToRemoteHost \
#     --parameters '{"host":["<rds-endpoint>"],"portNumber":["3306"],"localPortNumber":["3306"]}'
#
# then connect your local mysql client to 127.0.0.1:3306. No inbound
# security group rule to the internet is ever opened for the database.
# -----------------------------------------------------------------------

resource "aws_db_subnet_group" "mysql" {
  name       = "${var.project_name}-mysql-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "${var.project_name}-mysql-subnet-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow MySQL only from the Jenkins instance"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL from Jenkins (used for SSM port-forwarding tunnel)"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.jenkins.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_db_instance" "mysql" {
  identifier     = "${var.project_name}-mysql"
  engine         = "mysql"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  max_allocated_storage = var.db_allocated_storage * 4

  db_name  = var.db_name
  username = var.db_username

  # AWS creates and rotates the master password in Secrets Manager for you —
  # no password ever lives in state or in these files.
  manage_master_user_password = true

  # Lets Jenkins (or anyone with the rds-db:connect IAM permission above)
  # authenticate with a short-lived IAM token instead of the master password.
  iam_database_authentication_enabled = true

  db_subnet_group_name   = aws_db_subnet_group.mysql.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = false

  backup_retention_period = 7
  skip_final_snapshot     = true
  deletion_protection     = false

  tags = {
    Name        = "${var.project_name}-mysql"
    Environment = var.environment
  }
}

# Reads the actual password AWS generated for the master user, so it can be
# surfaced via `terraform output`. Whoever runs `terraform apply`/`terraform
# output` needs secretsmanager:GetSecretValue on this secret in their own
# IAM identity (separate from the Jenkins role's scoped permission).
data "aws_secretsmanager_secret_version" "mysql_master" {
  secret_id = aws_db_instance.mysql.master_user_secret[0].secret_arn
}

locals {
  db_master_password = jsondecode(data.aws_secretsmanager_secret_version.mysql_master.secret_string)["password"]
}
