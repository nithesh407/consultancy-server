import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { userTableConfig } from "../../config/db.config.js"

export const productClient = new DynamoDBClient(userTableConfig.aws_remote_config);