package com.aanchal.blogApp.service;

import com.aanchal.blogApp.dto.CommentResponse;
import com.aanchal.blogApp.dto.CreateCommentRequest;
import java.util.List;

public interface CommentService {
    CommentResponse addComment(Long postId, CreateCommentRequest request, String username);
    CommentResponse addReply(Long parentId, CreateCommentRequest request, String username);
    List<CommentResponse> getCommentsByPostId(Long postId);
    void deleteComment(Long commentId, String username);
}