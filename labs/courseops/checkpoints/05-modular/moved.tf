moved {
  from = aws_vpc.this
  to   = module.network.aws_vpc.this
}
moved {
  from = aws_subnet.public
  to   = module.network.aws_subnet.public
}
moved {
  from = aws_subnet.private
  to   = module.network.aws_subnet.private
}
moved {
  from = aws_internet_gateway.this
  to   = module.network.aws_internet_gateway.this
}
moved {
  from = aws_route_table.public
  to   = module.network.aws_route_table.public
}
moved {
  from = aws_route_table.private
  to   = module.network.aws_route_table.private
}
moved {
  from = aws_route_table_association.public
  to   = module.network.aws_route_table_association.public
}
moved {
  from = aws_route_table_association.private
  to   = module.network.aws_route_table_association.private
}
moved {
  from = aws_eip.nat
  to   = module.network.aws_eip.nat
}
moved {
  from = aws_nat_gateway.this
  to   = module.network.aws_nat_gateway.this
}
moved {
  from = aws_route.private_egress
  to   = module.network.aws_route.private_egress
}
moved {
  from = aws_vpc_endpoint.s3
  to   = module.network.aws_vpc_endpoint.s3
}
moved {
  from = aws_security_group.web
  to   = module.web.aws_security_group.web
}
moved {
  from = aws_key_pair.operator
  to   = module.web.aws_key_pair.operator
}
moved {
  from = aws_instance.web
  to   = module.web.aws_instance.web
}
