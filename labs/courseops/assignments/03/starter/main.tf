terraform { required_version = ">= 1.10.0, < 2.0.0" }
variable "readiness" {
  type    = string
  default = "blocked"
}
resource "terraform_data" "foundation" {
  input = var.readiness
}
resource "terraform_data" "release" {
  input = terraform_data.foundation.output
  lifecycle {
    precondition {
      condition     = terraform_data.foundation.output == "ready"
      error_message = "Foundation exists but is not ready; diagnose before retrying."
    }
  }
}
output "foundation_id" { value = terraform_data.foundation.id }
