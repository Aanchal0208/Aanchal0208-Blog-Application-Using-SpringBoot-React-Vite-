package com.aanchal.blogApp.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String bio;
    private String profileImage;
}