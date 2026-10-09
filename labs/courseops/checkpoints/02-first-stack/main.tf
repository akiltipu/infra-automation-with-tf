locals {
  tags = { Project = var.name, Environment = var.environment, Owner = var.owner, ManagedBy = "Terraform" }
}
resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = merge(local.tags, { Name = "${var.name}-${var.environment}" })
}
resource "aws_subnet" "public" {
  for_each                = var.subnets
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, each.value.public_netnum)
  availability_zone       = each.value.az
  map_public_ip_on_launch = false
  tags                    = merge(local.tags, { Name = "${var.name}-public-${each.key}" })
}
resource "aws_subnet" "private" {
  for_each          = var.subnets
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, each.value.private_netnum)
  availability_zone = each.value.az
  tags              = merge(local.tags, { Name = "${var.name}-private-${each.key}" })
}
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = local.tags
}
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }
  tags = local.tags
}
resource "aws_route_table_association" "public" {
  for_each       = var.subnets
  subnet_id      = aws_subnet.public[each.key].id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table" "private" {
  for_each = var.subnets
  vpc_id   = aws_vpc.this.id
  tags     = local.tags
}
resource "aws_route_table_association" "private" {
  for_each       = var.subnets
  subnet_id      = aws_subnet.private[each.key].id
  route_table_id = aws_route_table.private[each.key].id
}
resource "aws_eip" "nat" {
  for_each = var.enable_nat ? var.subnets : {}
  domain   = "vpc"
  tags     = local.tags
}
resource "aws_nat_gateway" "this" {
  for_each      = var.enable_nat ? var.subnets : {}
  allocation_id = aws_eip.nat[each.key].id
  subnet_id     = aws_subnet.public[each.key].id
  tags          = local.tags
  depends_on    = [aws_internet_gateway.this]
}
resource "aws_route" "private_egress" {
  for_each               = var.enable_nat ? var.subnets : {}
  route_table_id         = aws_route_table.private[each.key].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[each.key].id
}
data "aws_region" "current" {}
resource "aws_vpc_endpoint" "s3" {
  count             = var.enable_s3_endpoint ? 1 : 0
  vpc_id            = aws_vpc.this.id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [for rt in aws_route_table.private : rt.id]
  tags              = local.tags
}
resource "aws_security_group" "web" {
  name_prefix = "${var.name}-${var.environment}-"
  description = "CourseOps sandbox access from one operator"
  vpc_id      = aws_vpc.this.id
  ingress {
    description = "Operator SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.operator_cidr]
  }
  ingress {
    description = "Operator HTTP verification"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.operator_cidr]
  }
  egress {
    description = "Package repositories for the sandbox"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Project = var.name, Environment = var.environment, Owner = var.owner }
}
resource "aws_key_pair" "operator" {
  key_name_prefix = "${var.name}-${var.environment}-"
  public_key      = var.ssh_public_key
  tags            = { Project = var.name, Environment = var.environment, Owner = var.owner }
}
resource "aws_instance" "web" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public[var.web_subnet_key].id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.web.id]
  key_name                    = aws_key_pair.operator.key_name
  metadata_options { http_tokens = "required" }
  root_block_device {
    encrypted   = true
    volume_type = "gp3"
    volume_size = 8
  }
  tags = { Name = "${var.name}-${var.environment}", Project = var.name, Environment = var.environment, Owner = var.owner }
}
