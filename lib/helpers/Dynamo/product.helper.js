import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { productTableConfig } from "../../config/db.config.js"

export const productClient = new DynamoDBClient(productTableConfig.aws_remote_config);