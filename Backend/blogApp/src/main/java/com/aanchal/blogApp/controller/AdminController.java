package com.aanchal.blogApp.controller;

import com.aanchal.blogApp.dto.PostResponse;
import com.aanchal.blogApp.entity.Category;
import com.aanchal.blogApp.entity.Comment;
import com.aanchal.blogApp.entity.User;
import com.aanchal.blogApp.repository.CategoryRepository;
import com.aanchal.blogApp.repository.CommentRepository;
import com.aanchal.blogApp.repository.UserRepo;
import com.aanchal.blogApp.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepo userRepository;
    private final CommentRepository commentRepository;
    private final CategoryRepository categoryRepository;
    private final PostService postService;

    // ========== DASHBOARD STATS ==========
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.countByRole("ROLE_USER"));
        stats.put("totalPosts", postService.getTotalPostsCount());
        stats.put("totalComments", commentRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        return ResponseEntity.ok(stats);
    }

    // ========== USERS (only ROLE_USER) ==========
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        // ✅ Only return users with role ROLE_USER (exclude admins)
        Page<User> users = userRepository.findByRole("ROLE_USER", pageable);
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // ========== COMMENTS ==========
    @GetMapping("/comments")
    public ResponseEntity<Page<Comment>> getAllComments(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(commentRepository.findAll(pageable));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        if (!commentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        commentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }

    // ========== POSTS ==========
    // ========== POSTS ==========

    @GetMapping("/posts")
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        String username = authentication.getName();
        Page<PostResponse> posts;
        if (categoryId != null) {
            posts = postService.getPostsByCategoryForAdmin(categoryId, pageable, username);
        } else {
            posts = postService.getAllPostsForAdmin(pageable, username);
        }
        return ResponseEntity.ok(posts);
    }

    // Get a single post (public or admin) – admin can view any
    @GetMapping("/posts/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        PostResponse post = postService.getPostById(id, username);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        postService.deletePost(id, username);
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }
}