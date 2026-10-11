package com.devpulse.repository;

import com.devpulse.model.BuildJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BuildJobRepository extends JpaRepository<BuildJob, Long> {
    List<BuildJob> findTop10ByOrderByTimestampDesc();
    long countByStatus(String status);
}
