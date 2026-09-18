package com.asset.exchange.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private Integer ecoPoints = 0;
    private String createdAt;
    private String role = "USER"; // USER or ADMIN

    public User() {}

    public User(String username, String email, String password, String createdAt) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.ecoPoints = 0;
        this.role = "USER";
    }

    public User(String username, String email, String password, String createdAt, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.ecoPoints = 0;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Integer getEcoPoints() { return ecoPoints; }
    public void setEcoPoints(Integer ecoPoints) { this.ecoPoints = ecoPoints; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
