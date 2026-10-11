package com.devpulse.repository;

import com.devpulse.model.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    List<Deployment> findTop10ByOrderByTimestampDesc();
    List<Deployment> findByEnvironmentOrderByTimestampDesc(String environment);
}
