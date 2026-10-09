terraform { required_version = ">= 1.10.0, < 2.0.0" }
variable "services" {
  type    = set(string)
  default = ["status", "billing", "search"]
}
resource "terraform_data" "service" {
  for_each         = var.services
  input            = each.key
  triggers_replace = each.key
}
output "ids" { value = { for s in terraform_data.service : s.input => s.id } }
moved {
  from = terraform_data.service[0]
  to   = terraform_data.service["status"]
}
moved {
  from = terraform_data.service[1]
  to   = terraform_data.service["billing"]
}
moved {
  from = terraform_data.service[2]
  to   = terraform_data.service["search"]
}
