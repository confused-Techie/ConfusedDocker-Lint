## ConfusedDocker-Lint

A far from complete Dockerfile Linter.

This was mostly a programming exercise that may not have approached this with proper standards.

Install using:

````
npm i -g
````

While in the root directory

Then use:

````
confusedDockerLint lint "C:\Path to Dockerfile"
````

This will return way to much data currently as its not yet complete.

This data includes all of the tokenization and parsing data raw, as well as the last data that is returned is an array
of alerts about your code. These alerts currently are returned after analyzing Comments and Parser Directives. 
