package com.devpulse.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deployments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private String environment; // production, staging, canary
    private String version;
    private String deployedBy;
    private String commitHash;
    private String status; // IN_PROGRESS, DEPLOYED, ROLLED_BACK, FAILED
    private Integer durationSeconds;
    private LocalDateTime timestamp;

    @Transient
    private String timeAgo;
}
