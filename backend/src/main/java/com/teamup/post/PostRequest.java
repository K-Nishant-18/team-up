package com.teamup.post;

import java.time.Instant;
import java.util.List;

public record PostRequest(
        String title,
        String description,
        String category,
        List<RoleInput> rolesRequired,
        List<MemberInput> currentMembers,
        String status,
        Instant deadline,
        String mode,
        String eventLink,
        String externalLink
) {
    public record RoleInput(String roleName, Integer count, List<String> skills) {}
    public record MemberInput(Long userId, String userName, String role, Instant joinedAt) {}
}
