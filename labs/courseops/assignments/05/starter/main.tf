terraform { required_version = ">= 1.10.0, < 2.0.0" }
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Choose dev, staging, or prod."
  }
}
variable "port" {
  type    = number
  default = 80
}
resource "terraform_data" "service" {
  input = { project = "courseops", environment = var.environment, port = var.port }
}
output "service" { value = terraform_data.service.output }
output "id" { value = terraform_data.service.id }
