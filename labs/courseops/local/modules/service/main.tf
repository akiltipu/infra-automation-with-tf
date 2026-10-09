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
  validation {
    condition     = var.port >= 1 && var.port <= 65535 && floor(var.port) == var.port
    error_message = "Use an integer port from 1 to 65535."
  }
}
resource "terraform_data" "service" {
  input = { project = "courseops", environment = var.environment, port = var.port }
}
output "service" { value = terraform_data.service.output }
output "id" { value = terraform_data.service.id }
