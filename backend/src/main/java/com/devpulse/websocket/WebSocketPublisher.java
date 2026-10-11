package com.devpulse.websocket;

import com.devpulse.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastMetrics(MetricsSummary metrics) {
        messagingTemplate.convertAndSend("/topic/metrics", metrics);
    }

    public void broadcastBuild(BuildJob build) {
        messagingTemplate.convertAndSend("/topic/builds", build);
    }

    public void broadcastDeployment(Deployment deployment) {
        messagingTemplate.convertAndSend("/topic/deployments", deployment);
    }

    public void broadcastHealth(Object healthData) {
        messagingTemplate.convertAndSend("/topic/health", healthData);
    }

    public void broadcastIncident(Incident incident) {
        messagingTemplate.convertAndSend("/topic/incidents", incident);
    }

    public void broadcastActivity(DeveloperActivity activity) {
        messagingTemplate.convertAndSend("/topic/activity", activity);
    }
}
