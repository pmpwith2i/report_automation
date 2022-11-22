# Persistence Lambda
This is the lambda that takes a JSON in input and persist into the DB.

## Setup
```bash
nvm use
npm i
```

## Project structure

- src
    - index.ts // The handler of the lambda
    - interface.ts // Types of the project
    - strategy.ts // The main methods of the project
    - utils.ts
    - validation.ts // Joi validation for input events