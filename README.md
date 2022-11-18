# Report automation
This is a POC of a report automation suite using AWS cloud

## Introduction
This repo contains the automation stack for the automatic reports review. Is a project build with a mono repository approach. This project was created with the goal of automatic take reports from the automation and store into a DB (accessed by Grafana).

## Project overview
The stack of this project is built on top of AWS. The IaC used is the AWS-CDK (https://docs.aws.amazon.com/cdk/api/v2/).

![](readme/01-infrastracture.png)

## How it works
Once that an automation suite is completed the reports (usually in JSON) is uploaded into an S3 Bucket. 
Once that the file is uploaded one of the lambdas that are listening on the S3 take the report and formats it. The formatted report is sent to an **SQS** that trigger another lambda, that will insert datas into the DB.

## Project setup
- npm install
- npm run build

## Available commands
- npm run lint
- npm run test

## Project structure
![](readme/02-project-structure.png)

The project is a mono-repository with two workspaces: **packages** and **services**
### Packages
Inside packages we have shared lib and the cdk project. You can find the configuration of tsconfig and eslint for example.
### Usage of tsconfig
There is a project under **packages/tsconfig.json** where you can find different available ts configuration (with the name **.json*). You can import these configuration into every project adding this dependencies:
```
 "@packages/tsconfig": "*",
```
and then you can add a tsconfig file into the project with this format
````
{
  "extends": "@packages/tsconfig/base.json",
  "compilerOptions": {
    "outDir": ".dist",
    "rootDir": "./",
    "baseUrl": "src"
  },
  "include": ["./src", "./test"]
}
````

### Usage of eslint
As for tsconfig you can import the eslint lib into any project as a dependency
```
 "@packages/eslint-config-custom": "*",
```
and then use in the project by adding the following **eslintrc.json** file
```
{
  "root": true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  "extends": ["@packages/eslint-config-custom/ts"]
}
```

