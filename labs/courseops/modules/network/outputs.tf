output "vpc_id" { value = aws_vpc.this.id }
output "public_subnet_ids" { value = { for k, s in aws_subnet.public : k => s.id } }
output "private_subnet_ids" { value = { for k, s in aws_subnet.private : k => s.id } }
output "public_cidrs" { value = { for k, s in aws_subnet.public : k => s.cidr_block } }
output "private_cidrs" { value = { for k, s in aws_subnet.private : k => s.cidr_block } }
