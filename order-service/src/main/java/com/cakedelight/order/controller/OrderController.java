package com.cakedelight.order.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cakedelight.order.entity.Order;
import com.cakedelight.order.entity.OrderItem;
import com.cakedelight.order.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // CREATE ORDER
    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody Order order) {
        try {
            return ResponseEntity.ok(
                    orderService.createOrder(order));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET ALL ORDERS
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(
                orderService.getAllOrders());
    }

    // GET ORDER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long id) {

        Order order = orderService.getOrderById(id);

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(order);
    }

    // UPDATE ORDER
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(
            @PathVariable Long id,
            @RequestBody Order order) {
        try {
            return ResponseEntity.ok(
                    orderService.updateOrder(id, order));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE ORDER
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(
            @PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok(
                    "Order deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Order not found");
        }
    }

    // ADD ITEM TO BASKET
    @PostMapping("/basket")
    public ResponseEntity<OrderItem> addToBasket(
            @RequestBody OrderItem item) {
        try {
            return ResponseEntity.ok(
                    orderService.addToBasket(item));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // VIEW BASKET
    @GetMapping("/basket/{orderId}")
    public ResponseEntity<List<OrderItem>> getBasket(
            @PathVariable Long orderId) {
        try {
            return ResponseEntity.ok(
                    orderService.getBasket(orderId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // UPDATE BASKET ITEM
    @PutMapping("/basket/item/{itemId}")
    public ResponseEntity<OrderItem> updateBasketItem(
            @PathVariable Long itemId,
            @RequestBody OrderItem item) {
        try {
            return ResponseEntity.ok(
                    orderService.updateBasketItem(itemId, item));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // REMOVE BASKET ITEM
    @DeleteMapping("/basket/item/{itemId}")
    public ResponseEntity<String> removeFromBasket(
            @PathVariable Long itemId) {
        try {
            orderService.removeFromBasket(itemId);
            return ResponseEntity.ok(
                    "Basket item removed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // UPDATE ORDER STATUS
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            return ResponseEntity.ok(
                    orderService.updateOrderStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // CHECKOUT
    @PostMapping("/checkout/{orderId}")
    public ResponseEntity<Order> checkout(
            @PathVariable Long orderId) {
        try {
            return ResponseEntity.ok(
                    orderService.checkout(orderId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
