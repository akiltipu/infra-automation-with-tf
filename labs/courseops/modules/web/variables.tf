variable "name" { type = string }
variable "environment" { type = string }
variable "owner" { type = string }
variable "vpc_id" { type = string }
variable "subnet_id" { type = string }
variable "ami_id" {
  type        = string
  description = "Reviewed Ubuntu x86_64 AMI in the selected region; no moving latest query."
  validation {
    condition     = can(regex("^ami-[0-9a-f]+$", var.ami_id))
    error_message = "Supply the reviewed AMI ID for this region."
  }
}
variable "operator_cidr" {
  type = string
  validation {
    condition     = can(cidrnetmask(var.operator_cidr)) && can(regex("/32$", var.operator_cidr))
    error_message = "Use the operator's public IPv4 address with /32."
  }
}
variable "ssh_public_key" {
  type        = string
  description = "Public key only; the private key never enters Terraform."
}
variable "instance_type" {
  type    = string
  default = "t3.micro"
}
