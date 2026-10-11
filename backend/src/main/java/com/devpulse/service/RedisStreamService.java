package com.devpulse.service;

import com.devpulse.config.RedisConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisStreamService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic devpulseTopic;

    private final AtomicBoolean isRedisOnline = new AtomicBoolean(false);
    private final AtomicBoolean hasChecked = new AtomicBoolean(false);
    private final ConcurrentHashMap<String, Object> inMemoryCache = new ConcurrentHashMap<>();

    public boolean isRedisAvailable() {
        if (!hasChecked.get()) {
            checkConnection();
        }
        return isRedisOnline.get();
    }

    public String getRedisMode() {
        return isRedisAvailable() ? "ONLINE" : "EMBEDDED";
    }

    private synchronized void checkConnection() {
        try {
            if (redisTemplate.getConnectionFactory() != null) {
                var conn = redisTemplate.getConnectionFactory().getConnection();
                String ping = conn.ping();
                conn.close();
                if ("PONG".equalsIgnoreCase(ping)) {
                    isRedisOnline.set(true);
                    log.info("Successfully connected to Redis Server at localhost:6379");
                }
            }
        } catch (Exception e) {
            isRedisOnline.set(false);
            log.info("Standalone Redis server not detected ({}). DevPulse will operate in EMBEDDED STREAM mode.", e.getMessage());
        } finally {
            hasChecked.set(true);
        }
    }

    public void publishEvent(String eventType, Object payload) {
        if (isRedisAvailable()) {
            try {
                redisTemplate.convertAndSend(devpulseTopic.getTopic(), payload);
                log.debug("Published event [{}] to Redis topic {}", eventType, devpulseTopic.getTopic());
            } catch (Exception e) {
                log.warn("Failed to publish to Redis, falling back to embedded pipeline: {}", e.getMessage());
                isRedisOnline.set(false);
            }
        }
    }

    public void cacheValue(String key, Object value) {
        inMemoryCache.put(key, value);
        if (isRedisAvailable()) {
            try {
                redisTemplate.opsForValue().set(key, value);
            } catch (Exception e) {
                log.warn("Failed writing cache to Redis: {}", e.getMessage());
                isRedisOnline.set(false);
            }
        }
    }

    public Object getCachedValue(String key) {
        if (isRedisAvailable()) {
            try {
                Object val = redisTemplate.opsForValue().get(key);
                if (val != null) return val;
            } catch (Exception e) {
                log.warn("Failed reading cache from Redis: {}", e.getMessage());
                isRedisOnline.set(false);
            }
        }
        return inMemoryCache.get(key);
    }
}
