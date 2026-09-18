package com.asset.exchange.controller;

import com.asset.exchange.model.User;
import com.asset.exchange.repository.UserRepository;
import com.asset.exchange.security.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username already exists"));
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }

        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());
        User newUser = new User(request.getUsername(), request.getEmail(), hashedPassword, LocalDate.now().toString());
        
        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AuthRequest request) {
        // Try username first, then fallback to email if we wanted to (keeping simple with username for now)
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            // Check if they tried to login with email
            userOpt = userRepository.findByEmail(request.getUsername());
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (BCrypt.checkpw(request.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getUsername());
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("role", user.getRole());
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }

    // Small helper class for the request body
    public static class AuthRequest {
        private String username;
        private String email;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
