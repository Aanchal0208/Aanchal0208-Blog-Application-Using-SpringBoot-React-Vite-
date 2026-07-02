package com.aanchal.blogApp.repository;

import com.aanchal.blogApp.entity.Category;
import com.aanchal.blogApp.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByUserId(Long userId, Pageable pageable);
    Page<Post> findByStatus(String status, Pageable pageable);

    @Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :postId")
    void incrementViewCount(@Param("postId") Long postId);

    Page<Post> findAll(Pageable pageable);
    Page<Post> findByCategory(Category category, Pageable pageable);

    long countByUserId(Long userId);
    @Query(value = "SELECT COALESCE(SUM(p.view_count), 0) FROM posts p WHERE p.user_id = :userId", nativeQuery = true)
    long sumViewCountByUserId(@Param("userId") Long userId);
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    List<Post> findTop5ByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
}