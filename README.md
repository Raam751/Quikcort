
# QuikCort — Backend Services for AI-Assisted Mediation

QuikCort is a backend system designed to manage structured mediation workflows, including case submissions, argument handling, and decision orchestration. The project focuses on backend API design, business logic structuring, and data persistence rather than frontend complexity.

This repository represents my work on designing and implementing backend services for a workflow-driven application.

---

## Backend Overview

The backend is responsible for:

* Managing mediation cases and user-submitted arguments
* Orchestrating decision workflows and scoring components
* Persisting structured outcomes for later review and analysis
* Validating inputs and returning consistent error responses

The emphasis of the project is on **clean backend structure**, **service-layer separation**, and **maintainable API design**.

---

## Tech Stack

* Node.js
* Express.js
* REST APIs
* Database: MongoDB

---

## Core Backend Features

* RESTful APIs for case creation and argument submission
* Modular service-layer architecture for business logic
* Data models for users, cases, and historical decisions
* Centralized request validation and error handling
* Clear separation between routing, services, and persistence layers

---

## Project Structure

```
/controllers   -> API endpoint handlers
/services      -> Core business logic and workflow orchestration
/models        -> Data schemas and persistence logic
/routes        -> Route definitions
```

This structure was chosen to keep request handling independent from business logic and data access.

---

## How to Run Locally

1. Clone the repository

   ```bash
   git clone https://github.com/Raam751/Quikcort.git
   ```
2. Install dependencies

   ```bash
   npm install
   ```
3. Configure environment variables (database connection, ports, etc.)
4. Start the server

   ```bash
   npm start
   ```

---

## Design Decisions & Trade-offs

* Used a service-layer approach to avoid placing business logic inside controllers
* Focused on backend correctness and clarity over frontend polish
* Prioritized maintainability and readability over premature optimization

---

## Future Improvements

* Authentication and role-based access control
* Pagination and rate limiting for APIs
* Improved logging and monitoring
* More structured API documentation

---

## Notes

This project is intended to demonstrate backend system design, API structuring, and data handling. The frontend and deployment aspects are intentionally minimal to keep the focus on backend engineering.

---
