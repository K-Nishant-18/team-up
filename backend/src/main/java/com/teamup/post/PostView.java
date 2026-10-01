package com.teamup.post;

import com.teamup.user.UserView;

import java.time.Instant;
import java.util.List;

public record PostView(
        Long id,
        String title,
        String description,
        String category,
        CreatorView creator,
        List<RoleView> rolesRequired,
        List<MemberView> currentMembers,
        String status,
        Instant deadline,
        String mode,
        String eventLink,
        String externalLink,
        Instant createdAt,
        Instant updatedAt
) {
    public record CreatorView(Long id, String name, String college, List<UserView.SkillView> skills) {}
    public record RoleView(String roleName, Integer count, List<String> skills) {}
    public record MemberView(Long userId, String userName, String role, Instant joinedAt) {}

    public static PostView from(Post post) {
        CreatorView creator = null;
        if (post.getCreator() != null) {
            creator = new CreatorView(
                    post.getCreator().getId(),
                    post.getCreator().getName(),
                    post.getCreator().getCollege(),
                    post.getCreator().getSkills().stream()
                            .map(s -> new UserView.SkillView(s.getSkill(), s.getProficiency()))
                            .toList()
            );
        }
        return new PostView(
                post.getId(),
                post.getTitle(),
                post.getDescription(),
                post.getCategory() == null ? null : post.getCategory().name(),
                creator,
                post.getRolesRequired().stream()
                        .map(r -> new RoleView(r.getRoleName(), r.getCount(), r.getSkills()))
                        .toList(),
                post.getCurrentMembers().stream()
                        .map(m -> new MemberView(m.getUserId(), m.getUserName(), m.getRole(), m.getJoinedAt()))
                        .toList(),
                post.getStatus() == null ? null : post.getStatus().name(),
                post.getDeadline(),
                post.getMode() == null ? null : post.getMode().name(),
                post.getEventLink(),
                post.getExternalLink(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
