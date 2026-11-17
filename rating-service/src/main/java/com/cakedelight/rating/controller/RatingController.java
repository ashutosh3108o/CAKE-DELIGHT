
package com.cakedelight.rating.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cakedelight.rating.entity.Rating;
import com.cakedelight.rating.service.RatingService;

@RestController
@RequestMapping("/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    // Submit rating
    @PostMapping
    public ResponseEntity<?> addRating(@RequestBody Rating rating) {
        try {
            return ResponseEntity.ok(
                    ratingService.addRating(rating)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // Get all ratings
    @GetMapping
    public List<Rating> getAllRatings() {
        return ratingService.getAllRatings();
    }

    // Get ratings by cake
    @GetMapping("/cake/{cakeId}")
    public List<Rating> getRatingsByCakeId(
            @PathVariable Long cakeId) {
        return ratingService.getRatingsByCakeId(cakeId);
    }

    // Get average rating
    @GetMapping("/cake/{cakeId}/average")
    public ResponseEntity<Double> getAverageRating(
            @PathVariable Long cakeId) {
        return ResponseEntity.ok(
                ratingService.getAverageRating(cakeId)
        );
    }
}
