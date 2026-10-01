package com.teamup.controller;

import com.teamup.comment.Comment;
import com.teamup.comment.CommentRepository;
import com.teamup.post.Post;
import com.teamup.post.PostRepository;
import com.teamup.user.User;
import com.teamup.user.UserRepository;
import com.teamup.user.UserView;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/posts/{id}/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentController(CommentRepository commentRepository,
                             PostRepository postRepository,
                             UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<CommentView> list(@PathVariable Long id) {
        postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return commentRepository.findByPostIdOrderByCreatedAtAsc(id).stream().map(CommentView::from).toList();
    }

    @PostMapping
    public ResponseEntity<CommentView> create(Authentication authentication, @PathVariable Long id, @RequestBody Body body) {
        User author = currentUser(authentication);
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (body.body() == null || body.body().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment cannot be empty");
        }
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setBody(body.body().trim());
        return ResponseEntity.status(HttpStatus.CREATED).body(CommentView.from(commentRepository.save(comment)));
    }

    public record Body(String body) {}

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }

    public record CommentView(Long id, UserView author, String body, Instant createdAt) {
        public static CommentView from(Comment comment) {
            return new CommentView(
                    comment.getId(),
                    comment.getAuthor() == null ? null : UserView.from(comment.getAuthor()),
                    comment.getBody(),
                    comment.getCreatedAt()
            );
        }
    }
}
