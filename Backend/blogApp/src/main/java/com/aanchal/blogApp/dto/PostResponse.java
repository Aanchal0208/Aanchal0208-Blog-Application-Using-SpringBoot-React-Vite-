package com.aanchal.blogApp.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private List<String> imageUrls;
    private String status;
    private Integer viewCount;
    private Integer likeCount;
    private Boolean likedByCurrentUser;
    private AuthorDto author;
    private CategoryDto category;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class AuthorDto {
        private Long id;
        private String username;
        private String fullName;
        private String profileImage;
    }

    @Data
    public static class CategoryDto {
        private Long id;
        private String name;
    }
}