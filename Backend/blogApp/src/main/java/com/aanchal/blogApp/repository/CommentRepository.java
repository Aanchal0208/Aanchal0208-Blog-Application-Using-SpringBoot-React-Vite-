package com.aanchal.blogApp.repository;

import com.aanchal.blogApp.entity.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndParentIsNull(Long postId);

    List<Comment> findByParentId(Long parentId);

    long countByUserId(Long userId);

    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<Comment> findTop5ByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    void deleteByPostId(Long id);
}