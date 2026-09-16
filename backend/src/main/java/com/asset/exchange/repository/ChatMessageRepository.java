package com.asset.exchange.repository;

import com.asset.exchange.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByAssetIdOrderByTimestampAsc(Long assetId);
}
