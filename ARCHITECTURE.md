# Cake Delight — Architecture Documentation

## 1. System Architecture Overview

Cake Delight follows a **Microservices Architecture** in which the application is divided into multiple independent services, each responsible for a specific business functionality.

The application consists of a React frontend, Spring Boot backend microservices, an API Gateway, MySQL databases, and RabbitMQ for asynchronous communication.

The frontend communicates with the backend through the API Gateway, which routes incoming requests to the appropriate microservice.

The architecture supports independent service development, deployment, database management, and communication.

## 2. High-Level Architecture

```text
                 CLIENT / USER
                       |
                       |
                REACT FRONTEND
                       |
                       |
                 API GATEWAY
                   Port 8084
                       |
          +------------+------------+
          |            |            |
          v            v            v
    CATALOG        ORDER         RATING
    SERVICE        SERVICE       SERVICE
    :8080          :8081         :8082
          |            |            |
          v            |            v
      CATALOG          |          RATING
      DATABASE         |          DATABASE
                       |
                       v
                 NOTIFICATION
                   SERVICE
                    :8083
                       |
                       v
                 NOTIFICATION
                   DATABASE

          ORDER SERVICE
                |
                | Publish Events
                v
             RABBITMQ
                |
                | Consume Events
                v
        NOTIFICATION SERVICE
```

## 3. Frontend Architecture

**Technology:** React, JavaScript, Vite, CSS

The frontend provides the user interface for interacting with the Cake Delight application.

Responsibilities:

- Display the Cake Delight landing page.
- Provide a login-style entry screen with redirection to the main application.
- Display available cakes.
- Support cake searching and filtering.
- Manage shopping basket operations.
- Allow users to place orders.
- Display order information and status.
- Support cake ratings and reviews.
- Display relevant application information.

The frontend communicates with backend services through the API Gateway.

## 4. API Gateway Architecture

**Technology:** Spring Cloud Gateway

**Port:** 8084

The API Gateway acts as the single entry point for frontend requests.

Instead of communicating directly with individual microservices, the frontend sends requests to the gateway.

The gateway forwards requests to the appropriate backend service based on configured routes.

### Gateway Routing Configuration

| Service | Route Path | Target Service |
|---|---|---|
| Catalog Service | `/cakes/**` | Port 8080 |
| Order Service | `/orders/**` | Port 8081 |
| Rating Service | `/ratings/**` | Port 8082 |
| Notification Service | `/notifications/**` | Port 8083 |

Benefits:

- Centralized API access.
- Simplified frontend communication.
- Independent backend services.
- Easier service management.
- Reduced direct communication between frontend and backend services.

## 5. Microservices Architecture

### 5.1 Catalog Service

**Technology:** Spring Boot, Spring Data JPA, MySQL

**Port:** 8080

The Catalog Service manages cake-related information.

Responsibilities:

- Create new cake records.
- Retrieve available cakes.
- Update cake information.
- Delete cake records.
- Search cakes.
- Filter cakes based on available criteria.
- Provide cake details and pricing to other services.

### 5.2 Order Service

**Technology:** Spring Boot, Spring Data JPA, MySQL, RabbitMQ

**Port:** 8081

The Order Service handles shopping basket operations and order processing.

Responsibilities:

- Add cakes to the shopping basket.
- Retrieve basket items.
- Update item quantities.
- Remove basket items.
- Calculate order totals.
- Process checkout.
- Retrieve order information.
- Update order status.
- Publish order-related events to RabbitMQ.

The Order Service communicates synchronously with the Catalog Service to retrieve cake information and calculate order prices.

### 5.3 Rating Service

**Technology:** Spring Boot, Spring Data JPA, MySQL

**Port:** 8082

The Rating Service manages customer ratings and feedback for cakes.

Responsibilities:

- Submit cake ratings.
- Store customer feedback.
- Retrieve ratings.
- Retrieve ratings for individual cakes.
- Support rating-related operations.

### 5.4 Notification Service

**Technology:** Spring Boot, Spring Data JPA, MySQL, RabbitMQ

**Port:** 8083

The Notification Service processes order-related events received through RabbitMQ.

Responsibilities:

- Consume order completion events.
- Consume order status change events.
- Generate notification messages.
- Store notification records in MySQL.
- Maintain notification status.
- Track notification attempt counts.

The service uses RabbitMQ listeners to process messages asynchronously.

## 6. Database Architecture

Cake Delight follows a **Database-per-Service Architecture**.

Each microservice manages its own database instead of sharing a single database across all services.

| Microservice | Database |
|---|---|
| Catalog Service | Catalog Database |
| Order Service | order_db |
| Rating Service | Rating Database |
| Notification Service | notification_db |

Benefits:

- Independent database management.
- Reduced database dependency between services.
- Better service isolation.
- Easier maintenance.
- Independent database schema changes.

Each service accesses its database using Spring Data JPA.

## 7. RabbitMQ Event-Driven Architecture

**Technology:** RabbitMQ

RabbitMQ provides asynchronous communication between the Order Service and Notification Service.

The Order Service publishes events when an order is completed or its status changes.

The Notification Service consumes these events and creates notification records.

### 7.1 RabbitMQ Exchange

Exchange Name:

`order.exchange`

### 7.2 Routing Keys and Queues

| Event | Routing Key | Queue |
|---|---|---|
| Order Completed | `order.completed` | `order.completed.queue` |
| Order Status Changed | `order.status.changed` | `order.status.changed.queue` |

### 7.3 Event Processing Flow

**Order Completed Event:**

1. Customer completes the checkout process.
2. Order Service saves the order.
3. Order Service creates an OrderCompletedEvent.
4. Event is published to RabbitMQ.
5. RabbitMQ routes the message to the completed-order queue.
6. Notification Service consumes the event.
7. A notification record is created and saved in the Notification Database.

**Order Status Changed Event:**

1. Order status is updated.
2. Order Service saves the updated status.
3. An OrderStatusChangedEvent is created.
4. The event is published to RabbitMQ.
5. Notification Service consumes the event.
6. A notification message is generated containing the old and new order statuses.
7. The notification is stored in MySQL.

This approach reduces direct dependency between the Order Service and Notification Service.

## 8. Inter-Service Communication

Cake Delight uses two communication approaches:

### 8.1 Synchronous Communication

REST API communication is used when an immediate response is required.

Example:

The Order Service communicates with the Catalog Service to retrieve cake information and pricing during checkout.

### 8.2 Asynchronous Communication

RabbitMQ is used for event-driven communication.

Example:

The Order Service publishes order completion and order status change events, which are consumed by the Notification Service.

## 9. Docker Architecture

**Technology:** Docker

Docker is used to containerize the application components.

Each backend microservice and the frontend can run inside independent Docker containers.

Benefits:

- Consistent application environments.
- Service isolation.
- Simplified deployment.
- Portability.
- Easier application management.

The frontend uses a multi-stage Docker build with Node.js for building the React application and Nginx for serving the production build.

## 10. Kubernetes Architecture

**Technology:** Kubernetes (Docker Desktop)

Kubernetes manages the containerized application components.

The project uses Kubernetes Deployments and Services to manage application workloads and communication.

### Kubernetes Components

| Component | Responsibility |
|---|---|
| Deployment | Manages application pods and replicas |
| Pod | Runs application containers |
| ClusterIP Service | Enables internal service communication |
| NodePort Service | Exposes selected services outside the cluster |
| Configurations | Define application deployment settings |

### Kubernetes Services

The project uses Kubernetes Services for internal communication between microservices.

The API Gateway is exposed through a NodePort service.

The frontend is also configured for external access through a Kubernetes Service.

### Useful Kubernetes Commands

```bash
kubectl get pods
kubectl get deployments
kubectl get services
kubectl describe pod POD_NAME
kubectl logs POD_NAME
kubectl apply -f k8s/
kubectl scale deployment --all --replicas=0
```

## 11. End-to-End Application Workflow

The overall application workflow is as follows:

1. User opens the Cake Delight frontend.
2. User enters the main application through the landing page.
3. Frontend requests cake information through the API Gateway.
4. API Gateway forwards requests to the Catalog Service.
5. User adds cakes to the shopping basket.
6. Order Service manages basket operations.
7. During checkout, Order Service retrieves cake pricing from Catalog Service.
8. Order Service calculates the total amount and saves the order.
9. Order Service publishes an order completion event to RabbitMQ.
10. Notification Service consumes the event and creates a notification.
11. User can track order status.
12. When order status changes, another event is published.
13. Notification Service processes the status change and stores the notification.
14. Rating Service manages cake ratings and feedback.

## 12. Architecture Benefits

- Modular application design.
- Independent microservice deployment.
- Separation of business responsibilities.
- Database independence.
- Synchronous REST-based communication.
- Asynchronous event-driven communication.
- Containerized application deployment.
- Kubernetes-based orchestration.
- Easier maintenance and scalability.

## 13. Conclusion

Cake Delight demonstrates the implementation of a cloud-native microservices application using modern backend and frontend technologies.

The project combines Spring Boot microservices, React, MySQL, RabbitMQ, Docker, and Kubernetes to provide a modular and independently deployable application architecture.

The integration of API Gateway routing and event-driven communication enables the services to work together while maintaining separation of responsibilities.
