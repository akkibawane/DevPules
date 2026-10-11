package com.devpulse.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String severity; // SEV-1, SEV-2, SEV-3
    private String status; // OPEN, ACKNOWLEDGED, MITIGATING, RESOLVED
    private String affectedService;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @Transient
    private String timeAgo;
}
