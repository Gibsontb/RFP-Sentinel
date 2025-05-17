#!/bin/bash

echo "🚀 Deploying Proposal SaaS Platform to AWS"

# Set unique name for this deployment
STACK_SUFFIX="proposal-saas"

# 1. Deploy network stack
echo "🔧 Deploying VPC and networking..."
aws cloudformation deploy \
  --template-file network.yaml \
  --stack-name network-$STACK_SUFFIX \
  --capabilities CAPABILITY_NAMED_IAM

# 2. Deploy secrets stack
echo "🔐 Deploying Secrets..."
aws cloudformation deploy \
  --template-file secrets.yaml \
  --stack-name secrets-$STACK_SUFFIX \
  --capabilities CAPABILITY_NAMED_IAM

# 3. Deploy ECS and services stack
echo "🛰️ Deploying ECS Cluster and Services..."
aws cloudformation deploy \
  --template-file ecs-services.yaml \
  --stack-name ecs-$STACK_SUFFIX \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    BackendImage="your-backend-ecr-uri:latest" \
    FrontendImage="your-frontend-ecr-uri:latest" \
    VpcId=$(aws cloudformation list-exports --query "Exports[?Name=='ProposalVPC'].Value" --output text) \
    Subnet1=$(aws cloudformation list-exports --query "Exports[?Name=='PublicSubnet1'].Value" --output text) \
    Subnet2=$(aws cloudformation list-exports --query "Exports[?Name=='PublicSubnet2'].Value" --output text)

echo "✅ All stacks launched. ECS services are starting..."