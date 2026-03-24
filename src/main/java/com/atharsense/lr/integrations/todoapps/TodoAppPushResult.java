package com.atharsense.lr.integrations.todoapps;

public record TodoAppPushResult(TodoAppProvider provider, String externalTaskId, String message) {}

