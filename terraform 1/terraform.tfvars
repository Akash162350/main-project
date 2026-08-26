aws_region         = "us-east-1"
project_name       = "aws-devops"
environment        = "dev"
vpc_cidr           = "10.0.0.0/16"
cluster_version    = "1.36"
node_instance_type = "t3.medium"
node_min_size      = 3
node_max_size      = 4
node_desired_size  = 3
jenkins_instance_type = "t3.large"


admin_ip_cidr = "106.51.203.152/32"

db_name               = "appdb"
db_username           = "dbadmin"
db_engine_version     = "8.0"
db_instance_class     = "db.t3.micro"
db_allocated_storage  = 20

