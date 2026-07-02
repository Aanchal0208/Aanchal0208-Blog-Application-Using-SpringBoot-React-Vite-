package com.aanchal.blogApp.service;

import com.aanchal.blogApp.dto.CreatePostRequest;
import com.aanchal.blogApp.dto.PostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {
    PostResponse createPost(CreatePostRequest request, String username);
    PostResponse getPostById(Long id, String currentUsername);
    Page<PostResponse> getAllPosts(Pageable pageable, String currentUsername);
    Page<PostResponse> getUserPosts(Long userId, Pageable pageable, String currentUsername);
    PostResponse updatePost(Long id, CreatePostRequest request, String username);
    void deletePost(Long id, String username);
    void toggleLike(Long postId, String username);
    long getTotalPostsCount();

    Page<PostResponse> getAllPostsForAdmin(Pageable pageable, String currentUsername);
    Page<PostResponse> getPostsByCategoryForAdmin(Long categoryId, Pageable pageable, String currentUsername);
}