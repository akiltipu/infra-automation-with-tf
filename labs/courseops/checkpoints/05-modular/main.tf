module "network" {
  source             = "../../modules/network"
  name               = var.name
  environment        = var.environment
  owner              = var.owner
  vpc_cidr           = var.vpc_cidr
  subnets            = var.subnets
  enable_nat         = var.enable_nat
  enable_s3_endpoint = var.enable_s3_endpoint
}
module "web" {
  source         = "../../modules/web"
  name           = var.name
  environment    = var.environment
  owner          = var.owner
  vpc_id         = module.network.vpc_id
  subnet_id      = module.network.public_subnet_ids[var.web_subnet_key]
  ami_id         = var.ami_id
  instance_type  = var.instance_type
  ssh_public_key = var.ssh_public_key
  operator_cidr  = var.operator_cidr
}
