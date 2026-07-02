package com.aanchal.blogApp.service;

import com.aanchal.blogApp.dto.*;
import com.aanchal.blogApp.entity.User;

public interface UserService {
     User saveUser(User u);

     AuthResponse register(RegisterRequest request);
     AuthResponse login(LoginRequest request);

     User findByUsername(String username);
     User updateProfile(String username, ProfileUpdateRequest request);

     UserStatsResponse getUserStats(String username);
}