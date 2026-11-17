
package com.cakedelight.rating.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cakedelight.rating.entity.Rating;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    // Get ratings for a particular cake
    List<Rating> findByCakeId(Long cakeId);

    // Check whether this order has already rated this cake
    boolean existsByOrderIdAndCakeId(
            Long orderId,
            Long cakeId
    );
}
