output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  value = var.aws_region
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnets" {
  value = aws_subnet.public[*].id
}

output "private_subnets" {
  value = aws_subnet.private[*].id
}

output "eks_cluster_name" {
  value = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  value = aws_eks_cluster.main.endpoint
}

output "ecr_backend_repository" {
  value = aws_ecr_repository.backend.repository_url
}

output "jenkins_public_ip" {
  value = aws_instance.jenkins.public_ip
}

output "jenkins_url" {
  value = "http://${aws_instance.jenkins.public_ip}:8080"
}

output "sonarqube_url" {
  value = "http://${aws_instance.jenkins.public_ip}:9000"
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint (only reachable from inside the VPC, e.g. via an SSM tunnel through Jenkins)"
  value       = aws_db_instance.mysql.endpoint
}

output "rds_master_secret_arn" {
  description = "Secrets Manager ARN holding the RDS master credentials"
  value       = aws_db_instance.mysql.master_user_secret[0].secret_arn
}

output "ssm_port_forward_command" {
  description = "Run this locally (after `aws configure`) to tunnel to the DB through Jenkins"
  value       = "aws ssm start-session --target ${aws_instance.jenkins.id} --document-name AWS-StartPortForwardingToRemoteHost --parameters '{\"host\":[\"${aws_db_instance.mysql.address}\"],\"portNumber\":[\"3306\"],\"localPortNumber\":[\"3306\"]}'"
}

output "db_username" {
  value = var.db_username
}

output "db_password" {
  value     = local.db_master_password
  sensitive = true
}