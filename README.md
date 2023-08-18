# Obituary Maker
This was a final project for a Web development course that brings together front-end and back-end web
development. It's a program that creates obituaries for a person/character given a name, birth & death date, and image.

## Date Completed
April 2023 (Updated August 2023)

## Description
The assignments consisted of 2 main components. Front-end and back-end web development.
Front-End: React JS
Back-End: Terraform Configuration, AWS (S3, DynamoDB, Lambda, Amazon Polly), Cloudinary Upload API, ChatGPT Chat API

The program works by allowing the user to click a button that brings up a modal. This modal
enables the user to enter the name, date of birth (DOB), date of death (DOD), and an image. The program then sends this information, along with a given id, to the backend via a POST request. This initiates the orchestrator lambda function, `create-obituary`, which orchestrates an AWS step function that runs 4 other lambda functions. It provides the first lambda function with the name, DOB, DOD, and ID it was provided with through the POST request. It also stores the given image in an s3 bucket for later use.

The first lambda function in the step function, `generate-obituary`, accesses the ChatGPT Chat API and provides a prompt, which is a formatted string including the given name, DOB and DOD. The API then returns an obituary and this information, along with the name, DOB, DOD, and id are passed onto the next lambda function.

The second lambda function in the step function, `read-obituary`, takes the written obituary provided by the previous lambda function, and creates an mp3 file of the obituary being read by a voice id. This mp3 file is saved in the same s3 bucket as the image was saved in, and the info (name, id, DOB, DOD, written obituary) is sent to the next lambda function.

The third lambda function in the step function, `store-files`, takes the image and mp3 file that were previously stored in the s3 bucket, and uploads them to the Cloudinary Upload API. The image then gets blackened borders to resemble a real obituary image and then secure URLs are provided for both items to be accessed with. These URLs along with the info sent to this lambda function (name, id, DOB, DOD, written obituary) are sent to the next lambda function.

The fourth lambda function in the step function, `save-item`, takes all the incoming information from the previous lambda function and saves everything into a Dynamo DB table. The incoming information is then sent directly back to the orchestrator lambda function (`create-obituary`) and all this information is sent back to the front end via GET request.

## Video Demonstration
https://github.com/kameelkas/Obituary_Maker/assets/85535423/96261205-df7e-42a2-9d40-a282de349385

## Running the Program
Click the following link: https://ornate-basbousa-0f9dfa.netlify.app/
