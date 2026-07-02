package com.aanchal.blogApp.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    @NotBlank
    private String usernameOrEmail; // can be either

    @NotBlank
    private String password;
}