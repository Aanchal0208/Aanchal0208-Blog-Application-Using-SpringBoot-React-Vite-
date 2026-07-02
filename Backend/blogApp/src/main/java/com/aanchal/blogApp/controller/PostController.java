package com.aanchal.blogApp.controller;

import com.aanchal.blogApp.dto.CommentResponse;
import com.aanchal.blogApp.dto.CreateCommentRequest;
import com.aanchal.blogApp.dto.CreatePostRequest;
import com.aanchal.blogApp.dto.PostResponse;
import com.aanchal.blogApp.entity.Post;
import com.aanchal.blogApp.entity.User;
import com.aanchal.blogApp.repository.PostRepository;
import com.aanchal.blogApp.repository.UserRepo;
import com.aanchal.blogApp.service.CommentService;
import com.aanchal.blogApp.service.FileStorageService;
import com.aanchal.blogApp.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final CommentService commentService;
    private final FileStorageService fileStorageService;

    public PostController(PostService postService, CommentService commentService, FileStorageService fileStorageService) {
        this.postService = postService;
        this.commentService = commentService;
        this.fileStorageService = fileStorageService;
    }

    // Create Post
    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestBody CreatePostRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        PostResponse response = postService.createPost(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get All Posts (with pagination)
    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        Page<PostResponse> posts = postService.getAllPosts(pageable, username);
        return ResponseEntity.ok(posts);
    }

    // Get Posts by User
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostResponse>> getUserPosts(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        Page<PostResponse> posts = postService.getUserPosts(userId, pageable, username);
        return ResponseEntity.ok(posts);
    }

    // Get Single Post (with view count increment)
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        PostResponse post = postService.getPostById(id, username);
        return ResponseEntity.ok(post);
    }

    // Update Post
    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @RequestBody CreatePostRequest request,
            Authentication authentication) {

        System.out.println(authentication);

        if(authentication == null){
            return ResponseEntity.status(401).build();
        }

        System.out.println(authentication.getName());

        return ResponseEntity.ok(
                postService.updatePost(id, request, authentication.getName())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }
        String username = authentication.getName();
        postService.deletePost(id, username);
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    // Toggle Like
    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        postService.toggleLike(id, username);
        return ResponseEntity.ok(Map.of("message", "Like toggled successfully"));
    }

    // Add Comment
    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        CommentResponse response = commentService.addComment(postId, request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get Comments for a Post
    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        List<CommentResponse> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // Delete Comment
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {
        String username = authentication.getName();
        commentService.deleteComment(commentId, username);
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }

    // Add Reply (Sub-comment)
    @PostMapping("/comments/{parentId}/replies")
    public ResponseEntity<CommentResponse> addReply(
            @PathVariable Long parentId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        CommentResponse response = commentService.addReply(parentId, request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //add image upload
    @PostMapping("/upload-images")
    public ResponseEntity<Map<String, List<String>>> uploadImages(
            @RequestParam("images") List<MultipartFile> files) {
        try {
            // Generate a unique prefix for the post (e.g., "post_" + timestamp)
            String prefix = "post_" + System.currentTimeMillis();
            List<String> urls = fileStorageService.storePostImages(files, prefix);
            return ResponseEntity.ok(Map.of("imageUrls", urls));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", List.of("Failed to upload images: " + e.getMessage())));
        }
    }
}