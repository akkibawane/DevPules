package com.devpulse.service;

import com.devpulse.model.ApiHealth;
import com.devpulse.model.DeveloperActivity;
import com.devpulse.repository.ApiHealthRepository;
import com.devpulse.websocket.WebSocketPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetrySimulatorService {

    private final ApiHealthRepository apiHealthRepository;
    private final EventProcessingService eventProcessingService;
    private final WebSocketPublisher webSocketPublisher;

    @Value("${devpulse.simulator.auto-start:true}")
    private boolean autoStart;

    private final Random random = new Random();
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final List<String> devNames = List.of("alex-dev", "sarah-ops", "marcus-fin", "elena-code", "david-k8s");
    private final List<String> repos = List.of("devpulse/api-gateway", "devpulse/auth", "devpulse/payment-service", "devpulse/infra");
    private final List<String> messages = List.of(
        "Refactor Redis pub/sub serialization to JSON",
        "Add health check endpoint for Kubernetes liveness probe",
        "Fix STOMP frame heartbeat interval timeout",
        "Optimize SQL queries and index for deployment log scan",
        "Bump Spring Boot 3 dependencies to latest release"
    );

    @Scheduled(fixedRate = 4000)
    public void generateTelemetryPulse() {
        if (!autoStart) return;

        // 1. Fluctuate API Health Latency
        List<ApiHealth> services = apiHealthRepository.findAll();
        for (ApiHealth svc : services) {
            int base = svc.getName().contains("gateway") ? 22 : (svc.getName().contains("auth") ? 16 : 45);
            int jitter = random.nextInt(15) - 7;
            svc.setLatencyMs(Math.max(10, base + jitter));
            svc.setLastChecked(LocalDateTime.now());
        }
        apiHealthRepository.saveAll(services);

        // Prepare point for Recharts area graph
        LocalDateTime now = LocalDateTime.now();
        Map<String, Object> historyPoint = new HashMap<>();
        historyPoint.put("time", now.format(timeFormatter));
        historyPoint.put("gateway", services.stream().filter(s -> s.getName().equals("api-gateway")).findFirst().map(ApiHealth::getLatencyMs).orElse(24));
        historyPoint.put("auth", services.stream().filter(s -> s.getName().equals("auth-service")).findFirst().map(ApiHealth::getLatencyMs).orElse(18));
        historyPoint.put("payment", services.stream().filter(s -> s.getName().equals("payment-service")).findFirst().map(ApiHealth::getLatencyMs).orElse(60));

        Map<String, Object> healthData = new HashMap<>();
        healthData.put("services", services);
        healthData.put("historyPoint", historyPoint);

        webSocketPublisher.broadcastHealth(healthData);

        // 2. Occasionally simulate developer activity (every ~20 seconds)
        if (random.nextInt(5) == 0) {
            DeveloperActivity act = DeveloperActivity.builder()
                    .developerName(devNames.get(random.nextInt(devNames.size())))
                    .actionType(random.nextBoolean() ? "COMMIT" : "PR_MERGED")
                    .repository(repos.get(random.nextInt(repos.size())))
                    .message(messages.get(random.nextInt(messages.size())))
                    .timestamp(LocalDateTime.now())
                    .build();
            eventProcessingService.processActivity(act);
        }
    }
}
