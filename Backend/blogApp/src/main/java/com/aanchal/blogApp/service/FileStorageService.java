package com.aanchal.blogApp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads/}")
    private String baseUploadDir;

    // ===== EXISTING METHOD (for profile images) =====
    public String storeFile(MultipartFile file, String username) throws IOException {
        // Build full directory path
        Path uploadPath = Paths.get(baseUploadDir, "profile-images");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFileName = username + "_" + UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(newFileName);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Return URL
        return "/uploads/profile-images/" + newFileName;
    }

    // ===== NEW METHOD: Store multiple post images =====
    public List<String> storePostImages(List<MultipartFile> files, String prefix) throws IOException {
        List<String> urls = new ArrayList<>();

        // Build directory path for post images
        Path uploadPath = Paths.get(baseUploadDir, "post-images");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        for (MultipartFile file : files) {
            // Validate each file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty: " + file.getOriginalFilename());
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed: " + file.getOriginalFilename());
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFileName = prefix + "_" + UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFileName);

            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Add URL to list
            urls.add("/uploads/post-images/" + newFileName);
        }

        return urls;
    }
}