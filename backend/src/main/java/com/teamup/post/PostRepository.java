package com.teamup.post;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCategoryOrderByCreatedAtDesc(Post.Category category);
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
}
