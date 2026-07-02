package com.aanchal.blogApp.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class CreateCommentRequest {
    @NotBlank(message = "Comment content is required")
    private String content;

    private Long parentId; // Optional, for replies
}