package com.atharsense.lr.integrations.todoapps;

import com.atharsense.lr.config.ApplicationProperties;
import com.atharsense.lr.domain.TodoAppUserConfig;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class TodoistTodoAppClient implements TodoAppClient {

    @Override
    public TodoAppProvider provider() {
        return TodoAppProvider.TODOIST;
    }

    @Override
    public TodoAppPushResult createTask(TodoAppTaskRequest request, TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig) {
        String externalId = "todoist-" + UUID.randomUUID();
        return new TodoAppPushResult(provider(), externalId, "Task sent to Todoist");
    }
}

