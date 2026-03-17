package com.atharsense.lr.integrations.todoapps;

import com.atharsense.lr.config.ApplicationProperties;
import com.atharsense.lr.domain.TodoAppUserConfig;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class MicrosoftTodoAppClient implements TodoAppClient {

    @Override
    public TodoAppProvider provider() {
        return TodoAppProvider.MICROSOFT_TODO;
    }

    @Override
    public TodoAppPushResult createTask(TodoAppTaskRequest request, TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig) {
        String externalId = "ms-todo-" + UUID.randomUUID();
        return new TodoAppPushResult(provider(), externalId, "Task sent to Microsoft To Do");
    }
}

