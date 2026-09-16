package com.asset.exchange.model;

import jakarta.persistence.*;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;          // Electronics, Furniture, etc.
    private String title;
    private String assetCondition;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status;        // Available, Exchanged, Sold, Recycled, Donated
    private Double estimatedValue;
    private String listedBy;
    private String acquiredBy;    // Username of the customer who bought/exchanged/claimed it

    // Multi-action marketplace
    private String listingType;   // Exchange, Sell, Recycle, Donate

    private Integer ecoPointsAwarded = 0;
    private String transactionDate;

    // Address for pickup/exchange
    @Column(length = 500)
    private String address;

    // Contact details
    private String contactPhone;
    private String contactEmail;

    // Image as base64 or URL
    @Column(columnDefinition = "TEXT")
    private String imageData;

    // Concurrency control (Module 4)
    @Version
    private Integer version;

    public Asset() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAssetCondition() { return assetCondition; }
    public void setAssetCondition(String assetCondition) { this.assetCondition = assetCondition; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(Double estimatedValue) { this.estimatedValue = estimatedValue; }

    public String getListedBy() { return listedBy; }
    public void setListedBy(String listedBy) { this.listedBy = listedBy; }

    public String getAcquiredBy() { return acquiredBy; }
    public void setAcquiredBy(String acquiredBy) { this.acquiredBy = acquiredBy; }

    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public Integer getEcoPointsAwarded() { return ecoPointsAwarded; }
    public void setEcoPointsAwarded(Integer ecoPointsAwarded) { this.ecoPointsAwarded = ecoPointsAwarded; }

    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }
}
