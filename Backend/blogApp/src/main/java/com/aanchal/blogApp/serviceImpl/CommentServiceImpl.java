package com.aanchal.blogApp.serviceImpl;

import com.aanchal.blogApp.dto.CommentResponse;
import com.aanchal.blogApp.dto.CreateCommentRequest;
import com.aanchal.blogApp.entity.Comment;
import com.aanchal.blogApp.entity.Post;
import com.aanchal.blogApp.entity.User;
import com.aanchal.blogApp.repository.CommentRepository;
import com.aanchal.blogApp.repository.PostRepository;
import com.aanchal.blogApp.repository.UserRepo;
import com.aanchal.blogApp.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepo userRepository;

    @Override
    @Transactional
    public CommentResponse addComment(Long postId, CreateCommentRequest request, String username) {
        System.out.println("🔍 Adding comment: postId=" + postId + ", username=" + username + ", content=" + request.getContent());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .post(post)
                .build();

        Comment savedComment = commentRepository.save(comment);
        return convertToResponse(savedComment);
    }

    @Override
    @Transactional
    public CommentResponse addReply(Long parentId, CreateCommentRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment parentComment = commentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));

        Comment reply = Comment.builder()
                .content(request.getContent())
                .user(user)
                .post(parentComment.getPost())
                .parent(parentComment)
                .build();

        Comment savedReply = commentRepository.save(reply);
        return convertToResponse(savedReply);
    }

    @Override
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostIdAndParentIsNull(postId);
        return comments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You don't have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    // Helper: Convert to CommentResponse
    private CommentResponse convertToResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());

        CommentResponse.AuthorDto author = new CommentResponse.AuthorDto();
        author.setId(comment.getUser().getId());
        author.setUsername(comment.getUser().getUsername());
        author.setFullName(comment.getUser().getFullName());
        author.setProfileImage(comment.getUser().getProfileImage());
        response.setUser(author);

        if (comment.getReplies() != null) {
            response.setReplies(comment.getReplies().stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList()));
        } else {
            response.setReplies(new ArrayList<>());
        }

        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }
}