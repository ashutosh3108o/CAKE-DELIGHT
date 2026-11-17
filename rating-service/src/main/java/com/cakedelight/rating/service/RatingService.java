
package com.cakedelight.rating.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.cakedelight.rating.entity.Rating;
import com.cakedelight.rating.repository.RatingRepository;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RestClient orderServiceClient;

    public RatingService(
            RatingRepository ratingRepository,
            RestClient orderServiceClient) {

        this.ratingRepository = ratingRepository;
        this.orderServiceClient = orderServiceClient;
    }

    // Submit rating
    public Rating addRating(Rating rating) {

        if (rating.getCakeId() == null) {
            throw new RuntimeException("Cake ID is required");
        }

        if (rating.getOrderId() == null) {
            throw new RuntimeException("Order ID is required");
        }

        if (rating.getCustomerName() == null ||
                rating.getCustomerName().isBlank()) {
            throw new RuntimeException("Customer name is required");
        }

        if (rating.getRating() == null ||
                rating.getRating() < 1 ||
                rating.getRating() > 5) {
            throw new RuntimeException(
                    "Rating must be between 1 and 5");
        }

        // Verify order
        OrderResponse order = orderServiceClient
                .get()
                .uri("/orders/{id}", rating.getOrderId())
                .retrieve()
                .body(OrderResponse.class);

        if (order == null) {
            throw new RuntimeException("Order not found");
        }

        // Check delivery status
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException(
                    "Cake can be rated only after delivery");
        }

        // Verify cake belongs to order
        OrderItemResponse[] items = orderServiceClient
                .get()
                .uri("/orders/basket/{orderId}", rating.getOrderId())
                .retrieve()
                .body(OrderItemResponse[].class);

        boolean cakeExists = false;

        if (items != null) {
            for (OrderItemResponse item : items) {

                if (item.getCakeId() != null &&
                        item.getCakeId().equals(rating.getCakeId())) {

                    cakeExists = true;
                    break;
                }
            }
        }

        if (!cakeExists) {
            throw new RuntimeException(
                    "Cake was not purchased in this order");
        }

        // Prevent duplicate ratings
        if (ratingRepository.existsByOrderIdAndCakeId(
                rating.getOrderId(),
                rating.getCakeId())) {

            throw new RuntimeException(
                    "This cake has already been rated for this order");
        }

        return ratingRepository.save(rating);
    }

    // Get all ratings
    public List<Rating> getAllRatings() {
        return ratingRepository.findAll();
    }

    // Get ratings by cake
    public List<Rating> getRatingsByCakeId(Long cakeId) {
        return ratingRepository.findByCakeId(cakeId);
    }

    // Calculate average rating
    public double getAverageRating(Long cakeId) {

        List<Rating> ratings =
                ratingRepository.findByCakeId(cakeId);

        if (ratings.isEmpty()) {
            return 0.0;
        }

        return ratings.stream()
                .mapToInt(Rating::getRating)
                .average()
                .orElse(0.0);
    }

    // Order response
    public static class OrderResponse {

        private Long id;
        private String status;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    // Order item response
    public static class OrderItemResponse {

        private Long id;
        private Long orderId;
        private Long cakeId;
        private Integer quantity;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }

        public Long getCakeId() {
            return cakeId;
        }

        public void setCakeId(Long cakeId) {
            this.cakeId = cakeId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
