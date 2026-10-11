terraform { required_version = ">= 1.10.0, < 2.0.0" }
variable "services" {
  type    = list(string)
  default = ["status", "billing", "search"]
}
resource "terraform_data" "service" {
  count            = length(var.services)
  input            = var.services[count.index]
  triggers_replace = var.services[count.index]
}
output "ids" { value = { for s in terraform_data.service : s.input => s.id } }
