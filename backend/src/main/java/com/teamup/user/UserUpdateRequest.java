package com.teamup.user;

import java.util.List;

public record UserUpdateRequest(
        String name,
        String college,
        String major,
        String year,
        String bio,
        String location,
        String availability,
        List<SkillInput> skills,
        List<String> interests,
        LinksInput links
) {
    public record SkillInput(String skill, String proficiency) {}
    public record LinksInput(String github, String linkedin, String portfolio, String resumeUrl) {}
}
