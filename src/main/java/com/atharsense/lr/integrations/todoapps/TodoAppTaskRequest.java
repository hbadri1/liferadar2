package com.atharsense.lr.integrations.todoapps;

import java.time.Instant;

public record TodoAppTaskRequest(String title, String notes, Instant dueAt, String projectId) {}

