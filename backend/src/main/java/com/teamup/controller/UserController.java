package com.teamup.controller;

import com.teamup.user.User;
import com.teamup.user.UserRepository;
import com.teamup.user.UserUpdateRequest;
import com.teamup.user.UserView;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserView> list(@RequestParam(required = false) String year,
                               @RequestParam(required = false) String availability,
                               @RequestParam(required = false) String skill) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> year == null || year.equals(u.getYear()))
                .filter(u -> availability == null || availability.equalsIgnoreCase(u.getAvailability() == null ? null : u.getAvailability().name()))
                .filter(u -> skill == null || u.getSkills().stream().anyMatch(s -> s.getSkill() != null && s.getSkill().toLowerCase().contains(skill.toLowerCase())))
                .limit(100)
                .toList();
        return users.stream().map(UserView::from).toList();
    }

    @GetMapping("/me")
    public UserView me(Authentication authentication) {
        User user = findOrThrow(currentUserId(authentication));
        return UserView.from(user);
    }

    @PatchMapping("/me")
    public UserView updateMe(Authentication authentication, @RequestBody UserUpdateRequest request) {
        User user = findOrThrow(currentUserId(authentication));
        applyUpdate(user, request);
        return UserView.from(userRepository.save(user));
    }

    @GetMapping("/{id}")
    public UserView getById(@PathVariable Long id) {
        return UserView.from(findOrThrow(id));
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return id;
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void applyUpdate(User user, UserUpdateRequest request) {
        if (request.name() != null) user.setName(request.name());
        if (request.college() != null) user.setCollege(request.college());
        if (request.major() != null) user.setMajor(request.major());
        if (request.year() != null) user.setYear(request.year());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.location() != null) user.setLocation(request.location());
        if (request.availability() != null) {
            try {
                user.setAvailability(User.Availability.valueOf(request.availability()));
            } catch (IllegalArgumentException ignored) { }
        }
        if (request.skills() != null) {
            List<User.Skill> skills = new ArrayList<>();
            for (UserUpdateRequest.SkillInput input : request.skills()) {
                skills.add(new User.Skill(input.skill(), input.proficiency()));
            }
            user.setSkills(skills);
        }
        if (request.interests() != null) user.setInterests(request.interests());
        if (request.links() != null) {
            User.UserLinks links = user.getLinks() == null ? new User.UserLinks() : user.getLinks();
            if (request.links().github() != null) links.setGithub(request.links().github());
            if (request.links().linkedin() != null) links.setLinkedin(request.links().linkedin());
            if (request.links().portfolio() != null) links.setPortfolio(request.links().portfolio());
            if (request.links().resumeUrl() != null) links.setResumeUrl(request.links().resumeUrl());
            user.setLinks(links);
        }
    }
}
