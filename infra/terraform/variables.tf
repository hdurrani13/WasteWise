variable "region" {
  description = "AWS region for the API server and site bucket"
  type        = string
  default     = "ca-central-1"
}

variable "repo_url" {
  description = "Public Git URL the EC2 host clones to build the API"
  type        = string
}

variable "github_repo" {
  description = "owner/name of the GitHub repo allowed to deploy via OIDC (e.g. hdurrani13/wastewise)"
  type        = string
}

variable "instance_type" {
  description = "EC2 size for the API + Postgres host"
  type        = string
  default     = "t3.micro"
}

variable "budget_email" {
  description = "Email that receives a warning if monthly spend passes the budget"
  type        = string
}

variable "monthly_budget_usd" {
  type    = number
  default = 10
}
