package com.asset.exchange.controller;

import com.asset.exchange.model.ChatMessage;
import com.asset.exchange.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @GetMapping("/{assetId}")
    public List<ChatMessage> getMessages(@PathVariable Long assetId) {
        return chatMessageRepository.findByAssetIdOrderByTimestampAsc(assetId);
    }

    @PostMapping
    public ChatMessage sendMessage(@RequestBody ChatMessage message) {
        return chatMessageRepository.save(message);
    }
}
