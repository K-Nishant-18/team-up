package com.teamup.controller;

import com.teamup.post.Post;
import com.teamup.post.PostRepository;
import com.teamup.post.PostRequest;
import com.teamup.post.PostRole;
import com.teamup.post.PostView;
import com.teamup.user.User;
import com.teamup.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostController(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<PostView> list(@RequestParam(required = false) String category,
                               @RequestParam(required = false) String search,
                               @RequestParam(required = false) String mode,
                               @RequestParam(required = false) String status) {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .filter(p -> category == null || category.equalsIgnoreCase(p.getCategory() == null ? null : p.getCategory().name()))
                .filter(p -> mode == null || mode.equalsIgnoreCase(p.getMode() == null ? null : p.getMode().name()))
                .filter(p -> status == null || status.equalsIgnoreCase(p.getStatus() == null ? null : p.getStatus().name()))
                .filter(p -> search == null || search.isBlank()
                        || (p.getTitle() != null && p.getTitle().toLowerCase().contains(search.toLowerCase()))
                        || (p.getDescription() != null && p.getDescription().toLowerCase().contains(search.toLowerCase())))
                .map(PostView::from)
                .toList();
    }

    @GetMapping("/recommended")
    public List<PostView> recommended(Authentication authentication) {
        Set<String> mySkills = new HashSet<>();
        if (authentication != null && authentication.getPrincipal() instanceof Long uid) {
            userRepository.findById(uid).ifPresent(u -> u.getSkills().stream()
                    .filter(s -> s.getSkill() != null)
                    .forEach(s -> mySkills.add(s.getSkill().toLowerCase())));
        }
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        Set<String> skills = mySkills;
        List<PostView> views = posts.stream()
                .map(PostView::from)
                .sorted((a, b) -> {
                    if (skills.isEmpty()) return 0;
                    int sa = score(a, skills);
                    int sb = score(b, skills);
                    return Integer.compare(sb, sa);
                })
                .toList();
        return views;
    }

    private int score(PostView post, Set<String> skills) {
        if (skills.isEmpty()) return 0;
        int total = 0;
        if (post.rolesRequired() != null) {
            for (PostView.RoleView role : post.rolesRequired()) {
                if (role.skills() == null) continue;
                for (String skill : role.skills()) {
                    if (skills.contains(skill.toLowerCase())) total++;
                }
            }
        }
        return total;
    }

    @GetMapping("/{id}")
    public PostView getById(@PathVariable Long id) {
        return PostView.from(findOrThrow(id));
    }

    @PostMapping
    public ResponseEntity<PostView> create(Authentication authentication, @RequestBody PostRequest request) {
        User creator = userRepository.findById(currentUserId(authentication))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        if (request.title() == null || request.title().isBlank()
                || request.description() == null || request.description().isBlank()
                || request.category() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title, description, and category are required");
        }
        Post post = new Post();
        post.setTitle(request.title());
        post.setDescription(request.description());
        post.setCategory(parseEnum(Post.Category.class, request.category()));
        post.setCreator(creator);
        applyPostFields(post, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(PostView.from(postRepository.save(post)));
    }

    @PatchMapping("/{id}")
    public PostView update(Authentication authentication, @PathVariable Long id, @RequestBody PostRequest request) {
        Post post = findOrThrow(id);
        Long userId = currentUserId(authentication);
        if (post.getCreator() == null || !post.getCreator().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator can edit this post");
        }
        if (request.title() != null) post.setTitle(request.title());
        if (request.description() != null) post.setDescription(request.description());
        if (request.category() != null) post.setCategory(parseEnum(Post.Category.class, request.category()));
        applyPostFields(post, request);
        return PostView.from(postRepository.save(post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        Post post = findOrThrow(id);
        Long userId = currentUserId(authentication);
        if (post.getCreator() == null || !post.getCreator().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator can delete this post");
        }
        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    private void applyPostFields(Post post, PostRequest request) {
        if (request.deadline() != null) post.setDeadline(request.deadline());
        if (request.mode() != null) post.setMode(parseEnum(Post.Mode.class, request.mode()));
        if (request.status() != null) post.setStatus(parseEnum(Post.Status.class, request.status()));
        if (request.eventLink() != null) post.setEventLink(request.eventLink());
        if (request.externalLink() != null) post.setExternalLink(request.externalLink());
        if (request.rolesRequired() != null) {
            List<PostRole> roles = new ArrayList<>();
            for (PostRequest.RoleInput input : request.rolesRequired()) {
                PostRole role = new PostRole();
                role.setPost(post);
                role.setRoleName(input.roleName());
                role.setCount(input.count());
                role.setSkills(input.skills() == null ? new ArrayList<>() : input.skills());
                roles.add(role);
            }
            post.setRolesRequired(roles);
        }
        if (request.currentMembers() != null) {
            List<Post.Member> members = new ArrayList<>();
            for (PostRequest.MemberInput input : request.currentMembers()) {
                Post.Member member = new Post.Member();
                member.setUserId(input.userId());
                member.setUserName(input.userName());
                member.setRole(input.role());
                member.setJoinedAt(input.joinedAt() == null ? java.time.Instant.now() : input.joinedAt());
                members.add(member);
            }
            post.setCurrentMembers(members);
        }
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return id;
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value) {
        for (E constant : enumClass.getEnumConstants()) {
            if (constant.name().equalsIgnoreCase(value)) {
                return constant;
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid value: " + value);
    }

    private Post findOrThrow(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }
}
