variable "name" {
  type = string
}
variable "environment" {
  type = string
}
variable "owner" {
  type = string
}
variable "vpc_cidr" {
  type    = string
  default = "10.42.0.0/16"
  validation {
    condition     = can(cidrnetmask(var.vpc_cidr)) && can(regex("/16$", var.vpc_cidr))
    error_message = "This teaching module requires an IPv4 /16."
  }
}
variable "subnets" {
  description = "Stable keys with non-overlapping /24 subnet numbers (0..255)."
  type = map(object({
    az             = string
    public_netnum  = number
    private_netnum = number
  }))
  default = {
    a = { az = "us-east-1a", public_netnum = 0, private_netnum = 10 }
    b = { az = "us-east-1b", public_netnum = 1, private_netnum = 11 }
  }
  validation {
    condition = length(var.subnets) >= 2 && length(distinct(flatten([
      for s in values(var.subnets) : [s.public_netnum, s.private_netnum]
      ]))) == 2 * length(var.subnets) && alltrue(flatten([
      for s in values(var.subnets) : [
        s.public_netnum >= 0 && s.public_netnum <= 255 && floor(s.public_netnum) == s.public_netnum,
        s.private_netnum >= 0 && s.private_netnum <= 255 && floor(s.private_netnum) == s.private_netnum
      ]
    ]))
    error_message = "Use at least two subnet pairs with unique integer network numbers from 0 to 255."
  }
}
variable "enable_nat" {
  type        = bool
  default     = false
  description = "Optional extension: one billable NAT gateway and EIP per subnet pair."
}
variable "enable_s3_endpoint" {
  type        = bool
  default     = false
  description = "Optional S3 gateway endpoint for the private route tables."
}
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
variable "region" { default = "us-east-1" }
variable "expected_account_id" {
  type = string
  validation {
    condition     = can(regex("^[0-9]{12}$", var.expected_account_id))
    error_message = "Provide the 12-digit sandbox account ID."
  }
}
variable "web_subnet_key" { default = "a" }
