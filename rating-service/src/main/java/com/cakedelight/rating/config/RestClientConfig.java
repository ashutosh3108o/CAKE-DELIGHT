package com.cakedelight.rating.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient orderServiceClient() {

        String orderServiceUrl = System.getenv().getOrDefault(
                "ORDER_SERVICE_URL",
                "http://localhost:8081"
        );

        return RestClient.builder()
                .baseUrl(orderServiceUrl)
                .build();
    }
}





//package com.cakedelight.rating.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.client.RestClient;
//
//@Configuration
//public class RestClientConfig {
//
//    @Bean
//    public RestClient orderServiceClient() {
//        String orderServiceUrl = System.getenv().getOrDefault(
//                "ORDER_SERVICE_URL",
//                "http://cake-order-service:8081"
//        );
//
//        return RestClient.builder()
//                .baseUrl(orderServiceUrl)
//                .build();
//    }
//}