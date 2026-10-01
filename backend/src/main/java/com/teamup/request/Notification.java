package com.teamup.request;

import com.teamup.post.Post;
import com.teamup.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Type type;

    private String message;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "related_post_id")
    private Post relatedPost;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "related_request_id")
    private JoinRequest relatedRequest;

    private boolean read = false;
    private Instant createdAt;
    private Instant updatedAt;

    public enum Type { joinRequest, requestAccepted, requestRejected, teamFull, newMessage }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Post getRelatedPost() { return relatedPost; }
    public void setRelatedPost(Post relatedPost) { this.relatedPost = relatedPost; }
    public JoinRequest getRelatedRequest() { return relatedRequest; }
    public void setRelatedRequest(JoinRequest relatedRequest) { this.relatedRequest = relatedRequest; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    public void onCreate() { this.createdAt = Instant.now(); this.updatedAt = this.createdAt; }

    @PreUpdate
    public void onUpdate() { this.updatedAt = Instant.now(); }
}
