package com.asset.exchange.controller;

import com.asset.exchange.model.Asset;
import com.asset.exchange.model.User;
import com.asset.exchange.repository.UserRepository;
import com.asset.exchange.repository.AssetRepository;
import com.asset.exchange.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssetRepository assetRepository;

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "UP", "timestamp", String.valueOf(System.currentTimeMillis())));
    }

    @GetMapping
    public List<Asset> getAssets(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String listingType,
            @RequestParam(required = false) String condition) {
        List<Asset> result = assetService.getAllAssets();
        if (type != null && !type.equals("All")) {
            result = result.stream().filter(a -> type.equals(a.getType())).collect(Collectors.toList());
        }
        if (listingType != null && !listingType.equals("All")) {
            result = result.stream().filter(a -> listingType.equals(a.getListingType())).collect(Collectors.toList());
        }
        if (condition != null) {
            result = result.stream().filter(a -> condition.equals(a.getAssetCondition())).collect(Collectors.toList());
        }
        return result;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        List<Asset> all = assetService.getAllAssets();
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", all.size());
        stats.put("available", all.stream().filter(a -> "Available".equals(a.getStatus())).count());
        stats.put("exchanged", all.stream().filter(a -> "Exchanged".equals(a.getStatus())).count());
        stats.put("sold", all.stream().filter(a -> "Sold".equals(a.getStatus())).count());
        stats.put("recycled", all.stream().filter(a -> "Recycled".equals(a.getStatus())).count());
        stats.put("donated", all.stream().filter(a -> "Donated".equals(a.getStatus())).count());
        return stats;
    }

    @PostMapping
    public ResponseEntity<?> addAsset(@RequestBody Asset asset, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        asset.setListedBy(username);
        return ResponseEntity.ok(assetService.addAsset(asset));
    }

    @PostMapping("/{id}/exchange")
    public ResponseEntity<?> exchangeAsset(@PathVariable Long id, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            return ResponseEntity.ok(assetService.exchangeAsset(id, username));
        } catch (RuntimeException e) { throw e; }
    }

    @PostMapping("/{id}/recycle")
    public ResponseEntity<?> recycleAsset(@PathVariable Long id, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Asset existing = assetRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        if (!username.equals(existing.getListedBy()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "You cannot recycle someone else's asset"));
        try {
            return ResponseEntity.ok(assetService.recycleAsset(id, username));
        } catch (RuntimeException e) { throw e; }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(@PathVariable Long id, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || !"ADMIN".equalsIgnoreCase(user.getRole()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin only");
        if (!assetRepository.existsById(id)) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        assetRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // PUT admin-only update asset image
    @PutMapping("/{id}/image")
    public ResponseEntity<?> updateAssetImage(@PathVariable Long id, @RequestBody Map<String, String> payload, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || !"ADMIN".equalsIgnoreCase(user.getRole()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin only");
        Asset asset = assetRepository.findById(id).orElse(null);
        if (asset == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        String newImage = payload.get("imageData");
        if (newImage == null) {
            newImage = payload.get("imageUrl");
        }
        asset.setImageData(newImage);
        Asset saved = assetRepository.save(asset);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/leaderboard")
    public List<Map<String, Object>> getLeaderboard() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        for (User u : users) {
            String user = u.getUsername();
            if (user == null || user.equals("Anonymous")) continue;
            int points = u.getEcoPoints() != null ? u.getEcoPoints() : 0;
            if (points > 0) {
                Map<String, Object> map = new HashMap<>();
                map.put("username", user);
                map.put("points", points);
                String badge = "Starter";
                if (points >= 200) badge = "Eco Master";
                else if (points >= 100) badge = "Circular Citizen";
                else if (points >= 50) badge = "Recycler";
                map.put("badge", badge);
                leaderboard.add(map);
            }
        }
        leaderboard.sort((m1, m2) -> Integer.compare((Integer) m2.get("points"), (Integer) m1.get("points")));
        return leaderboard;
    }
}
