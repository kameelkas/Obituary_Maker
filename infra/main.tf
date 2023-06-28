terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}

# two lambda functions w/ function url
# one dynamodb table
# roles and policies as needed
# step functions (if you're going for the bonus marks)

resource "aws_dynamodb_table" "obituaries-30141921" {
  name         = "obituaries-30141921"
  billing_mode = "PROVISIONED"

  read_capacity = 1

  write_capacity = 1

  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }
}



# this IAM role for all 6 lambda functions
resource "aws_iam_role" "IAM-all" {
  name               = "IAM-all"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    },
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "states.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }

  ]
}
EOF
}



# IAM policy for all 6 lambda functions
resource "aws_iam_policy" "policy-all" {
  name        = "policy-all"
  description = "IAM policy for all lambda functions"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
          "dynamodb:*",
          "states:StartExecution",
          "states:DescribeExecution",
          "lambda:*",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "s3:*",
          "ssm:GetParameters",
          "polly:SynthesizeSpeech"
      ],
      "Resource": [
        "*"
        ],
      "Effect": "Allow"
    }
  ]
}
EOF
}



# role - policy attachment for all 6 lambda functions
resource "aws_iam_role_policy_attachment" "role-policy-att-all" {
  role       = aws_iam_role.IAM-all.name
  policy_arn = aws_iam_policy.policy-all.arn
}




# archive file from main.py file for all 6 lambda functions
data "archive_file" "archive-create-obituary" {
  type        = "zip"
  source_dir = "../functions/create-obituary"
  output_path = "../functions/create-obituary/artifact.zip"
}

data "archive_file" "archive-generate-obituary" {
  type        = "zip"
  source_dir = "../functions/generate-obituary"
  output_path = "../functions/generate-obituary/artifact.zip"
}

data "archive_file" "archive-read-obituary" {
  type        = "zip"
  source_dir = "../functions/read-obituary"
  output_path = "../functions/read-obituary/artifact.zip"
}

data "archive_file" "archive-save-item" {
  type        = "zip"
  source_dir = "../functions/save-item"
  output_path = "../functions/save-item/artifact.zip"
}

data "archive_file" "archive-store-files" {
  type        = "zip"
  source_dir = "../functions/store-files"
  output_path = "../functions/store-files/artifact.zip"
}

data "archive_file" "archive-get-obituaries" {
  type        = "zip"
  source_dir = "../functions/get-obituaries"
  output_path = "../functions/get-obituaries/artifact.zip"
}






#lambda function creation for create-obituary orchestrator
resource "aws_lambda_function" "lambda-function-create-obituary" {
  role             = aws_iam_role.IAM-all.arn
  function_name    = "create-obituary-30141541"
  handler          = "main.create_obituary_handler"
  filename         = "../functions/create-obituary/artifact.zip"
  source_code_hash = data.archive_file.archive-create-obituary.output_base64sha256
  runtime          = "python3.9"
  timeout = 20
}

resource "aws_lambda_function_url" "create-obituary-url" {
  function_name      = aws_lambda_function.lambda-function-create-obituary.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

output "lambda_url_create_obituary" {
  value = aws_lambda_function_url.create-obituary-url.function_url
}




#lambda function creation for get-obituaries
resource "aws_lambda_function" "lambda-function-get-obituaries" {
  role             = aws_iam_role.IAM-all.arn
  function_name    = "get-obituaries-30141541"
  handler          = "main.get_obituaries_handler"
  filename         = "../functions/get-obituaries/artifact.zip"
  source_code_hash = data.archive_file.archive-get-obituaries.output_base64sha256
  runtime          = "python3.9"
}

resource "aws_lambda_function_url" "get-obituaries-url" {
  function_name      = aws_lambda_function.lambda-function-get-obituaries.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

output "lambda_url_get_obituaries" {
  value = aws_lambda_function_url.get-obituaries-url.function_url
}





# 4 lambda functions that will be orchestrated by create-obituary
resource "aws_lambda_function" "lambda1-generate-obituary" {
  role             = aws_iam_role.IAM-all.arn
  function_name    = "generate-obituary-30141541"
  handler          = "generate-obituary-main.generate_obituary_handler"
  filename         = "../functions/generate-obituary/artifact.zip"
  source_code_hash = data.archive_file.archive-generate-obituary.output_base64sha256
  runtime          = "python3.9"
  timeout = 20
}

resource "aws_lambda_function" "lambda2-read-obituary" {
  role             = aws_iam_role.IAM-all.arn
  function_name    = "read-obituary-30141541"
  handler          = "read-obituary-main.read_obituary_handler"
  filename         = "../functions/read-obituary/artifact.zip"
  source_code_hash = data.archive_file.archive-read-obituary.output_base64sha256
  runtime          = "python3.9"
}

resource "aws_lambda_function" "lambda3-store-files" {
  role             = aws_iam_role.IAM-all.arn
  function_name    = "store-files-30141541"
  handler          = "store-files-main.store_files_handler"
  filename         = "../functions/store-files/artifact.zip"
  source_code_hash = data.archive_file.archive-store-files.output_base64sha256
  runtime          = "python3.9"
  timeout = 20
}

resource "aws_lambda_function" "lambda4-save-item" {
  role             = aws_iam_role.IAM-all.arn
  function_name    = "save-item-30141541"
  handler          = "save-item-main.save_item_handler"
  filename         = "../functions/save-item/artifact.zip"
  source_code_hash = data.archive_file.archive-save-item.output_base64sha256
  runtime          = "python3.9"
}


# Step function creation
### Would I need to start at the create-obituary function since that's what has the info from the front end?
### -> i think so
resource "aws_sfn_state_machine" "step-function" {
  name     = "step-function"
  role_arn = aws_iam_role.IAM-all.arn

  definition = <<DEFINITION
  {
    "StartAt": "generate-obituary",
    "States": {
      "generate-obituary": {
        "Type": "Task",
        "Resource": "${aws_lambda_function.lambda1-generate-obituary.arn}",
        "InputPath": "$.input",
        "ResultPath": "$.resultsDict",
        "Next": "read-obituary"
      },
      "read-obituary": {
        "Type": "Task",
        "Resource": "${aws_lambda_function.lambda2-read-obituary.arn}",
        "InputPath": "$.resultsDict",
        "ResultPath": "$.resultsDict",
        "Next": "store-files"
      },
      "store-files": {
        "Type": "Task",
        "Resource": "${aws_lambda_function.lambda3-store-files.arn}",
        "InputPath": "$.resultsDict",
        "ResultPath": "$.resultsDict",
        "Next": "save-item"
      },
      "save-item": {
        "Type": "Task",
        "Resource": "${aws_lambda_function.lambda4-save-item.arn}",
        "InputPath": "$.resultsDict",
        "OutputPath": "$.resultsDict",
        "ResultPath": "$.resultsDict",
        "End": true
      }
    }
  }
  DEFINITION
}

resource "aws_s3_bucket" "storage-30141921-30141541" {
  bucket = "storage-30141921-30141541"
}

# lambda_url_create_obituary = "https://juboz4jrlxin4rzgdfphcqdcpq0rxfln.lambda-url.ca-central-1.on.aws/"
# lambda_url_get_obituaries = "https://qkyphnusivbabe4obxhs7v4g7e0wnash.lambda-url.ca-central-1.on.aws/"

