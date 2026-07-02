package com.aanchal.blogApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {
    private long totalPosts;
    private long totalViews;
    private long totalLikes;
    private long totalComments;
    private List<RecentActivity> recentActivities;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String type;      // "📝 Created", "💬 Commented", etc.
        private String title;
        private String timeAgo;
        private Long postId;
    }
}