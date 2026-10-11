package com.devpulse.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "developer_activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeveloperActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String developerName;
    private String actionType; // COMMIT, PR_MERGED, PR_OPEN, CODE_REVIEW
    private String repository;
    private String message;
    private LocalDateTime timestamp;

    @Transient
    private String timeAgo;
}
