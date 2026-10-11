package com.devpulse.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_health")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiHealth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String status; // HEALTHY, DEGRADED, DOWN
    private Integer latencyMs;
    private Double uptime;
    private LocalDateTime lastChecked;
}
