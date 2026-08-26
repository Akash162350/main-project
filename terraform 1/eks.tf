resource "aws_eks_cluster" "main" {
  name = "${var.project_name}-eks"
  role_arn = aws_iam_role.eks_cluster.arn
  version = var.cluster_version

  access_config {
    authentication_mode = "API_AND_CONFIG_MAP"
    bootstrap_cluster_creator_admin_permissions = true
  }

  vpc_config {
    subnet_ids = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access = true
    public_access_cidrs = [var.admin_ip_cidr]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]

  tags = {
    Name = "${var.project_name}-eks"
    Environment = var.environment
  }
}

resource "aws_eks_node_group" "general" {
  cluster_name = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-general"
  node_role_arn = aws_iam_role.eks_nodes.arn
  subnet_ids = aws_subnet.private[*].id
  instance_types = [var.node_instance_type]
  capacity_type = "ON_DEMAND"

  scaling_config {
    min_size = var.node_min_size
    max_size = var.node_max_size
    desired_size = var.node_desired_size
  }

  disk_size = 30
  ami_type = "AL2023_x86_64_STANDARD"

  update_config {
    max_unavailable = 1
  }

  labels = {
    role = "general"
  }

  tags = {
    Name = "${var.project_name}-worker"
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node,
    aws_iam_role_policy_attachment.eks_cni,
    aws_iam_role_policy_attachment.ecr_readonly
  ]
}

resource "aws_eks_access_entry" "jenkins" {
  cluster_name = aws_eks_cluster.main.name
  principal_arn = aws_iam_role.jenkins.arn
  type = "STANDARD"

  depends_on = [aws_eks_cluster.main]
}

resource "aws_eks_access_policy_association" "jenkins" {
  cluster_name = aws_eks_cluster.main.name
  principal_arn = aws_iam_role.jenkins.arn
  policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSEditPolicy"

  access_scope {
    type = "cluster"
  }

  depends_on = [aws_eks_access_entry.jenkins]
}
