package com.atharsense.lr.integrations.todoapps;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class TickTickAuthorizationStateStore {

    private static final Duration STATE_TTL = Duration.ofMinutes(10);

    private final Map<String, PendingState> states = new ConcurrentHashMap<>();

    public String issueStateForUser(Long userId) {
        String state = UUID.randomUUID().toString();
        states.put(state, new PendingState(userId, Instant.now().plus(STATE_TTL)));
        return state;
    }

    public Optional<Long> consumeUserId(String state) {
        cleanupExpiredStates();
        PendingState pendingState = states.remove(state);
        if (pendingState == null || Instant.now().isAfter(pendingState.expiresAt())) {
            return Optional.empty();
        }

        return Optional.of(pendingState.userId());
    }

    private void cleanupExpiredStates() {
        Instant now = Instant.now();
        states.entrySet().removeIf(entry -> now.isAfter(entry.getValue().expiresAt()));
    }

    private record PendingState(Long userId, Instant expiresAt) {}
}

