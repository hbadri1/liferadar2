package com.atharsense.lr.integrations.todoapps;

import com.atharsense.lr.config.ApplicationProperties;
import com.atharsense.lr.domain.TodoAppUserConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class TickTickTodoAppClient implements TodoAppClient {

    private static final Logger log = LoggerFactory.getLogger(TickTickTodoAppClient.class);
    private static final DateTimeFormatter TICKTICK_DUE_DATE_FORMATTER = DateTimeFormatter
        .ofPattern("yyyy-MM-dd'T'HH:mm:ssZ")
        .withZone(ZoneOffset.UTC);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public TickTickTodoAppClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public TodoAppProvider provider() {
        return TodoAppProvider.TICKTICK;
    }

    @Override
    public TodoAppPushResult createTask(TodoAppTaskRequest request, TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig) {
        if (!StringUtils.hasText(userConfig.getAccessToken())) {
            throw new IllegalArgumentException("TickTick access token is missing. Please re-authorize your TickTick connection.");
        }
        if (!StringUtils.hasText(providerConfig.getCreateTaskPath())) {
            throw new IllegalArgumentException("TickTick create_task_path is not configured on this server. Please contact your administrator.");
        }

        String endpoint = buildEndpoint(providerConfig.getBaseUrl(), providerConfig.getCreateTaskPath());
        String title = StringUtils.hasText(request.title()) ? request.title().trim() : "Untitled Action Item";

        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        if (StringUtils.hasText(request.notes())) {
            payload.put("content", request.notes());
        }
        if (StringUtils.hasText(request.projectId())) {
            String destinationId = request.projectId().trim();
            payload.put("projectId", destinationId);
            log.debug("Sending TickTick destination id: {}", destinationId);
        }
        if (request.dueAt() != null) {
            String tickTickDueDate = formatTickTickDueDate(request.dueAt());
            payload.put("dueDate", tickTickDueDate);
            log.debug("Sending TickTick dueDate: {}", tickTickDueDate);
        }

        HttpRequest httpRequest;
        try {
            httpRequest = HttpRequest.newBuilder(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + userConfig.getAccessToken())
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to build TickTick task request", ex);
        }

        try {
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                String errorMsg = String.format(
                    "TickTick task creation failed with status %d: %s",
                    response.statusCode(),
                    response.body()
                );
                log.error(errorMsg);
                throw new IllegalArgumentException(errorMsg);
            }

            JsonNode json = objectMapper.readTree(response.body());
            String externalId = textOrNull(json, "id");
            if (!StringUtils.hasText(externalId)) {
                externalId = textOrNull(json, "uid");
            }
            if (!StringUtils.hasText(externalId)) {
                externalId = textOrNull(json, "taskId");
            }

            // Try to extract from wrapped response like {data: {id: ...}}
            if (!StringUtils.hasText(externalId) && json.has("data")) {
                JsonNode dataNode = json.get("data");
                externalId = textOrNull(dataNode, "id");
                if (!StringUtils.hasText(externalId)) {
                    externalId = textOrNull(dataNode, "uid");
                }
                if (!StringUtils.hasText(externalId)) {
                    externalId = textOrNull(dataNode, "taskId");
                }
            }

            if (!StringUtils.hasText(externalId)) {
                externalId = "ticktick-" + UUID.randomUUID();
            }
            log.info("Successfully created TickTick task: {}", externalId);
            return new TodoAppPushResult(provider(), externalId, "Task sent to TickTick");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("TickTick task creation failed", ex);
        } catch (IOException ex) {
            throw new IllegalArgumentException("TickTick task creation failed", ex);
        }
    }

    public List<TickTickProject> listProjects(TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig) {
        if (!StringUtils.hasText(userConfig.getAccessToken())) {
            throw new IllegalArgumentException("TickTick access token is missing. Please re-authorize your TickTick connection.");
        }

        String endpoint = buildEndpoint(providerConfig.getBaseUrl(), firstNonBlank(providerConfig.getProjectsPath(), "/open/v1/project"));
        log.debug("Fetching TickTick projects from: {}", endpoint);

        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
            .header("Authorization", "Bearer " + userConfig.getAccessToken())
            .header("Content-Type", "application/json")
            .header("User-Agent", "LifeRadar/1.0 (+http://localhost)")
            .header("Accept", "application/json")
            .GET()
            .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.debug("TickTick projects response status: {}", response.statusCode());
            if (response.statusCode() >= 400) {
                String errorMsg = String.format(
                    "TickTick projects request failed with status %d: %s",
                    response.statusCode(),
                    response.body()
                );
                log.error(errorMsg);

                throw new IllegalArgumentException(errorMsg);
            }

            return parseProjectsResponse(response.body());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("TickTick projects request failed", ex);
        } catch (IOException ex) {
            throw new IllegalArgumentException("TickTick projects request failed", ex);
        }
    }

    public List<TickTickProject> listProjectsOrLists(TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig) {
        try {
            // Try to get projects first
            List<TickTickProject> projects = listProjects(userConfig, providerConfig);
            if (!projects.isEmpty()) {
                log.info("Using TickTick projects");
                return projects;
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch TickTick projects: {}", ex.getMessage());
        }

        try {
            // If no projects, try lists (alternative TickTick concept)
            log.info("No projects found, trying TickTick lists...");
            List<TickTickProject> lists = listLists(userConfig, providerConfig);
            if (!lists.isEmpty()) {
                log.info("Using TickTick lists as projects");
                return lists;
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch TickTick lists: {}", ex.getMessage());
        }

        log.info("No TickTick projects/lists were returned");
        return List.of();
    }

    /**
     * 3-Tier fallback strategy:
     * Tier 1: Try to fetch projects
     * Tier 2: Try to fetch lists (if no projects)
     * Tier 3: Create a default "Liferadar" project (if no projects/lists)
     *
     * This method ensures that the project picker modal always has something to display.
     *
     * @return List of TickTick projects/lists or created default project
     * @throws IllegalArgumentException only if all three tiers fail
     */
    public List<TickTickProject> listProjectsOrListsOrCreateDefault(TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig) {
        // Tier 1: Try to get projects
        try {
            List<TickTickProject> projects = listProjects(userConfig, providerConfig);
            if (!projects.isEmpty()) {
                log.info("Tier 1 succeeded: Using TickTick projects");
                return projects;
            }
        } catch (Exception ex) {
            log.debug("Tier 1 (Projects) failed: {}", ex.getMessage());
        }

        // Tier 2: Try to get lists
        try {
            log.debug("Tier 1 returned no projects, trying Tier 2 (Lists)...");
            List<TickTickProject> lists = listLists(userConfig, providerConfig);
            if (!lists.isEmpty()) {
                log.info("Tier 2 succeeded: Using TickTick lists as projects");
                return lists;
            }
        } catch (Exception ex) {
            log.debug("Tier 2 (Lists) failed: {}", ex.getMessage());
        }

        // Tier 3: Create a default project
        try {
            log.debug("Tier 2 returned no lists, trying Tier 3 (Create Default)...");
            String projectId = createDefaultProject(userConfig, providerConfig);
            if (StringUtils.hasText(projectId)) {
                log.info("Tier 3 succeeded: Successfully created default Liferadar project");
                return List.of(new TickTickProject(projectId, "Liferadar"));
            }
        } catch (Exception ex) {
            log.debug("Tier 3 (Create Default) failed: {}", ex.getMessage());
        }

        log.error("All three tiers failed - no projects, lists, or ability to create default project");
        throw new IllegalArgumentException(
            "Unable to retrieve or create TickTick projects. This could be due to: " +
            "1) Invalid API credentials, " +
            "2) Insufficient TickTick permissions, or " +
            "3) API access issues. " +
            "Please re-authorize your TickTick connection or contact your administrator."
        );
    }

    public List<TickTickProject> listLists(TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig) {
        if (!StringUtils.hasText(userConfig.getAccessToken())) {
            throw new IllegalArgumentException("TickTick access token is missing. Please re-authorize your TickTick connection.");
        }

        // ...existing code...
        String[] listEndpoints = {
            "/open/v1/lists",
            "/api/v2/lists",
            "/lists"
        };

        for (String listPath : listEndpoints) {
            try {
                String endpoint = buildEndpoint(providerConfig.getBaseUrl(), listPath);
                log.debug("Trying TickTick lists endpoint: {}", endpoint);

                HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                    .header("Authorization", "Bearer " + userConfig.getAccessToken())
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "LifeRadar/1.0 (+http://localhost)")
                    .header("Accept", "application/json")
                    .GET()
                    .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() < 400) {
                    log.info("TickTick lists endpoint succeeded: {}", endpoint);
                    return parseProjectsResponse(response.body());
                }
            } catch (Exception ex) {
                log.debug("TickTick lists endpoint {} failed: {}", listPath, ex.getMessage());
            }
        }

        return List.of();
    }

    public String createDefaultProject(TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig) {
        if (!StringUtils.hasText(userConfig.getAccessToken())) {
            throw new IllegalArgumentException("TickTick access token is missing. Please re-authorize your TickTick connection.");
        }

        try {
            // Try to create a default project called "Liferadar"
            String[] projectCreationEndpoints = {
                "/open/v1/project",
                "/open/v1/projects",
                "/api/v2/project"
            };

            for (String endpoint : projectCreationEndpoints) {
                try {
                    String fullEndpoint = buildEndpoint(providerConfig.getBaseUrl(), endpoint);
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("name", "Liferadar");
                    payload.put("title", "Liferadar");

                    HttpRequest request = HttpRequest.newBuilder(URI.create(fullEndpoint))
                        .header("Authorization", "Bearer " + userConfig.getAccessToken())
                        .header("Content-Type", "application/json")
                        .header("User-Agent", "LifeRadar/1.0 (+http://localhost)")
                        .header("Accept", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                        .build();

                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    if (response.statusCode() >= 200 && response.statusCode() < 400) {
                        JsonNode json = objectMapper.readTree(response.body());
                        String projectId = textOrNull(json, "id");
                        if (!StringUtils.hasText(projectId) && json.has("data")) {
                            projectId = textOrNull(json.get("data"), "id");
                        }
                        if (StringUtils.hasText(projectId)) {
                            log.info("Created default Liferadar project with ID: {}", projectId);
                            return projectId;
                        }
                    }
                } catch (Exception ex) {
                    log.debug("Failed to create project via endpoint {}: {}", endpoint, ex.getMessage());
                }
            }
        } catch (Exception ex) {
            log.error("Failed to create default project", ex);
        }

        return null;
    }

    private String buildEndpoint(String baseUrl, String path) {
        if (!StringUtils.hasText(baseUrl) || !StringUtils.hasText(path)) {
            throw new IllegalArgumentException("TickTick base_url/path are required");
        }
        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        return normalizedBase + normalizedPath;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private List<TickTickProject> tryAlternativeProjectEndpoints(TodoAppUserConfig userConfig, ApplicationProperties.Provider providerConfig) {
        // Try alternative endpoint paths that TickTick might use
        String[] alternativePaths = {
            "/open/v1/projects",        // Plural
            "/api/v2/projects",          // Different version
            "/project",                  // Simplified
            "/api/projects"              // API prefix
        };

        for (String altPath : alternativePaths) {
            try {
                String endpoint = buildEndpoint(providerConfig.getBaseUrl(), altPath);
                log.debug("Trying alternative endpoint: {}", endpoint);

                HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                    .header("Authorization", "Bearer " + userConfig.getAccessToken())
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "LifeRadar/1.0 (+http://localhost)")
                    .header("Accept", "application/json")
                    .GET()
                    .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() < 400) {
                    log.info("Alternative endpoint succeeded: {}", endpoint);
                    return parseProjectsResponse(response.body());
                }
            } catch (Exception ex) {
                log.debug("Alternative endpoint {} failed: {}", altPath, ex.getMessage());
            }
        }

        log.warn("All alternative endpoints failed, returning empty list");
        return List.of();
    }

    private List<TickTickProject> parseProjectsResponse(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            JsonNode dataNode = extractProjectsArray(json);
            if (dataNode == null || !dataNode.isArray()) {
                log.warn("TickTick projects response data is not an array: {}", json);
                return List.of();
            }

            List<TickTickProject> projects = new ArrayList<>();
            for (JsonNode projectNode : dataNode) {
                TickTickProject parsed = toTickTickProject(projectNode);
                if (parsed != null) {
                    projects.add(parsed);
                }
            }
            log.info("Successfully parsed {} TickTick projects", projects.size());
            return projects;
        } catch (Exception ex) {
            log.error("Failed to parse TickTick projects response", ex);
            return List.of();
        }
    }

    private JsonNode extractProjectsArray(JsonNode json) {
        if (json == null || json.isNull()) {
            return null;
        }
        if (json.isArray()) {
            return json;
        }
        if (!json.isObject()) {
            return null;
        }

        String[] wrapperFields = { "data", "list", "projects", "items", "result" };
        for (String wrapper : wrapperFields) {
            JsonNode wrapped = json.get(wrapper);
            if (wrapped == null || wrapped.isNull()) {
                continue;
            }
            if (wrapped.isArray()) {
                return wrapped;
            }
            if (wrapped.isObject()) {
                JsonNode nested = extractProjectsArray(wrapped);
                if (nested != null && nested.isArray()) {
                    return nested;
                }
            }
        }

        TickTickProject single = toTickTickProject(json);
        if (single != null) {
            return objectMapper.valueToTree(List.of(Map.of("id", single.id(), "name", single.name())));
        }

        return null;
    }

    private TickTickProject toTickTickProject(JsonNode projectNode) {
        if (projectNode == null || !projectNode.isObject()) {
            return null;
        }

        String id = firstNonBlank(
            textOrNull(projectNode, "id"),
            textOrNull(projectNode, "projectId"),
            textOrNull(projectNode, "uid")
        );
        String name = firstNonBlank(
            textOrNull(projectNode, "name"),
            textOrNull(projectNode, "title"),
            textOrNull(projectNode, "projectName")
        );

        if (StringUtils.hasText(id) && StringUtils.hasText(name)) {
            return new TickTickProject(id, name);
        }
        return null;
    }

    public TickTickTokenResponse exchangeAuthorizationCode(String authorizationCode, ApplicationProperties.Provider providerConfig) {
        if (!StringUtils.hasText(providerConfig.getClientId()) || !StringUtils.hasText(providerConfig.getSecretId())) {
            throw new IllegalArgumentException("TickTick client_id and secret_id are required");
        }
        if (!StringUtils.hasText(providerConfig.getRedirectUri())) {
            throw new IllegalArgumentException("TickTick redirect_uri is required");
        }

        String tokenEndpoint = providerConfig.getBaseUrl() + providerConfig.getTokenPath();
        String form =
            "client_id=" + encode(providerConfig.getClientId()) +
            "&client_secret=" + encode(providerConfig.getSecretId()) +
            "&code=" + encode(authorizationCode) +
            "&grant_type=authorization_code" +
            "&redirect_uri=" + encode(providerConfig.getRedirectUri());

        HttpRequest request = HttpRequest.newBuilder(URI.create(tokenEndpoint))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(form))
            .build();

        try {
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new IllegalArgumentException("TickTick token exchange failed with status " + response.statusCode());
            }

            JsonNode json = objectMapper.readTree(response.body());
            String accessToken = textOrNull(json, "access_token");
            if (!StringUtils.hasText(accessToken)) {
                throw new IllegalArgumentException("TickTick token exchange returned no access_token");
            }

            return new TickTickTokenResponse(accessToken, textOrNull(json, "refresh_token"), textOrNull(json, "user_id"));
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("TickTick token exchange failed", ex);
        } catch (IOException ex) {
            throw new IllegalArgumentException("TickTick token exchange failed", ex);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String textOrNull(JsonNode json, String field) {
        JsonNode node = json.get(field);
        if (node == null || node.isNull()) {
            return null;
        }
        String text = node.asText();
        return StringUtils.hasText(text) ? text : null;
    }

    private String formatTickTickDueDate(Instant dueAt) {
        return TICKTICK_DUE_DATE_FORMATTER.format(dueAt);
    }

    public record TickTickTokenResponse(String accessToken, String refreshToken, String externalUserId) {}

    public record TickTickProject(String id, String name) {}
}
