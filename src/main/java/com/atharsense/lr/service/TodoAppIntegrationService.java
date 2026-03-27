package com.atharsense.lr.service;

import com.atharsense.lr.config.ApplicationProperties;
import com.atharsense.lr.domain.EvaluationDecision;
import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.TodoAppUserConfig;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.integrations.todoapps.TodoAppClient;
import com.atharsense.lr.integrations.todoapps.TodoAppProvider;
import com.atharsense.lr.integrations.todoapps.TodoAppPushResult;
import com.atharsense.lr.integrations.todoapps.TodoAppTaskRequest;
import com.atharsense.lr.integrations.todoapps.TickTickAuthorizationStateStore;
import com.atharsense.lr.integrations.todoapps.TickTickTodoAppClient;
import com.atharsense.lr.integrations.todoapps.TickTickTodoAppClient.TickTickTokenResponse;
import com.atharsense.lr.repository.EvaluationDecisionRepository;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.TodoAppUserConfigRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.security.SecurityUtils;
import java.net.URLEncoder;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TodoAppIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(TodoAppIntegrationService.class);

    private final UserRepository userRepository;
    private final ExtendedUserRepository extendedUserRepository;
    private final TodoAppUserConfigRepository todoAppUserConfigRepository;
    private final EvaluationDecisionRepository evaluationDecisionRepository;
    private final ApplicationProperties applicationProperties;
    private final Map<TodoAppProvider, TodoAppClient> clientsByProvider;
    private final TickTickAuthorizationStateStore tickTickAuthorizationStateStore;
    private final TickTickTodoAppClient tickTickTodoAppClient;

    public TodoAppIntegrationService(
        UserRepository userRepository,
        ExtendedUserRepository extendedUserRepository,
        TodoAppUserConfigRepository todoAppUserConfigRepository,
        EvaluationDecisionRepository evaluationDecisionRepository,
        ApplicationProperties applicationProperties,
        List<TodoAppClient> clients,
        TickTickAuthorizationStateStore tickTickAuthorizationStateStore,
        TickTickTodoAppClient tickTickTodoAppClient
    ) {
        this.userRepository = userRepository;
        this.extendedUserRepository = extendedUserRepository;
        this.todoAppUserConfigRepository = todoAppUserConfigRepository;
        this.evaluationDecisionRepository = evaluationDecisionRepository;
        this.applicationProperties = applicationProperties;
        this.clientsByProvider = clients.stream().collect(Collectors.toMap(TodoAppClient::provider, client -> client));
        this.tickTickAuthorizationStateStore = tickTickAuthorizationStateStore;
        this.tickTickTodoAppClient = tickTickTodoAppClient;
    }

    @Transactional(readOnly = true)
    public TickTickAuthorizationView getTickTickAuthorizationViewForCurrentUser() {
        User user = getCurrentUser();
        ApplicationProperties.Provider providerConfig = applicationProperties.getTodoapps().getProviders().get(TodoAppProvider.TICKTICK.getCode());
        if (providerConfig == null || !providerConfig.isEnabled()) {
            throw new IllegalArgumentException(
                "TickTick integration is not enabled. Please contact your administrator to configure TickTick in the server settings."
            );
        }
        if (!hasRequiredProviderCredentials(TodoAppProvider.TICKTICK, providerConfig)) {
            throw new IllegalArgumentException(
                "TickTick configuration is incomplete. The server administrator needs to set the TickTick client_id and client_secret in the application configuration."
            );
        }
        if (!StringUtils.hasText(providerConfig.getAuthorizeUrl()) || !StringUtils.hasText(providerConfig.getRedirectUri())) {
            throw new IllegalArgumentException(
                "TickTick authorization settings are not properly configured. Please contact your administrator to verify the authorize_url and redirect_uri settings."
            );
        }

        String state = tickTickAuthorizationStateStore.issueStateForUser(user.getId());
        String authorizeUrl =
            providerConfig.getAuthorizeUrl() +
            "?client_id=" + urlEncode(providerConfig.getClientId()) +
            "&scope=" + urlEncode("tasks:read tasks:write") +
            "&state=" + urlEncode(state) +
            "&redirect_uri=" + urlEncode(providerConfig.getRedirectUri()) +
            "&response_type=code";

        return new TickTickAuthorizationView(authorizeUrl, state);
    }

    public TickTickAuthorizationResult completeTickTickAuthorization(String code, String state) {
        if (!StringUtils.hasText(code) || !StringUtils.hasText(state)) {
            throw new IllegalArgumentException(
                "TickTick authorization failed: Missing authorization code or state. Please try connecting again."
            );
        }

        Long userId = tickTickAuthorizationStateStore
            .consumeUserId(state)
            .orElseThrow(() -> new IllegalArgumentException(
                "TickTick authorization state is invalid or expired. Please try connecting again from the beginning."
            ));

        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found for TickTick authorization"));
        ensureExtendedUserExists(user);

        ApplicationProperties.Provider providerConfig = applicationProperties.getTodoapps().getProviders().get(TodoAppProvider.TICKTICK.getCode());
        if (providerConfig == null || !providerConfig.isEnabled()) {
            throw new IllegalArgumentException(
                "TickTick integration is not enabled. Please contact your administrator to configure TickTick."
            );
        }

        TickTickTokenResponse tokenResponse = tickTickTodoAppClient.exchangeAuthorizationCode(code, providerConfig);

        TodoAppUserConfig userConfig = todoAppUserConfigRepository
            .findOneByUserIdAndProvider(userId, TodoAppProvider.TICKTICK)
            .orElseGet(() -> {
                TodoAppUserConfig config = new TodoAppUserConfig();
                config.setUser(user);
                config.setProvider(TodoAppProvider.TICKTICK);
                return config;
            });

        userConfig.setEnabled(Boolean.TRUE);
        userConfig.setAccessToken(tokenResponse.accessToken());
        if (StringUtils.hasText(tokenResponse.externalUserId())) {
            userConfig.setExternalUserId(tokenResponse.externalUserId());
        }

        todoAppUserConfigRepository.save(userConfig);
        return new TickTickAuthorizationResult(TodoAppProvider.TICKTICK.getCode(), true);
    }

    public TickTickAuthorizationResult disconnectTickTickForCurrentUser() {
        User user = getCurrentUser();
        TodoAppUserConfig userConfig = todoAppUserConfigRepository
            .findOneByUserIdAndProvider(user.getId(), TodoAppProvider.TICKTICK)
            .orElseGet(() -> {
                TodoAppUserConfig config = new TodoAppUserConfig();
                config.setUser(user);
                config.setProvider(TodoAppProvider.TICKTICK);
                return config;
            });

        userConfig.setEnabled(Boolean.FALSE);
        userConfig.setAccessToken(null);
        userConfig.setExternalUserId(null);
        userConfig.setDefaultProjectId(null);
        todoAppUserConfigRepository.save(userConfig);

        return new TickTickAuthorizationResult(TodoAppProvider.TICKTICK.getCode(), true);
    }

    @Transactional(readOnly = true)
    public TickTickProjectsView getTickTickProjectsForCurrentUser() {
        User user = getCurrentUser();
        TodoAppUserConfig userConfig = todoAppUserConfigRepository
            .findOneByUserIdAndProvider(user.getId(), TodoAppProvider.TICKTICK)
            .orElseThrow(() -> new IllegalArgumentException(
                "TickTick is not connected to your account. Please click the TickTick button to authorize and connect your account."
            ));

        if (!Boolean.TRUE.equals(userConfig.getEnabled())) {
            throw new IllegalArgumentException(
                "TickTick integration is disabled for your account. Please re-authorize your TickTick connection."
            );
        }
        if (!StringUtils.hasText(userConfig.getAccessToken())) {
            throw new IllegalArgumentException(
                "TickTick access token is missing. Please re-authorize your TickTick connection."
            );
        }

        ApplicationProperties.Provider providerConfig = applicationProperties.getTodoapps().getProviders().get(TodoAppProvider.TICKTICK.getCode());
        if (providerConfig == null || !providerConfig.isEnabled()) {
            throw new IllegalArgumentException(
                "TickTick integration is not enabled on this server. Please contact your administrator."
            );
        }

        List<TickTickProjectView> projects = tickTickTodoAppClient
            .listProjectsOrLists(userConfig, providerConfig)
            .stream()
            .map(project -> new TickTickProjectView(project.id(), project.name()))
            .toList();

        return new TickTickProjectsView(resolveTickTickDefaultProjectName(userConfig), projects);
    }

    @Transactional(readOnly = true)
    public List<TodoAppConfigView> getCurrentUserConfigs() {
        User user = getCurrentUser();
        return Arrays.stream(TodoAppProvider.values()).map(provider -> buildConfigView(user.getId(), provider)).toList();
    }

    public TodoAppConfigView saveCurrentUserConfig(
        TodoAppProvider provider,
        Boolean enabled,
        String accessToken,
        String externalUserId,
        String defaultProjectId,
        String defaultProjectName
    ) {
        User user = getCurrentUser();
        TodoAppUserConfig config = todoAppUserConfigRepository
            .findOneByUserIdAndProvider(user.getId(), provider)
            .orElseGet(() -> {
                TodoAppUserConfig newConfig = new TodoAppUserConfig();
                newConfig.setUser(user);
                newConfig.setProvider(provider);
                return newConfig;
            });

        if (enabled != null) {
            config.setEnabled(enabled);
        }
        String normalizedAccessToken = normalize(accessToken);
        if (normalizedAccessToken != null || config.getAccessToken() == null) {
            config.setAccessToken(normalizedAccessToken);
        }
        String normalizedExternalUserId = normalize(externalUserId);
        if (provider != TodoAppProvider.TICKTICK || normalizedExternalUserId != null || config.getExternalUserId() == null) {
            config.setExternalUserId(normalizedExternalUserId);
        }
        if (provider != TodoAppProvider.TICKTICK) {
            config.setDefaultProjectId(normalize(defaultProjectId));
        }
        config.setDefaultProjectName(normalize(defaultProjectName));

        validateConfig(config);

        TodoAppUserConfig saved = todoAppUserConfigRepository.save(config);
        return buildConfigView(user.getId(), saved.getProvider());
    }

    @Transactional(readOnly = true)
    public TodoAppPushResult pushDecisionToProvider(Long decisionId, TodoAppProvider provider, String projectId, String title, Instant dueAt) {
        User user = getCurrentUser();
        ExtendedUser extendedUser = extendedUserRepository
            .findOneByUserId(user.getId())
            .orElseThrow(() -> new IllegalArgumentException("No ExtendedUser found for current user"));

        EvaluationDecision decision = evaluationDecisionRepository
            .findById(decisionId)
            .orElseThrow(() -> new IllegalArgumentException("Evaluation decision not found"));

        if (decision.getOwner() == null || !extendedUser.getId().equals(decision.getOwner().getId())) {
            throw new IllegalArgumentException("You can only push your own action items");
        }

        TodoAppUserConfig userConfig = todoAppUserConfigRepository
            .findOneByUserIdAndProvider(user.getId(), provider)
            .orElseThrow(() -> new IllegalArgumentException(
                "This provider (" + provider.getCode() + ") is not connected to your account. Please authorize the provider first."
            ));

        if (!Boolean.TRUE.equals(userConfig.getEnabled())) {
            throw new IllegalArgumentException(
                "Your " + provider.getCode() + " integration is disabled. Please re-authorize to use this provider."
            );
        }

        validateConfig(userConfig);

        ApplicationProperties.Provider providerConfig = applicationProperties.getTodoapps().getProviders().get(provider.getCode());
        if (providerConfig == null || !providerConfig.isEnabled()) {
            throw new IllegalArgumentException(
                "The " + provider.getCode() + " integration is not enabled on this server. Please contact your administrator."
            );
        }
        if (!hasRequiredProviderCredentials(provider, providerConfig)) {
            throw new IllegalArgumentException(
                "The " + provider.getCode() + " integration is not properly configured on this server. The server administrator needs to set up the provider credentials. Please contact your administrator."
            );
        }

        TodoAppClient client = clientsByProvider.get(provider);
        if (client == null) {
            throw new IllegalArgumentException("No client implementation found for provider " + provider.getCode());
        }

        String resolvedProjectId = provider == TodoAppProvider.TICKTICK ? normalize(projectId) : userConfig.getDefaultProjectId();
        if (provider == TodoAppProvider.TICKTICK && !StringUtils.hasText(resolvedProjectId)) {
            try {
                List<TickTickTodoAppClient.TickTickProject> availableProjects = tickTickTodoAppClient.listProjectsOrListsOrCreateDefault(userConfig, providerConfig);
                if (!availableProjects.isEmpty()) {
                    String defaultProjectName = resolveTickTickDefaultProjectName(userConfig);
                    resolvedProjectId = availableProjects
                        .stream()
                        .filter(project -> project.name() != null && project.name().trim().equalsIgnoreCase(defaultProjectName))
                        .map(TickTickTodoAppClient.TickTickProject::id)
                        .findFirst()
                        .orElse(availableProjects.get(0).id());
                }
            } catch (Exception ex) {
                log.warn("Failed to get TickTick projects for default selection: {}", ex.getMessage());
                // Try the old fallback as last resort
                List<TickTickTodoAppClient.TickTickProject> availableProjects = tickTickTodoAppClient.listProjectsOrLists(userConfig, providerConfig);
                if (!availableProjects.isEmpty()) {
                    String defaultProjectName = resolveTickTickDefaultProjectName(userConfig);
                    resolvedProjectId = availableProjects
                        .stream()
                        .filter(project -> project.name() != null && project.name().trim().equalsIgnoreCase(defaultProjectName))
                        .map(TickTickTodoAppClient.TickTickProject::id)
                        .findFirst()
                        .orElse(availableProjects.get(0).id());
                }
            }
        }
        String resolvedTitle = normalize(title);
        Instant resolvedDueAt = dueAt != null ? dueAt : decision.getDate();

        TodoAppTaskRequest request = new TodoAppTaskRequest(
            StringUtils.hasText(resolvedTitle) ? resolvedTitle : decision.getDecision(),
            "From LifeRadar action item #" + decision.getId(),
            resolvedDueAt,
            resolvedProjectId
        );

        return client.createTask(request, userConfig, providerConfig);
    }

    private User getCurrentUser() {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new IllegalArgumentException("User not authenticated"));
        return userRepository.findOneByLogin(login).orElseThrow(() -> new IllegalArgumentException("Current user not found"));
    }

    private ExtendedUser ensureExtendedUserExists(User user) {
        return extendedUserRepository
            .findOneByUser(user)
            .orElseGet(() -> {
                ExtendedUser newExtendedUser = new ExtendedUser();
                newExtendedUser.setUser(user);
                newExtendedUser.setFullName(buildFullName(user));
                newExtendedUser.setActive(user.isActivated());
                return extendedUserRepository.save(newExtendedUser);
            });
    }

    private String buildFullName(User user) {
        String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? user.getLogin() : fullName;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }

    private TodoAppConfigView buildConfigView(Long userId, TodoAppProvider provider) {
        Optional<TodoAppUserConfig> configOptional = todoAppUserConfigRepository.findOneByUserIdAndProvider(userId, provider);
        ApplicationProperties.Provider providerConfig = applicationProperties.getTodoapps().getProviders().get(provider.getCode());
        TodoAppUserConfig config = configOptional.orElse(null);

        return new TodoAppConfigView(
            provider,
            providerConfig != null && providerConfig.isEnabled() && hasRequiredProviderCredentials(provider, providerConfig),
            config != null,
            config != null ? config.getEnabled() : Boolean.FALSE,
            config != null && StringUtils.hasText(config.getAccessToken()),
            config != null ? config.getExternalUserId() : null,
            config != null ? config.getDefaultProjectId() : null,
            config != null ? config.getDefaultProjectName() : null,
            providerConfig != null ? providerConfig.getBaseUrl() : null,
            requiresDefaultProjectId(provider)
        );
    }

    private void validateConfig(TodoAppUserConfig config) {
        if (!Boolean.TRUE.equals(config.getEnabled())) {
            return;
        }

        if (config.getProvider() != TodoAppProvider.TICKTICK && !StringUtils.hasText(config.getAccessToken())) {
            throw new IllegalArgumentException("Access token is required when integration is enabled");
        }

        if (requiresDefaultProjectId(config.getProvider()) && !StringUtils.hasText(config.getDefaultProjectId())) {
            throw new IllegalArgumentException("Default project/list ID is required for provider " + config.getProvider().getCode());
        }
    }

    private boolean requiresDefaultProjectId(TodoAppProvider provider) {
        return provider == TodoAppProvider.MICROSOFT_TODO;
    }

    private boolean hasRequiredProviderCredentials(TodoAppProvider provider, ApplicationProperties.Provider providerConfig) {
        if (providerConfig == null) {
            return false;
        }
        if (provider != TodoAppProvider.TICKTICK) {
            return true;
        }

        return StringUtils.hasText(providerConfig.getClientId()) && StringUtils.hasText(providerConfig.getSecretId());
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String resolveTickTickDefaultProjectName(TodoAppUserConfig config) {
        if (config != null && StringUtils.hasText(config.getDefaultProjectName())) {
            return config.getDefaultProjectName().trim();
        }
        return "Liferadar";
    }

    public record TodoAppConfigView(
        TodoAppProvider provider,
        Boolean available,
        Boolean configured,
        Boolean enabled,
        Boolean hasAccessToken,
        String externalUserId,
        String defaultProjectId,
        String defaultProjectName,
        String baseUrl,
        Boolean requiresDefaultProjectId
    ) {}

    public record TickTickAuthorizationView(String authorizeUrl, String state) {}

    public record TickTickAuthorizationResult(String provider, Boolean success) {}

    public record TickTickProjectsView(String defaultProjectName, List<TickTickProjectView> projects) {}

    public record TickTickProjectView(String id, String name) {}
}

