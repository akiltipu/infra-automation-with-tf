output "host" { value = { instance_id = aws_instance.web.id, public_ip = aws_instance.web.public_ip } }
