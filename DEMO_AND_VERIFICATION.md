# Cake Delight — End-to-End Demonstration and Verification

## 1. Introduction

This document describes the end-to-end demonstration and verification process for the Cake Delight Microservices Application.

It covers frontend functionality, backend microservices, API Gateway routing, database operations, RabbitMQ event communication, Docker containerization, and Kubernetes deployment.

The purpose is to verify that all application components work together correctly.

## 2. Application Configuration

### 2.1 Microservice Ports

| Component | Port |
|---|---:|
| React Frontend (Vite) | 5173 |
| API Gateway | 8084 |
| Catalog Service | 8080 |
| Order Service | 8081 |
| Rating Service | 8082 |
| Notification Service | 8083 |
| MySQL | 3306 |
| RabbitMQ | 5672 |

### 2.2 API Gateway

The API Gateway provides a single entry point for frontend requests.

Base URL:

`http://localhost:8084`

Configured routes:

| Service | Endpoint Prefix |
|---|---|
| Catalog Service | `/cakes/**` |
| Order Service | `/orders/**` |
| Rating Service | `/ratings/**` |
| Notification Service | `/notifications/**` |

## 3. Starting the Application Locally

### Step 1: Start MySQL and RabbitMQ

Ensure MySQL and RabbitMQ are running before starting the backend services.

Verify their availability and database connectivity.

### Step 2: Start Backend Microservices

Open separate terminals for the following services.

**Catalog Service**

```cmd
cd catalog-service
mvnw.cmd spring-boot:run
```

**Order Service**

```cmd
cd order-service
mvnw.cmd spring-boot:run
```

**Rating Service**

```cmd
cd rating-service
mvnw.cmd spring-boot:run
```

**Notification Service**

```cmd
cd notification-service
mvnw.cmd spring-boot:run
```

**API Gateway**

```cmd
cd api-gateway
mvnw.cmd spring-boot:run
```

Ensure that all services start successfully on their configured ports.

### Step 3: Start React Frontend

Open another terminal:

```cmd
cd cake-delight-frontend
npm install
npm run dev
```

Open the Vite URL displayed in the terminal.

The landing page should appear first. Clicking Login redirects to the existing Cake Delight application.

Note: The login screen is a demonstration-only entry screen. It does not perform actual authentication.

## 4. Frontend Demonstration

Verify the following frontend functionalities:

| Test Case | Expected Result |
|---|---|
| Open application | Landing page displayed |
| Click Login | Redirects to main application |
| View cake catalog | Available cakes displayed |
| Search cakes | Matching cakes displayed |
| Filter cakes | Results filtered correctly |
| Add cake to basket | Cake added successfully |
| Update quantity | Basket quantity updated |
| Remove cake | Item removed from basket |
| Checkout | Order created successfully |
| View order | Order information displayed |
| Submit rating | Rating submitted successfully |

## 5. API Gateway Verification

Verify that the API Gateway is accessible.

```powershell
curl.exe http://localhost:8084/cakes
```

Expected result:

The Catalog Service should return cake information through the API Gateway.

Verify notifications:

```powershell
curl.exe http://localhost:8084/notifications
```

Expected result:

A JSON response containing stored notification records.

## 6. Catalog Service Verification

Verify that the Catalog Service returns cake information.

```powershell
curl.exe http://localhost:8084/cakes
```

Verify individual cake information using the appropriate cake ID:

```powershell
curl.exe http://localhost:8084/cakes/1
```

Expected result:

- Cake information is returned.
- Cake details are retrieved successfully.
- Database records are accessible through the service.

## 7. Order Service Verification

The Order Service manages basket operations, checkout, and order status.

### 7.1 Basket Management

Verify the following operations through the frontend or the configured REST endpoints:

- Add cake to basket.
- Retrieve basket items.
- Update cake quantity.
- Remove cake from basket.

### 7.2 Checkout Verification

Perform checkout using the frontend or the configured checkout API.

Expected result:

- Order is created.
- Cake information is retrieved from Catalog Service.
- Total price is calculated.
- Order information is saved in the Order Database.
- Initial order status is set to CONFIRMED.
- Order completion event is published to RabbitMQ.

### 7.3 Order Status Verification

Update the order status using PowerShell.

Example:

```powershell
Invoke-RestMethod -Uri "http://localhost:8084/orders/1/status?status=PREPARING" -Method PUT
```

Update to OUT_FOR_DELIVERY:

```powershell
Invoke-RestMethod -Uri "http://localhost:8084/orders/1/status?status=OUT_FOR_DELIVERY" -Method PUT
```

Update to DELIVERED:

```powershell
Invoke-RestMethod -Uri "http://localhost:8084/orders/1/status?status=DELIVERED" -Method PUT
```

Expected result:

- Order status is updated successfully.
- Updated order information is returned.
- Order status change event is published to RabbitMQ.

Note: Use an existing order ID and follow the valid status transition rules implemented in OrderService.

## 8. RabbitMQ Event Verification

RabbitMQ provides asynchronous communication between the Order Service and Notification Service.

### 8.1 Order Completion Event

When checkout is completed:

1. Order Service creates an order.
2. OrderCompletedEvent is generated.
3. Event is published to `order.exchange`.
4. Routing key: `order.completed`.
5. RabbitMQ routes the event to `order.completed.queue`.
6. Notification Service consumes the event.
7. Notification record is saved in MySQL.

### 8.2 Order Status Change Event

When an order status changes:

1. Order Service updates the order status.
2. OrderStatusChangedEvent is generated.
3. Event is published to RabbitMQ.
4. Routing key: `order.status.changed`.
5. RabbitMQ routes the event to `order.status.changed.queue`.
6. Notification Service consumes the event.
7. Notification record is created and stored.

## 9. Notification Service Verification

The Notification Service stores notifications generated from RabbitMQ events.

### 9.1 Retrieve All Notifications

```powershell
curl.exe http://localhost:8084/notifications
```

### 9.2 Retrieve Notification by ID

```powershell
curl.exe http://localhost:8084/notifications/1
```

### 9.3 Retrieve Notifications by Order ID

```powershell
curl.exe http://localhost:8084/notifications/order/1
```

Expected result:

- Notification records are returned.
- Order ID is associated with each notification.
- Customer name is stored.
- Notification message contains the relevant order information.
- Notification status is displayed as SENT.
- Attempt count is maintained.

### 9.4 Example Notification Response

```json
[
  {
    "id": 1,
    "orderId": 1,
    "customerName": "Vikas",
    "message": "Order 1 completed successfully.",
    "status": "SENT",
    "attemptCount": 1
  }
]
```

Status change notifications should contain the previous and updated order statuses.

## 10. Rating Service Verification

Verify rating-related functionality through the frontend or configured REST API endpoints.

Test the following operations:

- Submit a cake rating.
- Retrieve ratings.
- Retrieve ratings for an individual cake.
- Verify stored rating information.

Expected result:

Rating information should be saved and retrieved successfully from the Rating Database.

## 11. Docker Verification

Docker is used to containerize the application components.

### 11.1 Build Frontend Docker Image

Navigate to the frontend directory:

```powershell
cd cake-delight-frontend
```

Build the image:

```powershell
docker build -t cake-delight-frontend:1.1 .
```

### 11.2 Verify Docker Images

```powershell
docker images
```

Expected result:

The Cake Delight frontend image should appear in the image list.

### 11.3 Verify Running Containers

```powershell
docker ps
```

To view all containers, including stopped containers:

```powershell
docker ps -a
```

## 12. Kubernetes Deployment Verification

The application is deployed using Kubernetes with Docker Desktop.

### 12.1 Verify Kubernetes Context

```powershell
kubectl config current-context
```

Expected context:

`docker-desktop`

### 12.2 Verify Cluster Nodes

```powershell
kubectl get nodes
```

Expected result:

The Kubernetes node should be in Ready status.

### 12.3 Apply Kubernetes Configuration

Navigate to the project root directory:

```powershell
kubectl apply -f k8s/
```

If frontend deployment and service manifests are maintained separately, apply them using:

```powershell
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

Run these commands from the directory containing those files.

### 12.4 Verify Deployments

```powershell
kubectl get deployments
```

Expected deployments:

- cake-api-gateway
- cake-catalog-service
- cake-order-service
- cake-rating-service
- cake-notification-service
- mysql
- rabbitmq

The frontend deployment should also appear if its manifest has been applied.

### 12.5 Verify Pods

```powershell
kubectl get pods
```

Expected result:

All required application pods should reach Running status and show Ready containers.

### 12.6 Verify Kubernetes Services

```powershell
kubectl get svc
```

Previously configured services include:

| Service | Type | Port |
|---|---|---|
| cake-api-gateway | NodePort | 8084 |
| cake-catalog-service | ClusterIP | 8080 |
| cake-order-service | ClusterIP | 8081 |
| cake-rating-service | ClusterIP | 8082 |
| cake-notification-service | ClusterIP | 8083 |
| mysql | ClusterIP | 3306 |
| rabbitmq | ClusterIP | 5672 |

The frontend service should also be verified if deployed.

### 12.7 Troubleshooting Commands

Describe a pod:

```powershell
kubectl describe pod POD_NAME
```

View application logs:

```powershell
kubectl logs POD_NAME
```

Check deployment status:

```powershell
kubectl rollout status deployment/DEPLOYMENT_NAME
```

Scale down all deployments:

```powershell
kubectl scale deployment --all --replicas=0
```

Scale up all deployments:

```powershell
kubectl scale deployment --all --replicas=1
```

Verify the pods again:

```powershell
kubectl get pods
```

## 13. End-to-End Verification Checklist

The following checklist can be used during the final project demonstration.

| No. | Verification | Expected Result |
|---|---|---|
| 1 | Frontend landing page | Successful |
| 2 | Login-style redirection | Successful |
| 3 | Cake catalog | Cakes displayed |
| 4 | Cake search and filtering | Working |
| 5 | Basket management | Working |
| 6 | Checkout | Order created |
| 7 | Order status update | Successful |
| 8 | Catalog Service communication | Successful |
| 9 | Rating operations | Successful |
| 10 | API Gateway routing | Successful |
| 11 | RabbitMQ order completion event | Consumed |
| 12 | RabbitMQ status change event | Consumed |
| 13 | Notification record creation | Successful |
| 14 | MySQL persistence | Verified |
| 15 | Docker image creation | Successful |
| 16 | Kubernetes deployments | Ready |
| 17 | Kubernetes services | Available |

## 14. Important Verification Notes

- Verify that each microservice uses its own database.
- Ensure RabbitMQ exchange and queue configurations match the event publisher and listener.
- Verify that notification records are created after consuming events.
- Confirm that the frontend communicates through the API Gateway.
- Confirm that the Docker image contains the latest frontend changes.
- Ensure Kubernetes deployments use the intended image versions.
- Check application logs if any service fails to start.
- Verify the complete order lifecycle before the final demonstration.

## 15. Conclusion

The end-to-end demonstration verifies the integration of the Cake Delight frontend, Spring Boot microservices, API Gateway, MySQL databases, RabbitMQ messaging, Docker containers, and Kubernetes deployment.

The application demonstrates microservices-based development, REST API communication, asynchronous event processing, database persistence, containerization, and orchestration.

This document provides a structured procedure for testing, demonstrating, and verifying the Cake Delight application.
