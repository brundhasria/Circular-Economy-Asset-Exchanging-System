package com.asset.exchange.service;

import com.asset.exchange.model.Asset;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class AiMatchingService {

    public String findMatches(List<Asset> allAssets, String userQuery) {
        try {
            if (userQuery == null || userQuery.trim().isEmpty()) {
                return "{\"matches\": [], \"summary\": \"Please provide a search query.\"}";
            }

            String queryLower = userQuery.toLowerCase();
            String[] queryWords = queryLower.split("\\s+");

            List<AssetScore> scoredAssets = new ArrayList<>();

            for (Asset asset : allAssets) {
                if ("Exchanged".equalsIgnoreCase(asset.getStatus()) || 
                    "Sold".equalsIgnoreCase(asset.getStatus()) || 
                    "Donated".equalsIgnoreCase(asset.getStatus()) || 
                    "Recycled".equalsIgnoreCase(asset.getStatus())) {
                    continue; // Skip unavailable items
                }

                int score = 0;
                String targetText = (asset.getTitle() + " " + asset.getType() + " " + asset.getDescription()).toLowerCase();
                
                for (String word : queryWords) {
                    if (word.length() > 2 && targetText.contains(word)) {
                        score += 10;
                    }
                }
                
                if (score > 0) {
                    scoredAssets.add(new AssetScore(asset, score));
                }
            }

            scoredAssets.sort((a, b) -> Integer.compare(b.score, a.score));

            StringBuilder matchesJson = new StringBuilder("[");
            int matchCount = Math.min(3, scoredAssets.size());
            for (int i = 0; i < matchCount; i++) {
                Asset asset = scoredAssets.get(i).asset;
                matchesJson.append("{\"id\": ").append(asset.getId())
                           .append(", \"reason\": \"Matches your keywords! Condition is ")
                           .append(asset.getAssetCondition()).append(".\"}");
                if (i < matchCount - 1) {
                    matchesJson.append(", ");
                }
            }
            matchesJson.append("]");

            String summary = matchCount > 0 
                ? "Found " + matchCount + " great sustainable matches for you! Buying used helps reduce your carbon footprint."
                : "No exact matches found right now, but check back soon as new items are added daily!";

            return "{\"matches\": " + matchesJson.toString() + ", \"summary\": \"" + summary + "\"}";

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"matches\": [], \"summary\": \"Smart matching unavailable right now.\"}";
        }
    }

    private static class AssetScore {
        Asset asset;
        int score;
        AssetScore(Asset asset, int score) {
            this.asset = asset;
            this.score = score;
        }
    }
}
