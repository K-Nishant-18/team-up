package com.teamup.user;

import java.time.Instant;
import java.util.List;

public record UserView(
        Long id,
        String name,
        String email,
        String college,
        String major,
        String year,
        String bio,
        String profilePhoto,
        String location,
        List<SkillView> skills,
        List<String> interests,
        LinksView links,
        String availability,
        List<TimelineView> timeline,
        boolean verified,
        String role,
        Instant createdAt,
        Instant updatedAt
) {
    public record SkillView(String skill, String proficiency) {}
    public record LinksView(String github, String linkedin, String portfolio, String resumeUrl) {}
    public record TimelineView(String type, String title, String role, Instant date, String project) {}

    public static UserView from(User user) {
        return new UserView(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege(),
                user.getMajor(),
                user.getYear(),
                user.getBio(),
                user.getProfilePhoto(),
                user.getLocation(),
                user.getSkills().stream()
                        .map(s -> new SkillView(s.getSkill(), s.getProficiency()))
                        .toList(),
                user.getInterests(),
                user.getLinks() == null ? null
                        : new LinksView(user.getLinks().getGithub(), user.getLinks().getLinkedin(),
                        user.getLinks().getPortfolio(), user.getLinks().getResumeUrl()),
                user.getAvailability() == null ? null : user.getAvailability().name(),
                user.getTimeline().stream()
                        .map(t -> new TimelineView(t.getType(), t.getTitle(), t.getRole(), t.getDate(), t.getProject()))
                        .toList(),
                user.isVerified(),
                user.getRole() == null ? null : user.getRole().name(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
