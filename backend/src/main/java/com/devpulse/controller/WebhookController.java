package com.devpulse.controller;

import com.devpulse.model.BuildJob;
import com.devpulse.model.DeveloperActivity;
import com.devpulse.service.EventProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final EventProcessingService eventProcessingService;

    @PostMapping("/github")
    public ResponseEntity<Map<String, String>> handleGitHubWebhook(
            @RequestHeader(value = "X-GitHub-Event", defaultValue = "push") String eventType,
            @RequestBody Map<String, Object> payload) {

        log.info("Received GitHub Webhook event: {}", eventType);

        if ("push".equalsIgnoreCase(eventType)) {
            String repo = payload.getOrDefault("repository", "devpulse/backend").toString();
            String pusher = payload.getOrDefault("pusher", "github-user").toString();
            String commitMsg = payload.getOrDefault("message", "Triggered automated build commit").toString();

            DeveloperActivity activity = DeveloperActivity.builder()
                    .developerName(pusher)
                    .actionType("COMMIT")
                    .repository(repo)
                    .message(commitMsg)
                    .timestamp(LocalDateTime.now())
                    .build();
            eventProcessingService.processActivity(activity);

            // Also trigger CI build run
            BuildJob build = BuildJob.builder()
                    .pipelineName(repo.contains("/") ? repo.split("/")[1] + "-ci" : "core-ci")
                    .source("GITHUB")
                    .buildNumber(String.valueOf(System.currentTimeMillis() % 1000))
                    .branch(payload.getOrDefault("branch", "main").toString())
                    .commitHash(payload.getOrDefault("commit", "c" + Long.toHexString(System.currentTimeMillis()).substring(0, 7)).toString())
                    .author(pusher)
                    .status("RUNNING")
                    .durationSeconds(45)
                    .timestamp(LocalDateTime.now())
                    .build();
            eventProcessingService.processBuildJob(build);
        }

        return ResponseEntity.ok(Map.of("status", "processed", "event", eventType));
    }

    @PostMapping("/jenkins")
    public ResponseEntity<Map<String, String>> handleJenkinsWebhook(@RequestBody Map<String, Object> payload) {
        log.info("Received Jenkins pipeline webhook: {}", payload);

        String jobName = payload.getOrDefault("jobName", "jenkins-pipeline-build").toString();
        String status = payload.getOrDefault("status", "SUCCESS").toString();
        String buildNum = payload.getOrDefault("buildNumber", "101").toString();

        BuildJob build = BuildJob.builder()
                .pipelineName(jobName)
                .source("JENKINS")
                .buildNumber(buildNum)
                .branch(payload.getOrDefault("branch", "release/v2.4").toString())
                .commitHash(payload.getOrDefault("commitHash", "9fa3b21").toString())
                .author(payload.getOrDefault("author", "jenkins-ci").toString())
                .status(status)
                .durationSeconds(Integer.parseInt(payload.getOrDefault("durationSeconds", "60").toString()))
                .timestamp(LocalDateTime.now())
                .build();
        eventProcessingService.processBuildJob(build);

        return ResponseEntity.ok(Map.of("status", "processed", "job", jobName));
    }
}
