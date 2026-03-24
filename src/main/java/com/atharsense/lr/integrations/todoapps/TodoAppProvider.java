package com.atharsense.lr.integrations.todoapps;

import java.util.Arrays;

public enum TodoAppProvider {
    TICKTICK("ticktick"),
    MICROSOFT_TODO("microsoft-todo"),
    TODOIST("todoist");

    private final String code;

    TodoAppProvider(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static TodoAppProvider fromCode(String code) {
        return Arrays.stream(values())
            .filter(provider -> provider.code.equalsIgnoreCase(code))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unsupported provider: " + code));
    }
}

