mock_provider "aws" {}
variables {
  name           = "courseops"
  environment    = "test"
  owner          = "class"
  vpc_id         = "vpc-0123456789abcdef0"
  subnet_id      = "subnet-0123456789abcdef0"
  ami_id         = "ami-0123456789abcdef0"
  operator_cidr  = "203.0.113.10/32"
  ssh_public_key = "ssh-ed25519 test-public-key"
}
run "sandbox_controls" {
  command = plan
  assert {
    condition     = aws_instance.web.metadata_options[0].http_tokens == "required" && aws_instance.web.root_block_device[0].encrypted
    error_message = "Require IMDSv2 and encrypted root storage."
  }
  assert {
    condition     = alltrue([for rule in aws_security_group.web.ingress : toset(rule.cidr_blocks) == toset([var.operator_cidr])])
    error_message = "Ingress must remain scoped to the operator."
  }
}
run "reject_open_ingress" {
  command = plan
  variables { operator_cidr = "0.0.0.0/0" }
  expect_failures = [var.operator_cidr]
}
