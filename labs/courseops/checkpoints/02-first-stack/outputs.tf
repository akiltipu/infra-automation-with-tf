output "web" {
  description = "Non-secret connection metadata for Ansible."
  value = {
    public_ip   = aws_instance.web.public_ip
    instance_id = aws_instance.web.id
    environment = var.environment
    project     = var.name
  }
}
output "network" {
  value = {
    vpc_id        = aws_vpc.this.id
    public_cidrs  = { for k, s in aws_subnet.public : k => s.cidr_block }
    private_cidrs = { for k, s in aws_subnet.private : k => s.cidr_block }
  }
}
