terraform { required_version = ">= 1.10.0, < 2.0.0" }
module "service" {
  source      = "../../modules/service"
  environment = "dev"
}
output "service" { value = module.service.service }
output "id" { value = module.service.id }
