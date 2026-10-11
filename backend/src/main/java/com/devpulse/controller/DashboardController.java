package com.devpulse.controller;

import com.devpulse.model.*;
import com.devpulse.repository.*;
import com.devpulse.service.EventProcessingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DashboardController {

    private final EventProcessingService eventProcessingService;
    private final DeploymentRepository deploymentRepository;
    private final BuildJobRepository buildJobRepository;
    private final ApiHealthRepository apiHealthRepository;
    private final IncidentRepository incidentRepository;
    private final DeveloperActivityRepository activityRepository;

    @GetMapping("/metrics/summary")
    public ResponseEntity<MetricsSummary> getSummary() {
        return ResponseEntity.ok(eventProcessingService.calculateMetricsSummary());
    }

    @GetMapping("/dashboard/bootstrap")
    public ResponseEntity<Map<String, Object>> getBootstrapData() {
        Map<String, Object> data = new HashMap<>();
        data.put("metrics", eventProcessingService.calculateMetricsSummary());
        data.put("deployments", deploymentRepository.findTop10ByOrderByTimestampDesc());
        data.put("builds", buildJobRepository.findTop10ByOrderByTimestampDesc());
        data.put("services", apiHealthRepository.findAll());
        data.put("incidents", incidentRepository.findTop10ByOrderByCreatedAtDesc());
        data.put("activities", activityRepository.findTop15ByOrderByTimestampDesc());
        return ResponseEntity.ok(data);
    }

    @PostMapping("/incidents/{id}/resolve")
    public ResponseEntity<Incident> resolveIncident(@PathVariable Long id) {
        Incident resolved = eventProcessingService.resolveIncident(id);
        if (resolved != null) {
            return ResponseEntity.ok(resolved);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/deployments/{id}/rollback")
    public ResponseEntity<Deployment> rollbackDeployment(@PathVariable Long id) {
        return deploymentRepository.findById(id).map(d -> {
            d.setStatus("ROLLED_BACK");
            Deployment saved = deploymentRepository.save(d);
            eventProcessingService.broadcastUpdatedMetrics();
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
