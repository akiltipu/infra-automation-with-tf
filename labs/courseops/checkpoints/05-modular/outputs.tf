output "web" {
  description = "Non-secret connection metadata for Ansible."
  value = {
    public_ip   = module.web.host.public_ip
    instance_id = module.web.host.instance_id
    environment = var.environment
    project     = var.name
  }
}
output "network" {
  value = {
    vpc_id        = module.network.vpc_id
    public_cidrs  = module.network.public_cidrs
    private_cidrs = module.network.private_cidrs
  }
}
