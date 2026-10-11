package com.devpulse.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricsSummary {
    private Double buildSuccessRate;
    private Integer totalBuilds24h;
    private Integer failedBuilds24h;
    private Integer deploysToday;
    private Integer avgLeadTimeMinutes;
    private Integer activeIncidents;
    private Integer mttrMinutes;
    private Double apiUptime;
    private Integer avgLatencyMs;
    private String redisMode; // ONLINE | EMBEDDED
}
