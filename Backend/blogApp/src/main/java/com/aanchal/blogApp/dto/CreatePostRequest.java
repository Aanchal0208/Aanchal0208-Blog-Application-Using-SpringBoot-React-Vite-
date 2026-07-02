package com.aanchal.blogApp.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Data
public class CreatePostRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private List<String> imageUrls;
    private String status = "PUBLISHED";
    private Long categoryId;
}