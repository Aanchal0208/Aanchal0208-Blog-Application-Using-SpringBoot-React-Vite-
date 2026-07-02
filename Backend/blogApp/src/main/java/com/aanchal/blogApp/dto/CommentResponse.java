package com.aanchal.blogApp.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private AuthorDto user;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;

    @Data
    public static class AuthorDto {
        private Long id;
        private String username;
        private String fullName;
        private String profileImage;
    }
}