package com.aanchal.blogApp.serviceImpl;

import com.aanchal.blogApp.dto.*;
import com.aanchal.blogApp.entity.Comment;
import com.aanchal.blogApp.entity.Post;
import com.aanchal.blogApp.entity.User;
import com.aanchal.blogApp.repository.CommentRepository;
import com.aanchal.blogApp.repository.LikeRepository;
import com.aanchal.blogApp.repository.PostRepository;
import com.aanchal.blogApp.repository.UserRepo;
import com.aanchal.blogApp.security.JwtUtil; // we'll create this
import com.aanchal.blogApp.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public UserServiceImpl(UserRepo userRepo,PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtUtil jwtUtil, LikeRepository likeRepository, PostRepository postRepository, CommentRepository commentRepository) {
        this.userRepo = userRepo;
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    // Your existing method (unchanged)
    @Override
    public User saveUser(User u) {
        return userRepo.save(u);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepo.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))  // hash it
                .fullName(request.getFullName())
                .bio(request.getBio())
                .role(request.getRole() != null ? request.getRole() : "ROLE_USER")
                .profileImage(request.getProfileImage())
                .enabled(true)
                .build();

        User saved = userRepo.save(user);

        // We don't generate token here; client should call login after registration.
        return new AuthResponse(null, "Bearer", user.getId(), user.getUsername(),
                user.getEmail(), user.getFullName(), user.getRole(), user.getBio(), user.getProfileImage(), user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Try to find user by username or email
        User user = userRepo.findByUsername(request.getUsernameOrEmail())
                .orElseGet(() -> userRepo.findByEmail(request.getUsernameOrEmail())
                        .orElseThrow(() -> new RuntimeException("Invalid credentials")));

        // Authenticate using Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());

        return new AuthResponse(token, "Bearer", user.getId(), user.getUsername(),
                user.getEmail(), user.getFullName(), user.getRole(), user.getBio(), user.getProfileImage(), user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
    }

    @Override
    public User findByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    @Transactional
    public User updateProfile(String username, ProfileUpdateRequest request) {
        User user = findByUsername(username);
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        return userRepo.save(user);
    }

    @Override
    public UserStatsResponse getUserStats(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalPosts = postRepository.countByUserId(user.getId());
        long totalViews = postRepository.sumViewCountByUserId(user.getId());
        long totalLikes = likeRepository.countByUserId(user.getId());
        long totalComments = commentRepository.countByUserId(user.getId());

        List<UserStatsResponse.RecentActivity> activities = new ArrayList<>();
        PageRequest top5 = PageRequest.of(0, 5);

        List<Post> recentPosts = postRepository.findTop5ByUserIdOrderByCreatedAtDesc(user.getId(), top5);
        for (Post p : recentPosts) {
            activities.add(new UserStatsResponse.RecentActivity(
                    "📝 Created", p.getTitle(), timeAgo(p.getCreatedAt()), p.getId()
            ));
        }

        List<Comment> recentComments = commentRepository.findTop5ByUserIdOrderByCreatedAtDesc(user.getId(), top5);
        for (Comment c : recentComments) {
            activities.add(new UserStatsResponse.RecentActivity(
                    "💬 Commented", c.getPost().getTitle(), timeAgo(c.getCreatedAt()), c.getPost().getId()
            ));
        }

        // Sort by time (newest first) and limit to 5
        activities.sort((a, b) -> a.getTimeAgo().compareTo(b.getTimeAgo())); // adjust if needed
        List<UserStatsResponse.RecentActivity> limited = activities.stream().limit(5).collect(Collectors.toList());

        return new UserStatsResponse(totalPosts, totalViews, totalLikes, totalComments, limited);
    }

    private String timeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " min ago";
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        if (hours < 24) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        long days = ChronoUnit.DAYS.between(dateTime, now);
        return days + " day" + (days > 1 ? "s" : "") + " ago";
    }
}