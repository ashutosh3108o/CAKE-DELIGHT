# Cake Delight – API Documentation

## 1. Introduction

This document describes the REST APIs implemented in the Cake Delight Microservices Application.

The application uses Spring Cloud Gateway as a centralized entry point for frontend requests. The Gateway routes incoming requests to the appropriate backend microservice.

**Base URL:**

```text
http://localhost:8084
```

## 2. API Gateway Routing

| Service | Base API Path | Port |
|---|---|---:|
| Catalog Service | `/cakes` | 8080 |
| Order Service | `/orders` | 8081 |
| Rating Service | `/ratings` | 8082 |
| Notification Service | `/notifications` | 8083 |

All API requests can be accessed through the API Gateway using port `8084`.

---

## 3. Catalog Service APIs

**Service Port:** `8080`

**Base URL:** `http://localhost:8084/cakes`

The Catalog Service manages cake information, including cake details, pricing, availability, and filtering.

| HTTP Method | Endpoint | Description |
|---|---|---|
| POST | `/cakes` | Add a new cake |
| GET | `/cakes` | Retrieve all cakes |
| GET | `/cakes/{id}` | Retrieve cake by ID |
| PUT | `/cakes/{id}` | Update cake information |
| DELETE | `/cakes/{id}` | Delete a cake |
| GET | `/cakes/filter/name?name={name}` | Filter cakes by name |
| GET | `/cakes/filter/category?category={category}` | Filter cakes by category |
| GET | `/cakes/filter/price?minPrice={min}&maxPrice={max}` | Filter cakes by price range |

### Example Requests

**Get all cakes**

```http
GET http://localhost:8084/cakes
```

**Get cake by ID**

```http
GET http://localhost:8084/cakes/1
```

**Add a new cake**

```http
POST http://localhost:8084/cakes
```

**Update cake**

```http
PUT http://localhost:8084/cakes/1
```

**Delete cake**

```http
DELETE http://localhost:8084/cakes/1
```

**Filter by name**

```http
GET http://localhost:8084/cakes/filter/name?name=Chocolate
```

**Filter by category**

```http
GET http://localhost:8084/cakes/filter/category?category=Birthday
```

**Filter by price**

```http
GET http://localhost:8084/cakes/filter/price?minPrice=500&maxPrice=1500
```

---

## 4. Order Service APIs

**Service Port:** `8081`

**Base URL:** `http://localhost:8084/orders`

The Order Service manages shopping basket operations, checkout, order creation, and order status tracking.

### Update Order Status

| HTTP Method | Endpoint | Description |
|---|---|---|
| PUT | `/orders/{id}/status?status={status}` | Update an existing order's status |

**Example Request**

```http
PUT http://localhost:8084/orders/1/status?status=PREPARING
```

Other status values tested in the order lifecycle include:

- `CONFIRMED`
- `PREPARING`
- `OUT_FOR_DELIVERY`
- `DELIVERED`

The implementation also supports `CANCELLED` for permitted status transitions.

### Order Status Lifecycle

```text
PLACED
   |
   v
CONFIRMED
   |
   v
PREPARING
   |
   v
OUT_FOR_DELIVERY
   |
   v
DELIVERED
```

Order status changes are published as RabbitMQ events so that the Notification Service can process them.

---

## 5. Rating Service APIs

**Service Port:** `8082`

**Base URL:** `http://localhost:8084/ratings`

The Rating Service manages cake ratings and customer reviews.

Its API endpoint details and request examples should be added from the implemented RatingController.

---

## 6. Notification Service APIs

**Service Port:** `8083`

**Base URL:** `http://localhost:8084/notifications`

The Notification Service retrieves notification records generated from order-related RabbitMQ events.

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | Retrieve all notifications |
| GET | `/notifications/{id}` | Retrieve notification by ID |
| GET | `/notifications/order/{orderId}` | Retrieve notifications for a particular order |

### Example Requests

**Get all notifications**

```http
GET http://localhost:8084/notifications
```

**Get notification by ID**

```http
GET http://localhost:8084/notifications/1
```

**Get notifications by order ID**

```http
GET http://localhost:8084/notifications/order/1
```

### Example Response

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

Notification records are created when the Notification Service consumes the corresponding RabbitMQ events.

---

## 7. HTTP Methods Used

| HTTP Method | Purpose |
|---|---|
| GET | Retrieve resources |
| POST | Create new resources |
| PUT | Update existing resources |
| DELETE | Remove resources |

## 8. API Testing

The Cake Delight REST APIs can be tested using Postman or command-line HTTP requests.

**Example using PowerShell:**

```powershell
Invoke-RestMethod `
-Uri "http://localhost:8084/cakes" `
-Method GET
```

**Example: Update Order Status**

```powershell
Invoke-RestMethod `
-Uri "http://localhost:8084/orders/1/status?status=PREPARING" `
-Method PUT
```

**Example: Retrieve Notifications**

```powershell
curl.exe http://localhost:8084/notifications/order/1
```

## 9. Service Ports Reference

| Component | Port |
|---|---:|
| Catalog Service | 8080 |
| Order Service | 8081 |
| Rating Service | 8082 |
| Notification Service | 8083 |
| API Gateway | 8084 |
| MySQL | 3306 |
| RabbitMQ | 5672 |
| RabbitMQ Management UI | 15672 |

## 10. Conclusion

The Cake Delight API architecture provides centralized access to independent microservices through Spring Cloud Gateway.

Each service manages its own business functionality, while RabbitMQ enables asynchronous communication between the Order Service and Notification Service.

The REST APIs support the core application operations, including cake management, order processing, ratings, and notification retrieval.