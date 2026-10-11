package com.devpulse.controller;

import com.devpulse.model.*;
import com.devpulse.service.EventProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/simulation")
@RequiredArgsConstructor
@Slf4j
public class SimulationController {

    private final EventProcessingService eventProcessingService;
    private final Random random = new Random();

    private final List<String> services = List.of("api-gateway", "auth-service", "payment-service", "order-processing", "notification-service");
    private final List<String> devs = List.of("alex-dev", "sarah-ops", "marcus-fin", "elena-code", "david-k8s");

    @PostMapping("/trigger")
    public ResponseEntity<Map<String, Object>> triggerEvent(@RequestBody Map<String, Object> req) {
        String type = req.getOrDefault("type", "DEPLOY").toString();
        log.info("Simulator triggered event type: {}", type);

        Map<String, Object> result = new HashMap<>();
        result.put("type", type);
        result.put("timestamp", LocalDateTime.now());

        switch (type) {
            case "DEPLOY": {
                String chosenService = services.get(random.nextInt(services.size()));
                String env = req.getOrDefault("environment", "production").toString();
                Deployment deploy = Deployment.builder()
                        .serviceName(chosenService)
                        .environment(env)
                        .version("2." + (random.nextInt(5) + 4) + "." + (random.nextInt(9) + 1))
                        .deployedBy(devs.get(random.nextInt(devs.size())))
                        .commitHash(Long.toHexString(System.currentTimeMillis()).substring(0, 7))
                        .status("DEPLOYED")
                        .durationSeconds(random.nextInt(60) + 30)
                        .timestamp(LocalDateTime.now())
                        .build();
                Deployment saved = eventProcessingService.processDeployment(deploy);
                result.put("event", saved);
                break;
            }
            case "BUILD":
            case "BUILD_SUCCESS":
            case "BUILD_FAILURE": {
                boolean isFail = "BUILD_FAILURE".equalsIgnoreCase(type);
                BuildJob build = BuildJob.builder()
                        .pipelineName(isFail ? "payment-e2e-suite" : "core-services-pipeline")
                        .source(random.nextBoolean() ? "GITHUB" : "JENKINS")
                        .buildNumber(String.valueOf(random.nextInt(500) + 100))
                        .branch(isFail ? "fix/checkout-bug" : "feature/redis-pubsub")
                        .commitHash(Long.toHexString(System.currentTimeMillis()).substring(0, 7))
                        .author(devs.get(random.nextInt(devs.size())))
                        .status(isFail ? "FAILED" : "SUCCESS")
                        .durationSeconds(random.nextInt(60) + 20)
                        .timestamp(LocalDateTime.now())
                        .build();
                BuildJob saved = eventProcessingService.processBuildJob(build);
                result.put("event", saved);
                break;
            }
            case "INCIDENT": {
                String severity = req.getOrDefault("severity", "SEV-1").toString();
                Incident incident = Incident.builder()
                        .title("Redis Cluster memory saturation threshold exceeded (> 85%)")
                        .severity(severity)
                        .status("OPEN")
                        .affectedService("order-processing")
                        .createdAt(LocalDateTime.now())
                        .build();
                Incident saved = eventProcessingService.processIncident(incident);
                result.put("event", saved);
                break;
            }
            case "ACTIVITY": {
                DeveloperActivity act = DeveloperActivity.builder()
                        .developerName(devs.get(random.nextInt(devs.size())))
                        .actionType("COMMIT")
                        .repository("devpulse/api-gateway")
                        .message("Refactored Redis pubsub connection pool and socket buffer")
                        .timestamp(LocalDateTime.now())
                        .build();
                DeveloperActivity saved = eventProcessingService.processActivity(act);
                result.put("event", saved);
                break;
            }
            default:
                break;
        }

        return ResponseEntity.ok(result);
    }
}
