terraform { required_version = ">= 1.10.0, < 2.0.0" }
variable "message" {
  type    = string
  default = "Production release"
}
resource "terraform_data" "service" {
  input = { environment = "prod", message = var.message }
}
output "service" { value = terraform_data.service.output }
output "id" { value = terraform_data.service.id }
