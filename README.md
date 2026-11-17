# Cake Delight — Cloud-Native Microservices Application

## 1. Project Overview

Cake Delight is a cloud-native cake-shopping application developed using a microservices architecture.

The application allows users to register and log in, browse cakes, manage a shopping basket, place orders, track order status, submit ratings, and receive order-related notifications.

The backend consists of independently deployable Spring Boot services. The application uses MySQL for persistence, RabbitMQ for asynchronous messaging, Docker for containerization, Kubernetes for orchestration, and React for the frontend.

## 2. Project Objectives

- Implement a microservices-based application.
- Separate catalog, order, rating, and notification responsibilities.
- Provide REST APIs through an API Gateway.
- Support basket management and checkout.
- Implement asynchronous communication using RabbitMQ.
- Containerize services using Docker.
- Deploy and manage application components using Kubernetes.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript, Vite |
| Backend | Java, Spring Boot |
| API Gateway | Spring Cloud Gateway |
| Database | MySQL |
| ORM | Spring Data JPA |
| Messaging | RabbitMQ |
| Containerization | Docker |
| Orchestration | Kubernetes |
| API Documentation | OpenAPI / Swagger |
| Development Tools | VS Code, Git, Maven, npm |

## 4. Project Structure

- `api-gateway/` — API routing
- `cake-delight-frontend/` — frontend application
- `catalog-service/` — cake catalog management
- `order-service/` — basket, checkout, and orders
- `rating-service/` — ratings and feedback
- `notification-service/` — notification processing
- `k8s/` — Kubernetes configuration files

## 5. Microservices

### Catalog Service
- Create, retrieve, update, and delete cakes.
- Filter cakes by name, category, and price.

### Order Service
- Manage shopping basket items.
- Calculate order totals.
- Process checkout.
- Retrieve user orders.
- Update and track order status.
- Publish order-related events.

### Rating Service
- Submit ratings and feedback.
- Retrieve ratings for individual cakes.
- Calculate average ratings.

### Notification Service
- Consume order-related RabbitMQ events.
- Create and store notification records.
- Maintain notification status information.

### API Gateway
- Provide a single entry point for frontend API requests.
- Route requests to the appropriate backend service.

## 6. Prerequisites

- Java Development Kit compatible with the project.
- Maven or the included Maven Wrapper.
- Node.js and npm.
- Docker Desktop.
- Kubernetes enabled in Docker Desktop.
- kubectl.

## 7. Run the Frontend

Open a terminal and execute:

```cmd
cd /d C:\DevProjects\Cake-Delight\cake-delight-frontend
npm install
npm run dev
```

Open the local URL printed by Vite.

Verify that the frontend API base URL points to the API Gateway. The previously configured local URL was `http://localhost:8084`.

## 8. Run Backend Services Locally

Start MySQL and RabbitMQ first, and configure each service's `application.properties` with the correct connection settings.

For each service, open a separate terminal. For example:

```cmd
cd /d C:\DevProjects\Cake-Delight\catalog-service
mvnw.cmd spring-boot:run
```

Repeat for the other service directories, including the API Gateway.

If a service does not contain `mvnw.cmd`, use Maven if installed:

```cmd
mvn spring-boot:run
```

Check the configured server ports before starting the services.

## 9. Kubernetes Deployment

Ensure Docker Desktop is running and Kubernetes is enabled.

Check the cluster:

```cmd
kubectl config current-context
kubectl get nodes
```

Apply the Kubernetes configuration:

```cmd
cd /d C:\DevProjects\Cake-Delight
kubectl apply -f k8s/
```

Check deployments, pods, and services:

```cmd
kubectl get deployments
kubectl get pods
kubectl get services
```

Inspect a failing pod:

```cmd
kubectl describe pod POD_NAME
kubectl logs POD_NAME
```

Replace `POD_NAME` with the actual pod name.

## 10. API Documentation

Refer to `API_DOCUMENTATION.md` for API endpoints, HTTP methods, and authentication requirements.

## 11. Architecture

Refer to `ARCHITECTURE.md` for service responsibilities, database ownership, and communication flows.

## 12. RabbitMQ Events

Refer to `EVENT_CONTRACTS.md` for order event structures, queues, and reliability considerations.

## 13. Testing and Demonstration

Use `DEMO_AND_VERIFICATION.md` to record functional test results and prepare the end-to-end demonstration.

## 14. Security Considerations

- Use environment variables or Kubernetes Secrets for sensitive configuration.
- Ensure users can access only their own orders and basket data.
- Verify error handling, retries, and service health checks.

## 15. Final Verification

Before submission, verify:

- All services start and communicate successfully.
- The required order lifecycle matches the capstone specification.
- RabbitMQ events are published and consumed successfully.
- Notification records are created correctly.
- API documentation is accessible.
- Kubernetes deployments become Ready.
- End-to-end tests pass.