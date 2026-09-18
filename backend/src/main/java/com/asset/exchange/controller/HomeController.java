package com.asset.exchange.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> getRootStatus() {
        return Map.of(
            "status", "ONLINE",
            "service", "Circular Economy Asset Exchanging System API",
            "version", "1.0.0",
            "message", "Spring Boot Backend is successfully deployed and running!",
            "endpoints", Map.of(
                "assets", "/api/assets",
                "stats", "/api/assets/stats",
                "leaderboard", "/api/assets/leaderboard"
            )
        );
    }
}
