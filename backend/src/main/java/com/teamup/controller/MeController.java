package com.teamup.controller;

import com.teamup.request.JoinRequest;
import com.teamup.request.JoinRequestRepository;
import com.teamup.request.Notification;
import com.teamup.request.NotificationRepository;
import com.teamup.post.Post;
import com.teamup.post.PostRepository;
import com.teamup.post.PostView;
import com.teamup.user.User;
import com.teamup.user.UserRepository;
import com.teamup.user.UserView;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final NotificationRepository notificationRepository;

    public MeController(UserRepository userRepository,
                        PostRepository postRepository,
                        JoinRequestRepository joinRequestRepository,
                        NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/posts")
    public List<PostView> myPosts(Authentication authentication) {
        User me = currentUser(authentication);
        return postRepository.findByCreatorIdOrderByCreatedAtDesc(me.getId())
                .stream().map(PostView::from).toList();
    }

    @GetMapping("/received-requests")
    public List<JoinRequestController.JoinRequestView> receivedRequests(Authentication authentication) {
        User me = currentUser(authentication);
        List<Long> myPostIds = postRepository.findByCreatorIdOrderByCreatedAtDesc(me.getId())
                .stream().map(Post::getId).toList();
        if (myPostIds.isEmpty()) return List.of();
        return myPostIds.stream()
                .flatMap(pid -> joinRequestRepository.findByPostIdOrderByCreatedAtDesc(pid).stream())
                .filter(r -> r.getStatus() == JoinRequest.Status.pending)
                .map(JoinRequestController.JoinRequestView::from)
                .toList();
    }

    @GetMapping("/notifications")
    public List<NotificationView> notifications(Authentication authentication) {
        User me = currentUser(authentication);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId())
                .stream().map(NotificationView::from).toList();
    }

    @PatchMapping("/notifications/read")
    public Map<String, Object> markAllRead(Authentication authentication) {
        User me = currentUser(authentication);
        int count = 0;
        for (Notification n : notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId())) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
                count++;
            }
        }
        return Map.of("updated", count);
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }

    public record NotificationView(Long id, String type, String message,
                                   Long postId, Long requestId, boolean read, Instant createdAt) {
        public static NotificationView from(Notification n) {
            return new NotificationView(
                    n.getId(),
                    n.getType() == null ? null : n.getType().name(),
                    n.getMessage(),
                    n.getRelatedPost() == null ? null : n.getRelatedPost().getId(),
                    n.getRelatedRequest() == null ? null : n.getRelatedRequest().getId(),
                    n.isRead(),
                    n.getCreatedAt()
            );
        }
    }
}
