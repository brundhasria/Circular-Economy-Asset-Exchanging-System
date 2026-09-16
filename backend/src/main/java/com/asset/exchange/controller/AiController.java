package com.asset.exchange.controller;

import com.asset.exchange.model.Asset;
import com.asset.exchange.service.AiMatchingService;
import com.asset.exchange.service.AiValuationService;
import com.asset.exchange.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiValuationService aiValuationService;

    @Autowired
    private AiMatchingService aiMatchingService;

    @Autowired
    private AssetService assetService;

    /**
     * Sustainable Asset Valuation
     * POST /api/ai/valuate
     */
    @PostMapping("/valuate")
    public ResponseEntity<String> valuateAsset(@RequestBody Map<String, String> request) {
        String type = request.getOrDefault("type", "");
        String title = request.getOrDefault("title", "");
        String condition = request.getOrDefault("condition", "");
        String location = request.getOrDefault("location", "");

        String result = aiValuationService.evaluateAsset(type, title, condition, location);
        return ResponseEntity.ok(result);
    }

    /**
     * Smart Asset Matching
     * POST /api/ai/match
     * Body: { "query": "I need a laptop for college" }
     */
    @PostMapping("/match")
    public ResponseEntity<String> matchAssets(@RequestBody Map<String, String> request) {
        String userQuery = request.getOrDefault("query", "");
        List<Asset> allAssets = assetService.getAllAssets();
        String result = aiMatchingService.findMatches(allAssets, userQuery);
        return ResponseEntity.ok(result);
    }

    /**
     * AI Listing Description Generator
     * POST /api/ai/describe
     */
    @PostMapping("/describe")
    public ResponseEntity<String> describeAsset(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "");
        String type = request.getOrDefault("type", "");
        String condition = request.getOrDefault("condition", "");

        String result = aiValuationService.generateDescription(title, type, condition);
        return ResponseEntity.ok(result);
    }
}
