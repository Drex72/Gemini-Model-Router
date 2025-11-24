# Gemini-Model-Router
A dynamic routing layer for directing requests to the optimal large language model (LLM) based on defined rules and priorities.

[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/model-routing/ci.yml?branch=main)](https://github.com/your-username/model-routing/actions)
[![npm version](https://img.shields.io/npm/v/model-routing.svg)](https://www.npmjs.com/package/model-routing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Language: TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Introduction

`Gemini-Model-Router` is a TypeScript library for dynamically routing requests to different large language models (LLMs). It addresses the operational complexity of managing a diverse set of models from various providers by enabling rule-based selection for any given request.

This utility provides a unified interface for multiple models, enabling significant cost optimization by selecting providers based on price-performance tiers. It also enhances application resilience by supporting automatic failover to alternative models during provider outages or API failures.

## Features

- Define conditional routing logic based on request properties.
    - Route requests using data from the request body, headers, or query parameters.
    - Create complex rules with logical operators (AND, OR, NOT).
- Implement advanced traffic distribution strategies.
    - Split traffic between models for A/B testing or canary deployments.
    - Distribute load across multiple model replicas with configurable weights.
    - Designate a fallback model to ensure service availability.
- Manage routing configurations dynamically without service restarts.
- Register and reference backend models by a unique identifier.
- Monitor routing behavior with structured, per-request logging.

## Tech Stack

This project is built with a modern TypeScript stack, focusing on performance, reliability, and code quality. Key technologies are defined in `package.json`.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

### Core & Backend

*   **TypeScript**: Primary language for strong typing and modern syntax.
*   **Node.js**: The JavaScript runtime for executing the server-side application.
*   **Express.js**: Minimalist web framework used for building the API endpoints.

### Testing

*   **Jest**: Framework for creating and running unit and integration tests.
*   **ts-jest**: A Jest transformer with source map support for TypeScript.

### Tooling & DevOps

*   **ESLint**: For static code analysis and enforcing code style.
*   **Prettier**: An opinionated code formatter to ensure consistent styling.
*   **Docker**: For creating, deploying, and running the application in a containerized environment.

## Prerequisites

Ensure your development environment meets the following requirements before you begin.

### Required

*   **Node.js**: `v18.0.0` or later.
    *   To check your version, run: `node -v`
*   **npm**: `v9.0.0` or later.
    *   To check your version, run: `npm -v`
*   **Environment Variables**: Create a `.env` file in the project root by copying the `.env.example` file.
    ```bash
    cp .env.example .env
    ```
    Populate the `.env` file with the necessary API keys and configuration values.

### Optional

*   **Visual Studio Code**: Recommended for a consistent development experience with project-configured extensions and settings.

## Installation

1.  Clone the repository to your local machine.

    ```bash
    git clone https://github.com/Drex72/Gemini-Model-Router
    ```

2.  Navigate into the newly created project directory.

    ```bash
    cd Gemini-Model-Router
    ```

3.  Install the required Node.js dependencies using npm.

    ```bash
    npm install
    ```

4.  Create the local environment configuration file by copying the example file.

    ```bash
    cp .env.example .env
    ```

    After creating the file, modify the variables in `.env` to match your local development environment, such as database connection strings or API keys.

## Usage

This library provides a `SemanticRouter` to direct input to the most relevant logic path based on semantic similarity. You integrate it by importing the class into your TypeScript or JavaScript project.

### Basic Example

The simplest use case is to define a set of routes with example phrases (utterances) and find the best match for a new query.

1.  **Define Routes**: Create an array of route objects. Each object needs a `name` and an array of example `utterances`.
2.  **Initialize Router**: Instantiate `SemanticRouter` with your defined routes.
3.  **Route a Query**: Call the asynchronous `route` method with a user's query to get the best-matching route name.

```typescript
import { SemanticRouter } from 'model-routing';

// 1. Define routes with example phrases
const routes = [
  {
    name: 'mathematics',
    utterances: [
      'what is 2 + 2?',
      'solve for x in the equation',
      'can you explain calculus?',
      'what is the Pythagorean theorem?',
    ],
  },
  {
    name: 'history',
    utterances: [
      'who was the first president of the United States?',
      'what were the causes of World War II?',
      'tell me about the Roman Empire',
      'when did the Renaissance begin?',
    ],
  },
];

// 2. Initialize the router
const router = new SemanticRouter({ routes });

// 3. Route a new query
const query = 'who was napoleon bonaparte?';
const result = await router.route(query);

console.log(result);
```

**Expected Output:**

```json
{
  "name": "history"
}
```

### Common Use Cases

#### 1. Directing Queries to Specific Functions

Use the router to create an intelligent agent that calls the correct function based on user input. This is useful for building chatbots or tool-using LLM applications.

```typescript
import { SemanticRouter } from 'model-routing';

// Define functions to handle specific tasks
const handleBillingInquiry = async (query: string) => {
  console.log('Executing billing logic...');
  // Your logic to look up billing info
  return `Handling your billing question about: "${query}"`;
};

const handleTechnicalSupport = async (query: string) => {
  console.log('Executing technical support logic...');
  // Your logic to create a support ticket
  return `Creating a support ticket for: "${query}"`;
};

// Map route names to their corresponding functions
const actions: { [key: string]: (query: string) => Promise<string> } = {
  billing: handleBillingInquiry,
  tech_support: handleTechnicalSupport,
};

const routes = [
  {
    name: 'billing',
    utterances: [
      'check my latest invoice',
      'what is my current balance?',
      'I have a question about a charge',
      'update my payment method',
    ],
  },
  {
    name: 'tech_support',
    utterances: [
      'my computer is not turning on',
      'I cannot connect to the wifi',
      'the application is crashing',
      'how do I reset my password?',
    ],
  },
];

const router = new SemanticRouter({ routes });

// Main execution logic
const processQuery = async (query: string) => {
  const routeResult = await router.route(query);
  if (routeResult && actions[routeResult.name]) {
    const action = actions[routeResult.name];
    const response = await action(query);
    console.log(response);
  } else {
    console.log('No specific action found. Handling as a general query.');
  }
};

// Example execution
(async () => {
  await processQuery('why is my internet so slow?');
})();
```

#### 2. Handling Fallbacks with a Similarity Threshold

For queries that do not closely match any defined route, you can implement a fallback or default action. The `route` method also returns a similarity `score` which can be used as a confidence threshold.

```typescript
import { SemanticRouter } from 'model-routing';

const routes = [
  {
    name: 'order_status',
    utterances: ['where is my package?', 'check my order status'],
  },
  {
    name: 'product_info',
    utterances: ['tell me about product XYZ', 'what are the specs?'],
  },
];

const router = new SemanticRouter({ routes });

const handleQueryWithThreshold = async (
  query: string,
  threshold: number = 0.8
) => {
  const result = await router.route(query);

  if (result && result.score >= threshold) {
    console.log(`Matched route: ${result.name} (Score: ${result.score.toFixed(2)})`);
    // Proceed with route-specific logic
  } else {
    const bestGuess = result ? result.name : 'none';
    const score = result ? result.score.toFixed(2) : 'N/A';
    console.log(
      `No confident match found. Best guess was '${bestGuess}' with score ${score}.`
    );
    console.log('Executing default fallback logic...');
  }
};

// Example with a query that is a poor match
(async () => {
  await handleQueryWithThreshold('what is the weather like today?');
})();
```

## Contributing

Contributions are welcome and highly appreciated. To ensure a smooth and effective collaboration process, adhere to the following guidelines.

### Reporting Issues

Report all bugs, feature requests, and documentation issues using GitHub Issues.

Before creating a new issue, please search existing issues to avoid duplicates. When submitting a bug report, provide a clear title and a detailed description that includes:

-   Steps to reproduce the behavior.
-   Expected versus actual results.
-   Relevant environment details (e.g., Node.js version, OS).

### Submitting Pull Requests

1.  Fork the repository and create a new branch from `main`. See the "Branch Naming" section for conventions.
2.  Make your changes, ensuring all code adheres to the project's coding standards.
3.  Ensure all existing tests pass and add new tests for your changes.
4.  Submit a pull request to the `main` branch.
5.  In the pull request description, clearly explain the problem and solution. Reference the relevant issue number if applicable (e.g., `Closes #123`).

### Development Setup

**Prerequisites:**
-   Node.js `18.x` or later
-   npm `9.x` or later

**Instructions:**

1.  Clone the repository and navigate to the project directory.

2.  Install the required dependencies:
    ```bash
    npm install
    ```

3.  Build the project:
    ```bash
    npm run build
    ```

4.  Run the test suite to verify the setup:
    ```bash
    npm test
    ```

### Coding Standards

This project uses Prettier for code formatting and ESLint for code analysis. All submitted code must be formatted and pass all linting rules.

-   **Format Code:**
    ```bash
    npm run format
    ```

-   **Run Linter:**
    ```bash
    npm run lint
    ```

### Branch and Commit Conventions

#### Branch Naming

Use the following format for branch names: `type/short-description`.

-   **type:** `feat`, `fix`, `docs`, `refactor`, `test`
-   **short-description:** A few words describing the change, separated by hyphens.

**Examples:**
-   `feat/add-new-routing-strategy`
-   `fix/resolve-cache-invalidation`
-   `docs/update-contributing-guide`

#### Commit Messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. Each commit message should follow the format: `type(scope): subject`.

-   **type:** `feat`, `fix`, `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, `test`
-   **scope (optional):** The part of the codebase affected (e.g., `api`, `core`, `config`).
-   **subject:** A concise description of the change in the imperative mood.

**Examples:**
-   `feat(api): add endpoint for user authentication`
-   `fix(core): correct memory leak in data processor`
-   `docs(readme): add installation instructions`

## License

This project is licensed under the ISC License.

This permissive license allows for the use, copying, modification, and distribution of the software. The only condition is that the original copyright and license notice must be included in all copies or substantial portions of the software. This software is provided "as is" without any warranty.