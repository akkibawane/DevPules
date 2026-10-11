package com.devpulse.service;

import com.devpulse.model.*;
import com.devpulse.repository.*;
import com.devpulse.websocket.WebSocketPublisher;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventProcessingService {

    private final DeploymentRepository deploymentRepository;
    private final BuildJobRepository buildJobRepository;
    private final ApiHealthRepository apiHealthRepository;
    private final IncidentRepository incidentRepository;
    private final DeveloperActivityRepository activityRepository;

    private final RedisStreamService redisStreamService;
    private final WebSocketPublisher webSocketPublisher;

    @PostConstruct
    public void seedInitialData() {
        if (apiHealthRepository.count() == 0) {
            apiHealthRepository.saveAll(List.of(
                ApiHealth.builder().name("api-gateway").status("HEALTHY").latencyMs(24).uptime(99.98).lastChecked(LocalDateTime.now()).build(),
                ApiHealth.builder().name("auth-service").status("HEALTHY").latencyMs(18).uptime(99.99).lastChecked(LocalDateTime.now()).build(),
                ApiHealth.builder().name("payment-service").status("DEGRADED").latencyMs(82).uptime(99.45).lastChecked(LocalDateTime.now()).build(),
                ApiHealth.builder().name("order-processing").status("HEALTHY").latencyMs(35).uptime(99.91).lastChecked(LocalDateTime.now()).build(),
                ApiHealth.builder().name("notification-service").status("HEALTHY").latencyMs(14).uptime(100.0).lastChecked(LocalDateTime.now()).build()
            ));
        }

        if (deploymentRepository.count() == 0) {
            deploymentRepository.saveAll(List.of(
                Deployment.builder().serviceName("api-gateway").environment("production").version("2.4.1").deployedBy("argocd-bot").commitHash("e71f92b").status("DEPLOYED").durationSeconds(45).timestamp(LocalDateTime.now().minusMinutes(12)).build(),
                Deployment.builder().serviceName("payment-service").environment("canary").version("2.5.0-rc1").deployedBy("marcus-fin").commitHash("b432a18").status("IN_PROGRESS").durationSeconds(120).timestamp(LocalDateTime.now().minusMinutes(2)).build(),
                Deployment.builder().serviceName("order-processing").environment("staging").version("2.4.0").deployedBy("sarah-ops").commitHash("89ac231").status("DEPLOYED").durationSeconds(60).timestamp(LocalDateTime.now().minusMinutes(45)).build()
            ));
        }

        if (buildJobRepository.count() == 0) {
            buildJobRepository.saveAll(List.of(
                BuildJob.builder().pipelineName("devpulse-backend-ci").source("GITHUB").buildNumber("284").branch("main").commitHash("e71f92b4a").author("alex-dev").status("SUCCESS").durationSeconds(78).timestamp(LocalDateTime.now().minusMinutes(10)).build(),
                BuildJob.builder().pipelineName("auth-service-deploy").source("JENKINS").buildNumber("142").branch("release/v2.4").commitHash("9a31f7c8d").author("sarah-ops").status("RUNNING").durationSeconds(42).timestamp(LocalDateTime.now().minusMinutes(3)).build(),
                BuildJob.builder().pipelineName("payment-gateway-e2e").source("GITHUB").buildNumber("89").branch("fix/stripe-webhook").commitHash("b432a188f").author("marcus-fin").status("FAILED").durationSeconds(54).timestamp(LocalDateTime.now().minusMinutes(25)).build()
            ));
        }

        if (incidentRepository.count() == 0) {
            incidentRepository.save(
                Incident.builder().title("Payment Gateway Stripe webhook latency spike > 500ms").severity("SEV-2").status("INVESTIGATING").affectedService("payment-service").createdAt(LocalDateTime.now().minusMinutes(8)).build()
            );
        }

        if (activityRepository.count() == 0) {
            activityRepository.saveAll(List.of(
                DeveloperActivity.builder().developerName("alex-dev").actionType("COMMIT").repository("devpulse/backend").message("Optimize Redis connection pooling & Jedis buffer sizes").timestamp(LocalDateTime.now().minusMinutes(3)).build(),
                DeveloperActivity.builder().developerName("sarah-ops").actionType("PR_MERGED").repository("devpulse/infra").message("Bump Kubernetes ingress replicas for canary rollout").timestamp(LocalDateTime.now().minusMinutes(14)).build(),
                DeveloperActivity.builder().developerName("marcus-fin").actionType("CODE_REVIEW").repository("devpulse/payment-service").message("Approved pull request #84: add idempotency header verification").timestamp(LocalDateTime.now().minusMinutes(28)).build()
            ));
        }
    }

    @Transactional
    public Deployment processDeployment(Deployment deployment) {
        if (deployment.getTimestamp() == null) {
            deployment.setTimestamp(LocalDateTime.now());
        }
        Deployment saved = deploymentRepository.save(deployment);
        saved.setTimeAgo("Just now");

        // Publish to Redis Pub/Sub
        redisStreamService.publishEvent("DEPLOYMENT", saved);
        // Relay to WebSockets
        webSocketPublisher.broadcastDeployment(saved);
        broadcastUpdatedMetrics();
        return saved;
    }

    @Transactional
    public BuildJob processBuildJob(BuildJob buildJob) {
        if (buildJob.getTimestamp() == null) {
            buildJob.setTimestamp(LocalDateTime.now());
        }
        BuildJob saved = buildJobRepository.save(buildJob);

        redisStreamService.publishEvent("BUILD", saved);
        webSocketPublisher.broadcastBuild(saved);
        broadcastUpdatedMetrics();
        return saved;
    }

    @Transactional
    public Incident processIncident(Incident incident) {
        if (incident.getCreatedAt() == null) {
            incident.setCreatedAt(LocalDateTime.now());
        }
        Incident saved = incidentRepository.save(incident);
        saved.setTimeAgo("Just now");

        redisStreamService.publishEvent("INCIDENT", saved);
        webSocketPublisher.broadcastIncident(saved);
        broadcastUpdatedMetrics();
        return saved;
    }

    @Transactional
    public Incident resolveIncident(Long incidentId) {
        return incidentRepository.findById(incidentId).map(incident -> {
            incident.setStatus("RESOLVED");
            incident.setResolvedAt(LocalDateTime.now());
            Incident saved = incidentRepository.save(incident);
            saved.setTimeAgo("Resolved just now");

            redisStreamService.publishEvent("INCIDENT", saved);
            webSocketPublisher.broadcastIncident(saved);
            broadcastUpdatedMetrics();
            return saved;
        }).orElse(null);
    }

    @Transactional
    public DeveloperActivity processActivity(DeveloperActivity activity) {
        if (activity.getTimestamp() == null) {
            activity.setTimestamp(LocalDateTime.now());
        }
        DeveloperActivity saved = activityRepository.save(activity);
        saved.setTimeAgo("Just now");

        redisStreamService.publishEvent("ACTIVITY", saved);
        webSocketPublisher.broadcastActivity(saved);
        return saved;
    }

    public MetricsSummary calculateMetricsSummary() {
        long totalBuilds = buildJobRepository.count();
        long failedBuilds = buildJobRepository.countByStatus("FAILED");
        long successBuilds = buildJobRepository.countByStatus("SUCCESS");
        double successRate = totalBuilds > 0 ? ((double) (totalBuilds - failedBuilds) / totalBuilds) * 100.0 : 96.0;

        long activeIncidents = incidentRepository.countByStatusNot("RESOLVED");

        MetricsSummary summary = MetricsSummary.builder()
                .buildSuccessRate(Math.round(successRate * 10.0) / 10.0)
                .totalBuilds24h((int) Math.max(totalBuilds, 84))
                .failedBuilds24h((int) Math.max(failedBuilds, 3))
                .deploysToday((int) deploymentRepository.count())
                .avgLeadTimeMinutes(16)
                .activeIncidents((int) activeIncidents)
                .mttrMinutes(22)
                .apiUptime(99.94)
                .avgLatencyMs(38)
                .redisMode(redisStreamService.getRedisMode())
                .build();

        redisStreamService.cacheValue("devpulse:metrics:summary", summary);
        return summary;
    }

    public void broadcastUpdatedMetrics() {
        MetricsSummary summary = calculateMetricsSummary();
        webSocketPublisher.broadcastMetrics(summary);
    }
}
