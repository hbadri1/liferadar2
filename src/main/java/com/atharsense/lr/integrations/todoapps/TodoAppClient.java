package com.atharsense.lr.integrations.todoapps;

import com.atharsense.lr.config.ApplicationProperties;
import com.atharsense.lr.domain.TodoAppUserConfig;

public interface TodoAppClient {
    TodoAppProvider provider();

    TodoAppPushResult createTask(TodoAppTaskRequest request, TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig);
}

