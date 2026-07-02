package com.aanchal.blogApp.serviceImpl;

import com.aanchal.blogApp.dto.CommentResponse;
import com.aanchal.blogApp.dto.CreatePostRequest;
import com.aanchal.blogApp.dto.PostResponse;
import com.aanchal.blogApp.entity.*;
import com.aanchal.blogApp.repository.*;
import com.aanchal.blogApp.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final UserRepo userRepository;

    @Override
    @Transactional
    public PostResponse createPost(CreatePostRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrls(request.getImageUrls())
                .status(request.getStatus() != null ? request.getStatus() : "PUBLISHED")
                .user(user)
                .viewCount(0)
                .likeCount(0)
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            post.setCategory(category);
        }

        Post savedPost = postRepository.save(post);
        return convertToResponse(savedPost, username);
    }

    @Override
    @Transactional  // ✅ ADD THIS
    public PostResponse getPostById(Long id, String currentUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        postRepository.incrementViewCount(id);

        return convertToResponse(post, currentUsername);
    }

    @Override
    public Page<PostResponse> getAllPosts(Pageable pageable, String currentUsername) {
        return postRepository.findByStatus("PUBLISHED", pageable)
                .map(post -> convertToResponse(post, currentUsername));
    }

    @Override
    public Page<PostResponse> getUserPosts(Long userId, Pageable pageable, String currentUsername) {
        return postRepository.findByUserId(userId, pageable)
                .map(post -> convertToResponse(post, currentUsername));
    }

    @Override
    @Transactional
    public PostResponse updatePost(Long id, CreatePostRequest request, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to update this post");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrls(request.getImageUrls());
        post.setStatus(request.getStatus() != null ? request.getStatus() : post.getStatus());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            post.setCategory(category);
        }

        Post updatedPost = postRepository.save(post);
        return convertToResponse(updatedPost, username);
    }

    @Override
    @Transactional
    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to delete this post");
        }
        // ✅ Remove associated likes and comments first
        likeRepository.deleteByPostId(id);
        commentRepository.deleteByPostId(id);

        // Then delete the post
        postRepository.delete(post);
    }

    @Override
    @Transactional
    public void toggleLike(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (likeRepository.existsByUserIdAndPostId(user.getId(), postId)) {
            // Unlike
            likeRepository.deleteByUserIdAndPostId(user.getId(), postId);
            post.setLikeCount(post.getLikeCount() - 1);
        } else {
            // Like
            Like like = Like.builder()
                    .user(user)
                    .post(post)
                    .build();
            likeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
        }
        postRepository.save(post);
    }

    // Helper: Convert Post to PostResponse
    private PostResponse convertToResponse(Post post, String currentUsername) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        if (post.getImageUrls() != null) {
            response.setImageUrls(new ArrayList<>(post.getImageUrls()));
        } else {
            response.setImageUrls(new ArrayList<>());
        }
        response.setStatus(post.getStatus());
        response.setViewCount(post.getViewCount());
        response.setLikeCount(post.getLikeCount());

        // Author
        PostResponse.AuthorDto author = new PostResponse.AuthorDto();
        author.setId(post.getUser().getId());
        author.setUsername(post.getUser().getUsername());
        author.setFullName(post.getUser().getFullName());
        author.setProfileImage(post.getUser().getProfileImage());
        response.setAuthor(author);

        // Category
        if (post.getCategory() != null) {
            PostResponse.CategoryDto category = new PostResponse.CategoryDto();
            category.setId(post.getCategory().getId());
            category.setName(post.getCategory().getName());
            response.setCategory(category);
        }

        // Check if current user liked this post
        if (currentUsername != null) {
            User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null) {
                response.setLikedByCurrentUser(
                        likeRepository.existsByUserIdAndPostId(currentUser.getId(), post.getId())
                );
            }
        }

        // Comments (only top-level, with replies)
        List<Comment> topLevelComments = commentRepository.findByPostIdAndParentIsNull(post.getId());
        response.setComments(topLevelComments.stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList()));

        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());

        return response;
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());

        CommentResponse.AuthorDto author = new CommentResponse.AuthorDto();
        author.setId(comment.getUser().getId());
        author.setUsername(comment.getUser().getUsername());
        author.setFullName(comment.getUser().getFullName());
        author.setProfileImage(comment.getUser().getProfileImage());
        response.setUser(author);

        // Replies
        response.setReplies(comment.getReplies().stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList()));

        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }

    @Override
    public long getTotalPostsCount() {
        return postRepository.count();
    }

    @Override
    public Page<PostResponse> getAllPostsForAdmin(Pageable pageable, String currentUsername) {
        Page<Post> posts = postRepository.findAll(pageable);
        return posts.map(post -> convertToResponse(post, currentUsername));
    }

    @Override
    public Page<PostResponse> getPostsByCategoryForAdmin(Long categoryId, Pageable pageable, String currentUsername) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        Page<Post> posts = postRepository.findByCategory(category, pageable);
        return posts.map(post -> convertToResponse(post, currentUsername));
    }
}