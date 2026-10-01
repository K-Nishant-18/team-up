package com.teamup.controller;

import com.teamup.post.Post;
import com.teamup.post.PostRepository;
import com.teamup.post.PostView;
import com.teamup.request.JoinRequest;
import com.teamup.request.JoinRequestRepository;
import com.teamup.request.Notification;
import com.teamup.request.NotificationRepository;
import com.teamup.user.User;
import com.teamup.user.UserRepository;
import com.teamup.user.UserView;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class JoinRequestController {

    private final JoinRequestRepository joinRequestRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public JoinRequestController(JoinRequestRepository joinRequestRepository,
                                 PostRepository postRepository,
                                 UserRepository userRepository,
                                 NotificationRepository notificationRepository) {
        this.joinRequestRepository = joinRequestRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    public record JoinBody(String role, String message) {}

    @PostMapping("/posts/{id}/join")
    public ResponseEntity<JoinRequestView> submit(Authentication authentication, @PathVariable Long id, @RequestBody JoinBody body) {
        User requester = currentUser(authentication);
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (post.getCreator() != null && post.getCreator().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot request to join your own post");
        }

        boolean alreadyRequested = joinRequestRepository.findByRequesterIdOrderByCreatedAtDesc(requester.getId()).stream()
                .anyMatch(r -> r.getPost() != null && r.getPost().getId().equals(id) && r.getStatus() == JoinRequest.Status.pending);
        if (alreadyRequested) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a pending request for this post");
        }

        JoinRequest request = new JoinRequest();
        request.setPost(post);
        request.setRequester(requester);
        request.setRole(body.role());
        request.setMessage(body.message());
        request.setStatus(JoinRequest.Status.pending);
        request = joinRequestRepository.save(request);

        if (post.getCreator() != null) {
            notify(post.getCreator(), Notification.Type.joinRequest,
                    requester.getName() + " requested to join " + post.getTitle(),
                    post, request);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(JoinRequestView.from(request));
    }

    @GetMapping("/posts/{id}/requests")
    public List<JoinRequestView> listForPost(Authentication authentication, @PathVariable Long id) {
        Post post = currentOwnerPost(authentication, id);
        return joinRequestRepository.findByPostIdOrderByCreatedAtDesc(post.getId())
                .stream().map(JoinRequestView::from).toList();
    }

    @PatchMapping("/posts/{id}/requests/{requestId}")
    public JoinRequestView respond(Authentication authentication,
                                   @PathVariable Long id,
                                   @PathVariable Long requestId,
                                   @RequestBody Map<String, String> body) {
        Post post = currentOwnerPost(authentication, id);
        String action = body.getOrDefault("action", "");
        if (!action.equals("accept") && !action.equals("reject")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "action must be 'accept' or 'reject'");
        }

        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        if (request.getPost() == null || !request.getPost().getId().equals(post.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found on this post");
        }
        if (request.getStatus() != JoinRequest.Status.pending) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This request has already been responded to");
        }

        if (action.equals("accept")) {
            request.setStatus(JoinRequest.Status.accepted);
            addMember(post, request);
            postRepository.save(post);
            if (request.getRequester() != null) {
                notify(request.getRequester(), Notification.Type.requestAccepted,
                        "You joined " + post.getTitle(), post, request);
            }
        } else {
            request.setStatus(JoinRequest.Status.rejected);
            if (request.getRequester() != null) {
                notify(request.getRequester(), Notification.Type.requestRejected,
                        "Your request to join " + post.getTitle() + " was not selected", post, request);
            }
        }
        request.setRespondedAt(Instant.now());
        return JoinRequestView.from(joinRequestRepository.save(request));
    }

    @GetMapping("/me/requests")
    public List<JoinRequestView> mine(Authentication authentication) {
        User me = currentUser(authentication);
        return joinRequestRepository.findByRequesterIdOrderByCreatedAtDesc(me.getId())
                .stream().map(JoinRequestView::from).toList();
    }

    private void addMember(Post post, JoinRequest request) {
        List<Post.Member> members = post.getCurrentMembers();
        if (members == null) members = new java.util.ArrayList<>();
        if (request.getRequester() != null && members.stream().noneMatch(m -> request.getRequester().getId().equals(m.getUserId()))) {
            Post.Member member = new Post.Member();
            member.setUserId(request.getRequester().getId());
            member.setUserName(request.getRequester().getName());
            member.setRole(request.getRole());
            member.setJoinedAt(Instant.now());
            members.add(member);
            post.setCurrentMembers(members);
        }
    }

    private void notify(User user, Notification.Type type, String message, Post post, JoinRequest request) {
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setMessage(message);
        n.setRelatedPost(post);
        n.setRelatedRequest(request);
        n.setRead(false);
        notificationRepository.save(n);
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }

    private Post currentOwnerPost(Authentication authentication, Long postId) {
        User me = currentUser(authentication);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (post.getCreator() == null || !post.getCreator().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the post creator can manage requests");
        }
        return post;
    }

    public record JoinRequestView(Long id, PostView post, UserView requester, String role, String message,
                                  String status, Instant createdAt, Instant respondedAt) {
        public static JoinRequestView from(JoinRequest r) {
            return new JoinRequestView(
                    r.getId(),
                    r.getPost() == null ? null : PostView.from(r.getPost()),
                    r.getRequester() == null ? null : UserView.from(r.getRequester()),
                    r.getRole(),
                    r.getMessage(),
                    r.getStatus() == null ? null : r.getStatus().name(),
                    r.getCreatedAt(),
                    r.getRespondedAt()
            );
        }
    }
}
