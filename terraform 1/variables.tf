variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "aws-devops"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "cluster_version" {
  type    = string
  default = "1.36"
}

variable "node_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "node_min_size" {
  type    = number
  default = 2
}

variable "node_max_size" {
  type    = number
  default = 4
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "jenkins_instance_type" {
  type    = string
  default = "t3.large"
}

variable "admin_ip_cidr" {
  description = "Your public IP in CIDR notation"
  type        = string
}

variable "db_name" {
  description = "Initial MySQL database name"
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "MySQL master username"
  type        = string
  default     = "dbadmin"
}

variable "db_engine_version" {
  description = "MySQL engine version"
  type        = string
  default     = "8.0"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage for RDS, in GB"
  type        = number
  default     = 20
}
