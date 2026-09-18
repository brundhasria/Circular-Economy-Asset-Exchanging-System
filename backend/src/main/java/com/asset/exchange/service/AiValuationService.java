package com.asset.exchange.service;

import org.springframework.stereotype.Service;
import java.util.Random;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class AiValuationService {

    private final Random random = new Random();

    public String evaluateAsset(String type, String title, String condition, String location) {
        String apiKey = System.getenv("GCP_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("No GCP_API_KEY found. Falling back to heuristic valuation.");
            return fallbackEvaluateAsset(type, title, condition, location);
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
            
            String prompt = String.format("Estimate the fair market resale value in INR for a used '%s' (Category: %s) in '%s' condition located in %s. Return only a strict JSON object with two fields: 'estimatedValue' (an integer) and 'reasoning' (a short 1-sentence string explaining why). Do not include any markdown formatting like ```json.", title, type, condition, location);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // properly escape quotes in the prompt
            String escapedPrompt = prompt.replace("\"", "\\\"");
            String requestBody = "{\"contents\": [{\"parts\": [{\"text\": \"" + escapedPrompt + "\"}]}]}";
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response.getBody());
            String textResponse = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            // Clean up accidental markdown
            if (textResponse.contains("```json")) {
                textResponse = textResponse.replace("```json", "").replace("```", "").trim();
            } else if (textResponse.contains("```")) {
                textResponse = textResponse.replace("```", "").trim();
            }
            
            // verify it parses as JSON before returning
            mapper.readTree(textResponse);
            
            return textResponse;
            
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Gemini API call failed. Falling back to heuristic valuation.");
            return fallbackEvaluateAsset(type, title, condition, location);
        }
    }

    private String fallbackEvaluateAsset(String type, String title, String condition, String location) {
        try {
            int baseValue = 1000;
            switch (type.toLowerCase()) {
                case "electronics": baseValue = 12000; break;
                case "furniture": baseValue = 5000; break;
                case "clothing": baseValue = 800; break;
                case "books": baseValue = 300; break;
                case "bicycle": baseValue = 4000; break;
                case "home appliance":
                case "appliances": baseValue = 8000; break;
                default: baseValue = 1500; break;
            }

            double conditionMultiplier = 1.0;
            switch (condition.toLowerCase()) {
                case "new": conditionMultiplier = 1.25; break;
                case "like new": conditionMultiplier = 1.15; break;
                case "good": conditionMultiplier = 0.95; break;
                case "fair": conditionMultiplier = 0.65; break;
                case "poor": conditionMultiplier = 0.35; break;
            }

            // Location premium (Metros have higher demand / value)
            double locationMultiplier = 1.0;
            if (location != null) {
                String loc = location.toLowerCase();
                if (loc.contains("chennai") || loc.contains("bangalore") || loc.contains("mumbai") || 
                    loc.contains("delhi") || loc.contains("hyderabad") || loc.contains("kolkata") || loc.contains("pune")) {
                    locationMultiplier = 1.10;
                }
            }

            // Title-based premium adjustments (brand names, premium materials, newer specs)
            double premiumMultiplier = 1.0;
            if (title != null) {
                String t = title.toLowerCase();
                if (t.contains("pro") || t.contains("max") || t.contains("ultra") || 
                    t.contains("teak") || t.contains("leather") || t.contains("silk") || 
                    t.contains("premium") || t.contains("iphone") || t.contains("macbook") || 
                    t.contains("ipad") || t.contains("sony") || t.contains("samsung") || t.contains("nike")) {
                    premiumMultiplier = 1.25;
                }
            }

            // Age heuristic based on title content
            double ageMultiplier = 1.0;
            if (title != null) {
                String t = title.toLowerCase();
                if (t.contains("2025") || t.contains("2026") || t.contains("latest")) {
                    ageMultiplier = 1.15;
                } else if (t.contains("2023") || t.contains("2024") || t.contains("1 year") || t.contains("1 yr")) {
                    ageMultiplier = 0.90;
                } else if (t.contains("2021") || t.contains("2022") || t.contains("2 years") || t.contains("2 yr") || t.contains("2 yrs")) {
                    ageMultiplier = 0.75;
                } else if (t.contains("2019") || t.contains("2020") || t.contains("3 years") || t.contains("3 yr") || t.contains("3 yrs") || t.contains("old")) {
                    ageMultiplier = 0.60;
                } else if (t.contains("vintage") || t.contains("ancient")) {
                    ageMultiplier = 0.50;
                }
            }

            // Add some randomness (+/- 12%) so it doesn't give the exact same value
            double randomFactor = 0.88 + (0.24 * random.nextDouble());
            
            int finalValue = (int) (baseValue * conditionMultiplier * locationMultiplier * premiumMultiplier * ageMultiplier * randomFactor);
            finalValue = Math.max(100, Math.round(finalValue / 50.0f) * 50); // Round to nearest 50

            String[] reasons = {
                "Reusing this " + type.toLowerCase() + " saves significant carbon emissions compared to manufacturing a new one.",
                "Excellent sustainable choice! Keeping this " + title + " in circulation reduces landfill waste.",
                "By choosing this instead of buying new, you're helping conserve raw materials and energy.",
                "A fair market price for a " + condition.toLowerCase() + " condition item in " + location + ". Great for the circular economy!"
            };
            String reason = reasons[random.nextInt(reasons.length)];

            return "{\"estimatedValue\": " + finalValue + ", \"reasoning\": \"" + reason + "\"}";
            
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"estimatedValue\": 1000, \"reasoning\": \"Sustainable choice for the environment.\"}";
        }
    }

    public String generateDescription(String title, String type, String condition) {
        try {
            String cond = condition.toLowerCase();
            String tName = title;
            String cat = type.toLowerCase();
            
            String description = "";
            int choice = random.nextInt(2); // 2 variations per bucket

            if (cat.contains("electronics")) {
                if (cond.equals("new") || cond.equals("like new")) {
                    if (choice == 0) {
                        description = String.format("Top-tier sustainable tech! This premium %s %s is in outstanding condition, offering like-new performance while preventing tech waste. Perfect for eco-conscious users seeking reliability.", cond, tName);
                    } else {
                        description = String.format("Upgrade your setup responsibly! Experience excellent performance with this %s %s. Reusing high-quality electronics directly prevents toxic e-waste.", cond, tName);
                    }
                } else {
                    if (choice == 0) {
                        description = String.format("A fully functional, budget-friendly %s in %s condition. A great sustainable option for daily tasks without paying premium retail prices.", tName, cond);
                    } else {
                        description = String.format("Keep electronic waste low by choosing this pre-loved %s. Renders reliable service in %s condition. Circular economy tech at its best!", tName, cond);
                    }
                }
            } else if (cat.contains("furniture")) {
                if (cond.equals("new") || cond.equals("like new")) {
                    if (choice == 0) {
                        description = String.format("Add style to your space sustainably! This %s %s is in pristine condition. Excellent craftsmanship, ready to elevate your home layout immediately.", cond, tName);
                    } else {
                        description = String.format("Beautiful and eco-friendly! This %s %s offers modern aesthetics without the ecological footprint of buying brand new furniture.", cond, tName);
                    }
                } else {
                    if (choice == 0) {
                        description = String.format("A comfortable and reliable %s in %s condition. Minor cosmetic wear but completely sturdy, presenting a perfect option for students or budget decorators.", tName, cond);
                    } else {
                        description = String.format("Give this sturdy %s a second life. In %s condition, it is solid and ready to serve your household for many more years.", tName, cond);
                    }
                }
            } else if (cat.contains("bicycle")) {
                if (cond.equals("new") || cond.equals("like new")) {
                    if (choice == 0) {
                        description = String.format("Ride green! This high-performance %s %s is in pristine shape, perfect for zero-emission commuting. Gear up for your next adventure sustainably.", cond, tName);
                    } else {
                        description = String.format("Outstanding quality %s %s. It is in like-new condition, offering a smooth ride and an active lifestyle while supporting eco-friendly transport.", cond, tName);
                    }
                } else {
                    if (choice == 0) {
                        description = String.format("Perfect for daily errands! This reliable %s is in %s condition, fully tuned and ready to ride. A great alternative to buying new.", tName, cond);
                    } else {
                        description = String.format("Cycle responsibly! Choose this pre-owned %s. In %s condition, it delivers great performance for your urban commutes.", tName, cond);
                    }
                }
            } else if (cat.contains("book")) {
                if (choice == 0) {
                    description = String.format("Expand your library sustainably! Grab this copy of '%s' in %s condition. Perfect for avid readers who want to share knowledge without paper waste.", tName, cond);
                } else {
                    description = String.format("A fantastic read! This book '%s' is looking for a new home. Reusing books is the ultimate way to conserve paper and resources.", tName);
                }
            } else if (cat.contains("appliance")) {
                if (choice == 0) {
                    description = String.format("Save energy and resources! This %s %s is in %s condition, fully tested and highly efficient. A smart choice for your modern sustainable household.", cond, tName, cond);
                } else {
                    description = String.format("Reduce your carbon footprint! This dependable %s is in %s condition, ready to assist with your daily chores reliably.", tName, cond);
                }
            } else if (cat.contains("clothing")) {
                if (choice == 0) {
                    description = String.format("Sustainable fashion choice! This stylish %s %s is in %s condition. Stay fashionable while fighting fast fashion and landfill accumulation.", cond, tName, cond);
                } else {
                    description = String.format("Eco-friendly wardrobe upgrade! This pre-loved %s is in %s condition. Clean, comfortable, and perfect for sustainable dressing.", tName, cond);
                }
            } else { // default / others
                if (choice == 0) {
                    description = String.format("A great addition to your circular lifestyle! This %s is in %s condition and ready for a new owner. Join the zero-waste movement today.", tName, cond);
                } else {
                    description = String.format("Give this %s a second life. Still in %s condition, it has plenty of value left to offer to any home.", tName, cond);
                }
            }

            return "{\"description\": \"" + description + "\"}";
            
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"description\": \"This is a fantastic " + condition.toLowerCase() + " " + title + " looking for a new home!\"}";
        }
    }
}
