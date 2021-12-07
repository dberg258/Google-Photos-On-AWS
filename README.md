## Overview

A simple version of google photos built using AWS. You can upload photos and search for them by searching for common objects present in the images (i.e. dog).

## Demo

![](https://imgur.com/Kv0nXcj.gif)

## AWS Components
-	Lambda 
-	Rekognition
-	Elasticsearch
-	S3
-	EventBridge
-	CloudTrail
-	API Gateway
-	CloudFormation
-	CodeCommit
-	CodePipeline

## Architecture
![](https://imgur.com/D4pWWWO.jpg)


## Application Flow

1.	Navigate to S3 hosted static website
  
2.	Upload an image
    - Image uploads to the S3 bucket smart-album-photos-\<id> through API Gateway
  
3.	EventBridge S3 event rule triggers
    - Triggers anytime an object is added to the S3 bucket smart-album-photos-\<id>
    - Triggers the lambda function index-photos-\<id>

4.	Index-photos-\<id> runs: 
    - Receives a bucket name and bucket object id corresponding to the recently uploaded image
    - Calls Rekognition with the given image
    - Rekognition returns labels of common objects found in the image
    - Forms a json document with the bucket name, bucket object id, current timestamp and object labels returned from Rekognition
    - Uploads the json document to the photod Elasticsearch index

5.	Submit a search query on the S3 hosted application
    - Query is sent through API Gateway to the lambda function search-photos-\<id>
  
6.	Search-photos-\<id> runs:
    - Receives a search query containing object labels (i.e. dog, beach, etc.)
    - Queries the Elasticsearch photos index for documents with the provided object labels
    - Generates presigned S3 urls for the images returned by the query
    - Returns a json document with these urls

  
## Build
  
  This repository contains CloudFormation templates to build the entire application. 
  
  1. Many AWS resources require a unique name. In /Templates/template_1.yaml, /Templates/template_2.yaml, /Lambdas/sam.yaml, /Lambdas/buildspec.yaml, /Lambdas/lambda_function_search.py, /Lambdas/lambda_function_index.py and /Frontend/submit.js, replace all instances of \<id> with a 3 digit number.
  
  2. In /Lambdas/sam.yaml, replace \<account-id> with your account id.
  
  3. Create 2 repositories in Code Commit with the names:
      - google-photos-lambdas
          - Unzip Lambdas.zip and upload all of the files in /Lambdas/ to this repository.
      - google-photos-frontend
          - Upload all of the files in /Frontend/ to this repository.
 
  4. Create a stack in CloudFormation using /Templates/template_1.yaml.
  
  5. Upon completion of the release stage of the CodePipeline google-photos-stage-1 (which is created by the stack in step 4), create another stack in CloudFormation using /Templates/template_2.yaml.

  6. Upon completion of the stack in step 5, set up a CloudTrail trail for the S3 bucket smart-album-photos-\<id>. Instruction can be found [here](https://docs.aws.amazon.com/codepipeline/latest/userguide/create-cloudtrail-S3-source-console.html) under "to create a trail."
  
  7. Navigate to the google-photos-api in API Gateway and retrieve the: 
      - Invoke-url from the prod stage
      - API key
  
  8. In the google-photos-frontend CodeCommit repository edit:
      - /submit.js: populate the api_key and api_url variables with the values retrieved from step 7
      - /apiGateway-js-sdk/apigClient.js: populate the invokeUrl variable with the invoke-url values from step 7
  
  9. Commit the changes made in step 8. The google-photos-stage-2 pipeline will automatically run and apply the changes to the static website hosted in S3.
  
  10. The application is now ready. Navigate to bucket url of smart-photo-album-frontend-\<id>.
    
  
