package com.teamup.request;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<JoinRequest> findByPostIdOrderByCreatedAtDesc(Long postId);
}
