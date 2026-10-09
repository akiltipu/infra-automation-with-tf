mock_provider "aws" {
  mock_data "aws_region" { defaults = { name = "us-east-1" } }
}
variables {
  name        = "courseops"
  environment = "test"
  owner       = "class"
}
run "core_has_no_paid_nat" {
  command = plan
  assert {
    condition     = length(aws_nat_gateway.this) == 0
    error_message = "Core labs must not create NAT gateways."
  }
  assert {
    condition     = output.private_cidrs["a"] == "10.42.10.0/24" && output.public_cidrs["b"] == "10.42.1.0/24"
    error_message = "Stable subnet keys must produce the agreed CIDRs."
  }
}
run "reject_overlapping_subnets" {
  command = plan
  variables {
    subnets = {
      a = { az = "us-east-1a", public_netnum = 0, private_netnum = 10 }
      b = { az = "us-east-1b", public_netnum = 0, private_netnum = 11 }
    }
  }
  expect_failures = [var.subnets]
}
run "nat_per_subnet_pair" {
  command = plan
  variables { enable_nat = true }
  assert {
    condition     = length(aws_nat_gateway.this) == 2 && length(aws_route.private_egress) == 2
    error_message = "The extension requires a matching NAT route for each pair."
  }
}
