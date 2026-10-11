package com.devpulse.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "build_jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pipelineName;
    private String source; // GITHUB, JENKINS
    private String buildNumber;
    private String branch;
    private String commitHash;
    private String author;
    private String status; // SUCCESS, FAILED, RUNNING
    private Integer durationSeconds;
    private LocalDateTime timestamp;
}
