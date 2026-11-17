package com.cakedelight.order.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.cakedelight.order.entity.Order;
import com.cakedelight.order.entity.OrderItem;
import com.cakedelight.order.entity.CakeResponse;
import com.cakedelight.order.exception.CakeNotFoundException;
import com.cakedelight.order.repository.OrderItemRepository;
import com.cakedelight.order.repository.OrderRepository;
import com.cakedelight.order.event.OrderCompletedEvent;
import com.cakedelight.order.event.OrderEventPublisher;
import com.cakedelight.order.event.OrderStatusChangedEvent;

@Service
public class OrderService {

    private final RestClient restClient;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderEventPublisher orderEventPublisher;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            OrderEventPublisher orderEventPublisher) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderEventPublisher = orderEventPublisher;

        this.restClient = RestClient.builder()
                .baseUrl(System.getenv().getOrDefault(
                        "CATALOG_SERVICE_URL",
                        "http://localhost:8080"
                ))
                .build();
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

    public Order createOrder(Order order) {

        // Check whether cake exists in Catalog Service
        try {
            restClient.get()
                    .uri("/cakes/{id}", order.getCakeId())
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {
            throw new CakeNotFoundException(
                    "Cake not found in Catalog Service"
            );
        }

        order.setStatus("PLACED");

        return orderRepository.save(order);
    }

    // =========================================================
    // GET ALL ORDERS
    // =========================================================

    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    public Order getOrderById(Long id) {

        return orderRepository.findById(id)
                .orElse(null);
    }

    // =========================================================
    // UPDATE ORDER
    // =========================================================

    public Order updateOrder(Long id, Order order) {

        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        existingOrder.setCustomerName(order.getCustomerName());
        existingOrder.setCakeId(order.getCakeId());
        existingOrder.setQuantity(order.getQuantity());
        existingOrder.setTotalPrice(order.getTotalPrice());

        return orderRepository.save(existingOrder);
    }

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    public Order updateOrderStatus(Long id, String newStatus) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        String currentStatus = order.getStatus();

        boolean validTransition =
                ("PLACED".equals(currentStatus)
                        && ("CONFIRMED".equals(newStatus)
                        || "CANCELLED".equals(newStatus)))

                || ("CONFIRMED".equals(currentStatus)
                        && ("PREPARING".equals(newStatus)
                        || "CANCELLED".equals(newStatus)))

                || ("PREPARING".equals(currentStatus)
                        && "OUT_FOR_DELIVERY".equals(newStatus))

                || ("OUT_FOR_DELIVERY".equals(currentStatus)
                        && "DELIVERED".equals(newStatus));

        if (!validTransition) {
            throw new RuntimeException(
                    "Invalid order status transition: "
                            + currentStatus + " -> " + newStatus
            );
        }

        // Save the new status
        order.setStatus(newStatus);

        Order savedOrder = orderRepository.save(order);

        // Publish status-change event to RabbitMQ
        OrderStatusChangedEvent event =
                new OrderStatusChangedEvent(
                        savedOrder.getId(),
                        savedOrder.getCustomerName(),
                        currentStatus,
                        newStatus
                );

        orderEventPublisher.publishOrderStatusChanged(event);

        return savedOrder;
    }

    // =========================================================
    // DELETE ORDER
    // =========================================================

    public void deleteOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        orderRepository.delete(order);
    }

    // =========================================================
    // BASKET - ADD ITEM
    // =========================================================

    public OrderItem addToBasket(OrderItem item) {

        // Verify order exists
        orderRepository.findById(item.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        // Check whether cake exists
        try {
            restClient.get()
                    .uri("/cakes/{id}", item.getCakeId())
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {
            throw new CakeNotFoundException(
                    "Cake not found in Catalog Service"
            );
        }

        return orderItemRepository.save(item);
    }

    // =========================================================
    // VIEW BASKET
    // =========================================================

    public List<OrderItem> getBasket(Long orderId) {

        orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        return orderItemRepository.findByOrderId(orderId);
    }

    // =========================================================
    // UPDATE BASKET ITEM
    // =========================================================

    public OrderItem updateBasketItem(
            Long itemId,
            OrderItem item) {

        OrderItem existingItem =
                orderItemRepository.findById(itemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Basket item not found"
                                ));

        existingItem.setCakeId(item.getCakeId());
        existingItem.setQuantity(item.getQuantity());

        return orderItemRepository.save(existingItem);
    }

    // =========================================================
    // REMOVE BASKET ITEM
    // =========================================================

    public void removeFromBasket(Long itemId) {

        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Basket item not found"
                        ));

        orderItemRepository.delete(item);
    }

    // =========================================================
    // CHECKOUT
    // =========================================================

    public Order checkout(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        List<OrderItem> items =
                orderItemRepository.findByOrderId(orderId);

        if (items.isEmpty()) {
            throw new RuntimeException("Basket is empty");
        }

        double total = 0.0;

        // Calculate total from Catalog Service
        for (OrderItem item : items) {

            try {
                CakeResponse cake = restClient.get()
                        .uri("/cakes/{id}", item.getCakeId())
                        .retrieve()
                        .body(CakeResponse.class);

                if (cake == null || cake.getPrice() == null) {
                    throw new RuntimeException(
                            "Cake price not found"
                    );
                }

                total += cake.getPrice() * item.getQuantity();

            } catch (Exception e) {
                throw new CakeNotFoundException(
                        "Cake not found in Catalog Service"
                );
            }
        }

        order.setTotalPrice(total);
        order.setStatus("CONFIRMED");

        Order savedOrder = orderRepository.save(order);

        // Publish Order Completed Event
        OrderCompletedEvent event =
                new OrderCompletedEvent(
                        savedOrder.getId(),
                        savedOrder.getCustomerName(),
                        savedOrder.getTotalPrice(),
                        savedOrder.getStatus()
                );

        orderEventPublisher.publishOrderCompleted(event);

        return savedOrder;
    }
}
