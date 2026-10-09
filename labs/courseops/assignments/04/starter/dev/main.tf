terraform { required_version = ">= 1.10.0, < 2.0.0" }
variable "message" {
  type    = string
  default = "Development release"
}
resource "terraform_data" "service" {
  input = { environment = "dev", message = var.message }
}
output "service" { value = terraform_data.service.output }
output "id" { value = terraform_data.service.id }
