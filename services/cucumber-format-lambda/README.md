# Cucumber Format Lambda
This is the lambda that takes a cucumber report input and produces a JSON for the persistence lambda.

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

## Handler
The entrypoint of this lambda is the handler (*src/handler.ts*). 
As you can see the handler takes in input an S3Event.
```js
export const handler = async (event: S3Event, context: Context): Promise<boolean> => {
    ...
}
```


## Validation

Every time that an object is uploaded on a specific S3 (provided by the CDK) the lambda is triggered.
The file is validated with the method **validateCucumberReport** inside the file *src/validation.ts*.
```js
export const validateCucumberReport = (obj: unknown): CucumberReport[] => {
    lambdaLogger.info('Validating report');
    const { error, value } = cucumberSchema.validate(obj, { allowUnknown: true });

    if (error) {
        lambdaLogger.debug('Error validating cucumber report', { error });
        throw error;
    }

    return value;
};
```
The cucumberSchema is written in Joi and takes in input an unknown object and format it as a *CucumberReport*
```js
const cucumberSchema = Joi.array().items(
    Joi.object({
        keyword: Joi.string(),
        name: Joi.string(),
        line: Joi.number(),
        id: Joi.string(),
        tags: tagSschema,
        elements: elementsSchema,
    }),
);
```

## Formatting
The report is formatted using the method *formatCucumberReport* inside the file **src/utils.ts**.
```js
export const formatCucumberReport = (reports: CucumberReport[]): FinalReport[] => {
    lambdaLogger.info('Formatting report');
    const finalReports: FinalReport[] = reports.map((cucumberReport) => {
        const results = getResults(cucumberReport);

        return {
            results,
        };
    });

    return finalReports;
};
```
The result of the formatCucumberReport method is a JSON ready to be send to the lambda that persists datas into the DB.

