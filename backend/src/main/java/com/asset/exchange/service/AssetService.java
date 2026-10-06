package com.asset.exchange.service;

import com.asset.exchange.model.Asset;
import com.asset.exchange.repository.AssetRepository;
import com.asset.exchange.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Cacheable(value = "assets")
    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public List<Asset> getAssetsByType(String type) {
        return assetRepository.findByType(type);
    }

    public List<Asset> getAssetsByListingType(String listingType) {
        return assetRepository.findByListingType(listingType);
    }

    public List<Asset> getAssetsByCondition(String condition) {
        return assetRepository.findByAssetCondition(condition);
    }

    @CacheEvict(value = "assets", allEntries = true)
    public Asset addAsset(Asset asset) {
        asset.setStatus("Available");
        if (asset.getListingType() == null || asset.getListingType().isEmpty()) {
            asset.setListingType("Exchange");
        }
        return assetRepository.save(asset);
    }

    // Optimistic Locking for concurrency protection
    @Transactional
    @CacheEvict(value = "assets", allEntries = true)
    public Asset exchangeAsset(Long id, String username) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));

        if (!"Available".equals(asset.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Asset is no longer available.");
        }

        if (username != null && username.equals(asset.getListedBy())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot claim your own asset.");
        }

        asset.setStatus("Exchanged");
        asset.setAcquiredBy(username);
        asset.setTransactionDate(java.time.LocalDate.now().toString());
        
        int points = calculatePoints(asset.getType(), asset.getAssetCondition());
        asset.setEcoPointsAwarded(points);

        String ownerUsername = asset.getListedBy();
        if (ownerUsername != null && !ownerUsername.equals("Anonymous")) {
            userRepository.findByUsername(ownerUsername).ifPresent(owner -> {
                int currentPoints = owner.getEcoPoints() != null ? owner.getEcoPoints() : 0;
                owner.setEcoPoints(currentPoints + points);
                userRepository.save(owner);
            });
        }

        return assetRepository.save(asset);
    }

    @Transactional
    @CacheEvict(value = "assets", allEntries = true)
    public Asset recycleAsset(Long id, String username) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));

        if (!"Available".equals(asset.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Asset is no longer available.");
        }

        asset.setStatus("Recycled");
        // For recycling, the original owner gets the points, but we can set acquiredBy as System or the user themselves
        asset.setAcquiredBy(username);
        asset.setTransactionDate(java.time.LocalDate.now().toString());
        
        int points = calculateRecyclePoints(asset.getType());
        asset.setEcoPointsAwarded(points);

        String ownerUsername = asset.getListedBy();
        if (ownerUsername != null && !ownerUsername.equals("Anonymous")) {
            userRepository.findByUsername(ownerUsername).ifPresent(owner -> {
                int currentPoints = owner.getEcoPoints() != null ? owner.getEcoPoints() : 0;
                owner.setEcoPoints(currentPoints + points);
                userRepository.save(owner);
            });
        }

        return assetRepository.save(asset);
    }

    private int calculatePoints(String category, String condition) {
        int points = 20; // Default Other
        if (category != null) {
            switch (category.toLowerCase()) {
                case "electronics": points = 50; break;
                case "furniture": points = 40; break;
                case "books": points = 20; break;
                case "bicycle": points = 45; break;
                case "home appliance": points = 50; break;
                case "clothing": points = 15; break;
            }
        }
        
        if (condition != null) {
            switch (condition.toLowerCase()) {
                case "new": points += 20; break;
                case "like new": points += 15; break;
                case "good": points += 10; break;
                case "fair": points += 5; break;
            }
        }
        return points;
    }

    private int calculateRecyclePoints(String category) {
        int points = 10; // Default
        if (category != null) {
            switch (category.toLowerCase()) {
                case "electronics": points = 40; break;
                case "furniture": points = 30; break;
                case "books": points = 15; break;
            }
        }
        return points;
    }
}
