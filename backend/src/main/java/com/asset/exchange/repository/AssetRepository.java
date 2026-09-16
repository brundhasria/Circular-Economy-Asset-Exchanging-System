package com.asset.exchange.repository;

import com.asset.exchange.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByStatus(String status);
    List<Asset> findByType(String type);
    List<Asset> findByListingType(String listingType);
    List<Asset> findByAssetCondition(String condition);
    List<Asset> findByTypeAndListingType(String type, String listingType);
}
