package com.devpulse.repository;

import com.devpulse.model.DeveloperActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeveloperActivityRepository extends JpaRepository<DeveloperActivity, Long> {
    List<DeveloperActivity> findTop15ByOrderByTimestampDesc();
}
