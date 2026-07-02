package com.aanchal.blogApp.controller;

import com.aanchal.blogApp.dto.*;
import com.aanchal.blogApp.entity.User;
import com.aanchal.blogApp.service.FileStorageService;
import com.aanchal.blogApp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

    public AuthController(UserService userService, FileStorageService fileStorageService) {
        this.userService = userService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // Get current user profile
    @GetMapping("/profile")
        public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return ResponseEntity.ok(user);
    }

    // Update profile
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        String username = authentication.getName();
        User updatedUser = userService.updateProfile(username, request);
        return ResponseEntity.ok(updatedUser);
    }

    // Upload profile image
    @PostMapping("/upload-profile-image")
    public ResponseEntity<?> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        try {
            String username = authentication.getName();

            // ✅ Store the file
            String imageUrl = fileStorageService.storeFile(file, username);

            // ✅ Update user in database
            User user = userService.findByUsername(username);
            user.setProfileImage(imageUrl);
            userService.saveUser(user);

            // ✅ Return the full URL (with base URL)
            String fullImageUrl = "http://localhost:8080" + imageUrl;

            return ResponseEntity.ok(Map.of(
                    "imageUrl", fullImageUrl,
                    "message", "Image uploaded successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    // ========== USER STATS (NEW) ==========
    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponse> getUserStats(Authentication authentication) {
        String username = authentication.getName();
        UserStatsResponse stats = userService.getUserStats(username);
        return ResponseEntity.ok(stats);
    }
}