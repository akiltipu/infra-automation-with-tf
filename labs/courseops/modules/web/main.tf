resource "aws_security_group" "web" {
  name_prefix = "${var.name}-${var.environment}-"
  description = "CourseOps sandbox access from one operator"
  vpc_id      = var.vpc_id
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
  subnet_id                   = var.subnet_id
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
