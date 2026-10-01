package com.teamup.user;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;
    private String college;
    private String major;
    @Column(name = "college_year")
    private String year;
    private String bio;
    private String profilePhoto;
    private String location;

    @ElementCollection
    private List<Skill> skills = new ArrayList<>();

    @ElementCollection
    private List<String> interests = new ArrayList<>();

    @Embedded
    private UserLinks links;

    @Enumerated(EnumType.STRING)
    private Availability availability = Availability.openToJoin;

    @ElementCollection
    private List<TimelineEntry> timeline = new ArrayList<>();

    private boolean verified = false;

    @Enumerated(EnumType.STRING)
    private Role role = Role.student;

    private Instant createdAt;
    private Instant updatedAt;

    public enum Availability { openToJoin, lookingForTeammates, notAvailable }
    public enum Role { student, admin }

    @Embeddable
    public static class Skill {
        private String skill;
        private String proficiency; // Beginner / Intermediate / Advanced
        public Skill() {}
        public Skill(String skill, String proficiency) { this.skill = skill; this.proficiency = proficiency; }
        public String getSkill() { return skill; }
        public void setSkill(String skill) { this.skill = skill; }
        public String getProficiency() { return proficiency; }
        public void setProficiency(String proficiency) { this.proficiency = proficiency; }
    }

    @Embeddable
    public static class UserLinks {
        private String github;
        private String linkedin;
        private String portfolio;
        private String resumeUrl;
        public String getGithub() { return github; }
        public void setGithub(String github) { this.github = github; }
        public String getLinkedin() { return linkedin; }
        public void setLinkedin(String linkedin) { this.linkedin = linkedin; }
        public String getPortfolio() { return portfolio; }
        public void setPortfolio(String portfolio) { this.portfolio = portfolio; }
        public String getResumeUrl() { return resumeUrl; }
        public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    }

    @Embeddable
    public static class TimelineEntry {
        private String type;
        private String title;
        private String role;
        private Instant date;
        private String project;
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Instant getDate() { return date; }
        public void setDate(Instant date) { this.date = date; }
        public String getProject() { return project; }
        public void setProject(String project) { this.project = project; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public List<Skill> getSkills() { return skills; }
    public void setSkills(List<Skill> skills) { this.skills = skills; }
    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }
    public UserLinks getLinks() { return links; }
    public void setLinks(UserLinks links) { this.links = links; }
    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }
    public List<TimelineEntry> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineEntry> timeline) { this.timeline = timeline; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    @PrePersist
    public void onCreate() { this.createdAt = Instant.now(); this.updatedAt = this.createdAt; }

    @PreUpdate
    public void onUpdate() { this.updatedAt = Instant.now(); }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
