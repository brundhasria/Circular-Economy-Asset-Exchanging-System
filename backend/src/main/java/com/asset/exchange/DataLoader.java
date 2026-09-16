package com.asset.exchange;

import com.asset.exchange.model.Asset;
import com.asset.exchange.model.User;
import com.asset.exchange.repository.AssetRepository;
import com.asset.exchange.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed users
        if (userRepository.count() == 0) {
            String hash = BCrypt.hashpw("password123", BCrypt.gensalt());
            userRepository.save(new User("demo", "demo@circularexchange.com", hash, java.time.LocalDate.now().toString()));
        }

        if (assetRepository.count() > 0) {
            return;
        }
        // Clear database
        assetRepository.deleteAll();

        List<Asset> sampleAssets = Arrays.asList(
            // --- Electronics ---
            createAsset("Electronics", "iPhone 13 Pro (128GB)", "Like New", "Coimbatore, Tamil Nadu", 
                        "Exchange", 45000.0, "sarah_k", "9876543210", "sarah@email.com", 
                        "12, Avinashi Road, Peelamedu", 
                        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500"),
            
            createAsset("Electronics", "Dell 24-inch SE2422H Monitor", "Good", "Chennai, Tamil Nadu", 
                        "Sell", 6500.0, "tech_guru", "8825412965", "guru@email.com", 
                        "No 4, Gandhi Street, Adyar", 
                        "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500"),
            
            createAsset("Electronics", "Logitech G502 Hero Gaming Mouse", "Good", "Coimbatore, Tamil Nadu", 
                        "Donate", null, "gamer_amit", "9443218765", "amit@email.com", 
                        "55, Trichy Road, Singanallur", 
                        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
            
            createAsset("Electronics", "Broken Samsung Front Load Motherboard", "Fair", "Madurai, Tamil Nadu", 
                        "Recycle", null, "eco_recycle_hub", "9080706050", "recycle@maduraieco.com", 
                        "E-waste Yard, Mattuthavani", 
                        "https://images.unsplash.com/photo-1601524909162-be87252be298?w=500"),
            
            createAsset("Electronics", "Kindle Paperwhite (10th Gen)", "Like New", "Bangalore, Karnataka", 
                        "Sell", 4800.0, "bookworm99", "8056784321", "reader@email.com", 
                        "Flat 302, Green Glen Layout", 
                        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),

            // --- Furniture ---
            createAsset("Furniture", "Ergonomic Office Chair with Lumbar Support", "Good", "Coimbatore, Tamil Nadu", 
                        "Exchange", 3500.0, "ramesh_coimbatore", "9894012345", "ramesh@email.com", 
                        "78, Saibaba Colony", 
                        "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500"),
            
            createAsset("Furniture", "Solid Teak Wood Dining Table (4 Seater)", "Good", "Chennai, Tamil Nadu", 
                        "Sell", 12000.0, "furniture_flip", "7358129485", "flip@email.com", 
                        "Plot 22, Velachery Link Road", 
                        "https://images.unsplash.com/photo-1530018607912-eff2df114f11?w=500"),
            
            createAsset("Furniture", "Wooden Study Desk with Drawers", "Fair", "Madurai, Tamil Nadu", 
                        "Donate", null, "jeya_mdu", "9944332211", "jeya@email.com", 
                        "15, K.K. Nagar", 
                        "https://images.unsplash.com/photo-1519219788971-8d9797e0928e?w=500"),
            
            createAsset("Furniture", "Damaged Particle Board Bookshelf", "Fair", "Bangalore, Karnataka", 
                        "Recycle", null, "green_cleaner", "9880123456", "cleanup@gmail.com", 
                        "Industrial Estate, Whitefield", 
                        "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500"),
            
            createAsset("Furniture", "Bean Bag (Extra Large, Filled)", "Like New", "Chennai, Tamil Nadu", 
                        "Exchange", 1500.0, "chill_guy", "8124567890", "chill@email.com", 
                        "T Nagar, Near Pondy Bazaar", 
                        "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500"),

            // --- Books ---
            createAsset("Books", "Core Java: Volume I Fundamentals", "Like New", "Coimbatore, Tamil Nadu", 
                        "Donate", null, "brundha_user", "9003567890", "brundha@email.com", 
                        "PSG Tech Hostel, Peelamedu", 
                        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500"),
            
            createAsset("Books", "Introduction to Algorithms (CLRS)", "Good", "Bangalore, Karnataka", 
                        "Sell", 800.0, "coder_raj", "7012345678", "raj@email.com", 
                        "HSR Layout, Sector 2", 
                        "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500"),
            
            createAsset("Books", "Atomic Habits by James Clear", "New", "Chennai, Tamil Nadu", 
                        "Exchange", 300.0, "habit_builder", "9500123456", "habits@email.com", 
                        "Anna Nagar West", 
                        "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500"),
            
            createAsset("Books", "Stack of Old Engineering Textbooks", "Fair", "Madurai, Tamil Nadu", 
                        "Recycle", null, "scrap_dealer", "9629123456", "scrap@email.com", 
                        "East Veli Street", 
                        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500"),

            // --- Bicycle ---
            createAsset("Bicycle", "Decathlon Rockrider ST100 MTB", "Good", "Bangalore, Karnataka", 
                        "Sell", 7500.0, "cyclist_varun", "9000112233", "varun@email.com", 
                        "14, Koramangala 4th Block", 
                        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500"),
            
            createAsset("Bicycle", "Hero Ranger Kids Cycle (Ages 5-8)", "Fair", "Coimbatore, Tamil Nadu", 
                        "Donate", null, "parent_prabhu", "9843098765", "prabhu@email.com", 
                        "RS Puram, West Power House Road", 
                        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500"),
            
            createAsset("Bicycle", "Firefox Target 21-Speed Hybrid Bike", "Like New", "Chennai, Tamil Nadu", 
                        "Exchange", 14000.0, "speed_demon", "9176543210", "speed@email.com", 
                        "OMR, Thoraipakkam", 
                        "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=500"),

            // --- Home Appliance ---
            createAsset("Home Appliance", "Philips Daily Collection Air Fryer", "Like New", "Chennai, Tamil Nadu", 
                        "Exchange", 4500.0, "chef_anand", "9840123456", "anand@email.com", 
                        "Mylapore, near Temple", 
                        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500"),
            
            createAsset("Home Appliance", "Bajaj Platini Room Cooler", "Good", "Madurai, Tamil Nadu", 
                        "Sell", 3000.0, "madurai_merchant", "9789123456", "merchant@email.com", 
                        "Simmakkal area", 
                        "https://images.unsplash.com/photo-1618941716939-556e076d54fb?w=500"),
            
            createAsset("Home Appliance", "Old Rusty Bajaj Electric Kettle", "Fair", "Coimbatore, Tamil Nadu", 
                        "Recycle", null, "green_cop", "9865012345", "cop@email.com", 
                        "Ramanathapuram", 
                        "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500"),

            // --- Clothing ---
            createAsset("Clothing", "Levis Men's Denim Jacket (Size L)", "Good", "Bangalore, Karnataka", 
                        "Exchange", 1200.0, "fashion_freak", "9845012345", "fashion@email.com", 
                        "Indiranagar 100 Feet Road", 
                        "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=500"),
            
            createAsset("Clothing", "Winter Woolen Sweaters (Assorted)", "Good", "Coimbatore, Tamil Nadu", 
                        "Donate", null, "charity_first", "9444012345", "charity@email.com", 
                        "Gandhipuram 3rd Street", 
                        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500"),

            // --- Others ---
            createAsset("Others", "Cosco Cricket Tennis Balls (Box of 6)", "New", "Madurai, Tamil Nadu", 
                        "Donate", null, "cricket_clb", "9994012345", "cricket@email.com", 
                        "Race Course Road", 
                        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500"),
            
            createAsset("Others", "Acoustic Guitar (Kadence) with bag", "Good", "Bangalore, Karnataka", 
                        "Sell", 2500.0, "musician_dev", "8095012345", "dev@email.com", 
                        "Electronic City Phase 1", 
                        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500")
        );

        assetRepository.saveAll(sampleAssets);
        System.out.println(">>> 24 Sample assets with high-quality, verified images loaded into H2 Database! <<<");
    }

    private Asset createAsset(String type, String title, String condition, String location, 
                             String listingType, Double value, String listedBy, 
                             String phone, String email, String address, String imageUrl) {
        Asset asset = new Asset();
        asset.setType(type);
        asset.setTitle(title);
        asset.setAssetCondition(condition);
        asset.setLocation(location);
        asset.setListingType(listingType);
        asset.setEstimatedValue(value);
        asset.setListedBy(listedBy);
        asset.setContactPhone(phone);
        asset.setContactEmail(email);
        asset.setAddress(address);
        asset.setImageData(imageUrl);
        asset.setStatus("Available");
        return asset;
    }
}
