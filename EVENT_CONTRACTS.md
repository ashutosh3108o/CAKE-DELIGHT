# Cake Delight — RabbitMQ Event Contracts

## 1. Introduction

Cake Delight uses RabbitMQ for asynchronous communication between the Order Service and Notification Service.

The Order Service publishes events when an order is completed or when its status changes.

The Notification Service listens for these events, processes the received messages, generates notification records, and stores them in its MySQL database.

This event-driven architecture reduces direct dependency between the Order Service and Notification Service.

## 2. Event-Driven Architecture Overview

The project uses the following communication flow:

```text
          ORDER SERVICE
                |
                |
         Order Event Publisher
                |
                |
          RabbitTemplate
                |
                v
          order.exchange
                |
          +-----+------+
          |            |
          v            v
    order.completed   order.status.changed
       routing key       routing key
          |            |
          v            v
    Completed Queue   Status Changed Queue
          |            |
          v            v
          NOTIFICATION SERVICE
                |
          RabbitMQ Listener
                |
                v
        Notification Service
                |
                v
          MySQL Database
```

## 3. RabbitMQ Configuration

The project uses the following RabbitMQ exchange and routing configurations.

### 3.1 Exchange

| Property | Value |
|---|---|
| Exchange Name | `order.exchange` |
| Exchange Type | Verify against RabbitMQ configuration |
| Publisher | Order Service |
| Consumers | Notification Service |

### 3.2 Routing Keys and Queues

| Event | Routing Key | Queue |
|---|---|---|
| Order Completed | `order.completed` | `order.completed.queue` |
| Order Status Changed | `order.status.changed` | `order.status.changed.queue` |

The Order Service publishes messages using the configured exchange and routing keys.

The Notification Service consumes messages from their respective queues using RabbitMQ listeners.

## 4. Order Completed Event

### 4.1 Event Class

Class Name:

`OrderCompletedEvent.java`

Package:

`com.cakedelight.order.event`

The event is generated when an order is successfully processed during checkout.

### 4.2 Event Payload

The event contains the following fields:

| Field | Data Type | Description |
|---|---|---|
| orderId | Long | Unique order identifier |
| customerName | String | Customer name |
| totalPrice | Double | Total order price |
| status | String | Current order status |

### 4.3 Example JSON Payload

```json
{
  "orderId": 1,
  "customerName": "Vikas",
  "totalPrice": 1000.0,
  "status": "CONFIRMED"
}
```

### 4.4 Event Publishing

The Order Service uses the `OrderEventPublisher` class to publish the completed-order event.

Method:

`publishOrderCompleted(OrderCompletedEvent event)`

Implementation:

```java
public void publishOrderCompleted(OrderCompletedEvent event) {
    rabbitTemplate.convertAndSend(
        "order.exchange",
        "order.completed",
        event
    );
}
```

The RabbitTemplate converts the event object into a message and sends it to RabbitMQ.

### 4.5 Event Consumption

The Notification Service consumes the event through the `NotificationEventListener` class.

Listener:

```java
@RabbitListener(queues = "order.completed.queue")
public void handleOrderCompleted(OrderCompletedEvent event) {

    Notification notification = new Notification();

    notification.setOrderId(event.getOrderId());
    notification.setCustomerName(event.getCustomerName());

    notification.setMessage(
        "Order " + event.getOrderId()
        + " completed successfully."
    );

    notification.setStatus("SENT");
    notification.setAttemptCount(1);

    notificationService.saveNotification(notification);
}
```

### 4.6 Processing Flow

1. Customer completes checkout.
2. Order Service saves the order.
3. OrderCompletedEvent is created.
4. Order Event Publisher publishes the event.
5. RabbitMQ receives the event.
6. Message is routed to `order.completed.queue`.
7. Notification Service consumes the event.
8. A notification record is created.
9. Notification is saved in the Notification Database.

## 5. Order Status Changed Event

### 5.1 Event Class

Class Name:

`OrderStatusChangedEvent.java`

Package:

`com.cakedelight.order.event`

This event is generated whenever an order status is successfully updated.

### 5.2 Event Payload

Based on the publisher and listener implementation, the event contains:

| Field | Data Type | Description |
|---|---|---|
| orderId | Long | Unique order identifier |
| customerName | String | Customer name |
| oldStatus | String | Previous order status |
| newStatus | String | Updated order status |

### 5.3 Example JSON Payload

```json
{
  "orderId": 1,
  "customerName": "Vikas",
  "oldStatus": "CONFIRMED",
  "newStatus": "PREPARING"
}
```

### 5.4 Event Publishing

The Order Service publishes the status-change event through the `OrderEventPublisher` class.

Method:

`publishOrderStatusChanged(OrderStatusChangedEvent event)`

Implementation:

```java
public void publishOrderStatusChanged(
        OrderStatusChangedEvent event) {

    rabbitTemplate.convertAndSend(
        "order.exchange",
        "order.status.changed",
        event
    );
}
```

### 5.5 Event Consumption

The Notification Service consumes the status-change event using the following listener:

```java
@RabbitListener(
    queues = "order.status.changed.queue"
)
public void handleOrderStatusChanged(
        OrderStatusChangedEvent event) {

    Notification notification = new Notification();

    notification.setOrderId(event.getOrderId());
    notification.setCustomerName(event.getCustomerName());

    notification.setMessage(
        "Order " + event.getOrderId()
        + " status changed from "
        + event.getOldStatus()
        + " to "
        + event.getNewStatus()
    );

    notification.setStatus("SENT");
    notification.setAttemptCount(1);

    notificationService.saveNotification(notification);
}
```

### 5.6 Processing Flow

1. Customer's order status is updated.
2. Order Service validates the status transition.
3. Updated order is saved in MySQL.
4. OrderStatusChangedEvent is generated.
5. Event Publisher sends the event to RabbitMQ.
6. RabbitMQ routes the message to `order.status.changed.queue`.
7. Notification Service consumes the message.
8. A notification message is generated using the old and new statuses.
9. Notification record is stored in the Notification Database.

## 6. Event Publisher Architecture

Class Name:

`OrderEventPublisher.java`

Package:

`com.cakedelight.order.event`

The publisher is responsible for sending order-related events to RabbitMQ.

It uses Spring AMQP's `RabbitTemplate`.

### Publisher Responsibilities

- Publish order completion events.
- Publish order status change events.
- Send messages to the configured exchange.
- Use routing keys to identify the event type.

### Publishing Methods

| Method | Event | Routing Key |
|---|---|---|
| `publishOrderCompleted()` | OrderCompletedEvent | `order.completed` |
| `publishOrderStatusChanged()` | OrderStatusChangedEvent | `order.status.changed` |

## 7. Notification Event Listener

Class Name:

`NotificationEventListener.java`

Package:

`com.cakedelight.notification.listener`

The listener is responsible for consuming RabbitMQ messages.

It uses the Spring AMQP `@RabbitListener` annotation.

### Listener Responsibilities

- Listen to the completed-order queue.
- Listen to the order-status-change queue.
- Receive event payloads.
- Generate notification messages.
- Save notification records.
- Maintain notification status and attempt count.

### Listener Mapping

| Listener Method | Queue |
|---|---|
| `handleOrderCompleted()` | `order.completed.queue` |
| `handleOrderStatusChanged()` | `order.status.changed.queue` |

## 8. Notification Database Structure

The Notification Service uses the `Notification` entity to store notification information.

Table Name:

`notifications`

### Entity Fields

| Field | Data Type | Description |
|---|---|---|
| id | Long | Primary key |
| orderId | Long | Related order ID |
| customerName | String | Customer name |
| message | String | Notification message |
| status | String | Notification status |
| attemptCount | Integer | Number of recorded attempts |

### Example Stored Notification

```json
{
  "id": 1,
  "orderId": 1,
  "customerName": "Vikas",
  "message": "Order 1 completed successfully.",
  "status": "SENT",
  "attemptCount": 1
}
```

## 9. Notification Retrieval APIs

The Notification Service provides REST endpoints to retrieve stored notification records.

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | Retrieve all notifications |
| GET | `/notifications/{id}` | Retrieve notification by ID |
| GET | `/notifications/order/{orderId}` | Retrieve notifications for an order |

These endpoints are accessible through the API Gateway.

Example:

```powershell
curl.exe http://localhost:8084/notifications

curl.exe http://localhost:8084/notifications/1

curl.exe http://localhost:8084/notifications/order/1
```

## 10. Event Verification

The following tests were performed to verify RabbitMQ event processing.

### Test 1: Order Completion

After completing checkout, the Notification Service received the order completion event.

Expected notification:

```text
Order 1 completed successfully.
```

### Test 2: Order Status Change

The order status was updated through the API Gateway.

Example commands:

```powershell
Invoke-RestMethod -Uri "http://localhost:8084/orders/1/status?status=PREPARING" -Method PUT

Invoke-RestMethod -Uri "http://localhost:8084/orders/1/status?status=OUT_FOR_DELIVERY" -Method PUT

Invoke-RestMethod -Uri "http://localhost:8084/orders/1/status?status=DELIVERED" -Method PUT
```

The Notification Service generated messages for the status transitions.

### Test 3: Retrieve Order Notifications

```powershell
curl.exe http://localhost:8084/notifications/order/1
```

Observed result:

- One order completion notification.
- One notification for CONFIRMED to PREPARING.
- One notification for PREPARING to OUT_FOR_DELIVERY.
- One notification for OUT_FOR_DELIVERY to DELIVERED.

The notification records were successfully retrieved through the API Gateway.

## 11. Reliability Considerations

The Notification Service configuration includes RabbitMQ listener retry settings.

The configured properties include:

```properties
spring.rabbitmq.listener.simple.retry.enabled=true
spring.rabbitmq.listener.simple.retry.max-attempts=3
spring.rabbitmq.listener.simple.retry.initial-interval=1000
spring.rabbitmq.listener.simple.retry.multiplier=2
spring.rabbitmq.listener.simple.retry.max-interval=10000

spring.rabbitmq.listener.simple.default-requeue-rejected=false
```

These settings configure retry behavior for listener processing failures.

The configuration also disables automatic requeuing of rejected messages.

Note: A complete production-grade reliability implementation would additionally require verification of dead-letter handling, publisher confirms, persistent message delivery, and duplicate-event protection. These are not claimed as implemented features here.

## 12. Conclusion

RabbitMQ provides asynchronous communication between the Order Service and Notification Service in Cake Delight.

The project implements two main event types:

1. OrderCompletedEvent
2. OrderStatusChangedEvent

The Order Service publishes these events through RabbitTemplate, and the Notification Service consumes them using RabbitMQ listeners.

The received events are converted into notification records and stored in the Notification Database.

This implementation demonstrates event-driven microservices communication using Spring Boot, Spring AMQP, RabbitMQ, and MySQL.