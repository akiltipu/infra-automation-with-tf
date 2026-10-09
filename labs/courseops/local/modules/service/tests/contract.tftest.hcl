run "valid_environment" {
  command = apply
  variables { environment = "dev" }
  assert {
    condition     = output.service.project == "courseops" && output.service.port == 80
    error_message = "The default service contract changed."
  }
}
run "reject_environment" {
  command = plan
  variables { environment = "production" }
  expect_failures = [var.environment]
}
run "reject_port" {
  command = plan
  variables {
    environment = "dev"
    port        = 65536
  }
  expect_failures = [var.port]
}
