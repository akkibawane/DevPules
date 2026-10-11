package com.devpulse.repository;

import com.devpulse.model.ApiHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ApiHealthRepository extends JpaRepository<ApiHealth, Long> {
    Optional<ApiHealth> findByName(String name);
}
