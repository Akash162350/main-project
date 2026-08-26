#!/bin/bash
set -euxo pipefail

exec > >(tee /var/log/jenkins-install.log) 2>&1

dnf update -y

dnf install -y \
  java-21-amazon-corretto git wget curl unzip jq docker fontconfig python3 tar awscli

systemctl enable docker
systemctl start docker

# FIX: correct Jenkins RPM repo path (was "rpm-stable", which does not exist
# and caused wget to fail with a 404, halting the rest of this script under
# set -e).
wget -O /etc/yum.repos.d/jenkins.repo \
  https://pkg.jenkins.io/redhat-stable/jenkins.repo

rpm --import \
  https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

dnf upgrade -y
dnf install -y jenkins

systemctl daemon-reload
usermod -aG docker jenkins

systemctl restart docker
systemctl enable jenkins
systemctl start jenkins

KUBECTL_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt)

curl -LO \
  "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"

install -m 0755 kubectl /usr/local/bin/kubectl
rm -f kubectl

curl -fsSL \
  https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 \
  | bash

cat > /etc/sysctl.d/99-sonarqube.conf <<EOF
vm.max_map_count=524288
fs.file-max=131072
EOF

sysctl --system

docker volume create sonarqube_data
docker volume create sonarqube_logs
docker volume create sonarqube_extensions

docker rm -f sonarqube 2>/dev/null || true

docker run -d \
  --name sonarqube \
  --restart unless-stopped \
  -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_logs:/opt/sonarqube/logs \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  sonarqube:lts-community

sleep 30
systemctl status jenkins --no-pager || true
systemctl status docker --no-pager || true
cat /var/lib/jenkins/secrets/initialAdminPassword || true