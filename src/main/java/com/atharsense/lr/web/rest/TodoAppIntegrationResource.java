package com.atharsense.lr.web.rest;

import com.atharsense.lr.integrations.todoapps.TodoAppProvider;
import com.atharsense.lr.integrations.todoapps.TodoAppPushResult;
import com.atharsense.lr.service.TodoAppIntegrationService;
import com.atharsense.lr.service.TodoAppIntegrationService.TickTickAuthorizationView;
import com.atharsense.lr.service.TodoAppIntegrationService.TickTickProjectView;
import com.atharsense.lr.service.TodoAppIntegrationService.TickTickProjectsView;
import com.atharsense.lr.service.TodoAppIntegrationService.TodoAppConfigView;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/todoapps")
public class TodoAppIntegrationResource {

    private static final String ENTITY_NAME = "todoAppIntegration";

    private final TodoAppIntegrationService todoAppIntegrationService;

    public TodoAppIntegrationResource(TodoAppIntegrationService todoAppIntegrationService) {
        this.todoAppIntegrationService = todoAppIntegrationService;
    }

    @GetMapping("/configs")
    public ResponseEntity<List<TodoAppUserConfigVM>> getCurrentUserConfigs() {
        List<TodoAppUserConfigVM> configs = todoAppIntegrationService
            .getCurrentUserConfigs()
            .stream()
            .map(TodoAppUserConfigVM::from)
            .toList();
        return ResponseEntity.ok(configs);
    }

    @PutMapping("/configs/{provider}")
    public ResponseEntity<TodoAppUserConfigVM> saveCurrentUserConfig(
        @PathVariable("provider") String provider,
        @Valid @RequestBody TodoAppConfigUpdateRequest request
    ) {
        TodoAppProvider parsedProvider = parseProvider(provider);
        TodoAppUserConfigVM updated = TodoAppUserConfigVM.from(todoAppIntegrationService.saveCurrentUserConfig(
            parsedProvider,
            request.enabled(),
            request.accessToken(),
            request.externalUserId(),
            request.defaultProjectId(),
            request.defaultProjectName()
        ));
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/push")
    public ResponseEntity<TodoAppPushResponse> pushDecision(@Valid @RequestBody TodoAppPushRequest request) {
        TodoAppProvider provider = parseProvider(request.provider());
        try {
            TodoAppPushResult result = todoAppIntegrationService.pushDecisionToProvider(
                request.decisionId(),
                provider,
                request.projectId(),
                request.title(),
                request.dueAt()
            );
            return ResponseEntity.ok(new TodoAppPushResponse(result.provider().getCode(), result.externalTaskId(), result.message()));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestAlertException(ex.getMessage(), ENTITY_NAME, "integrationerror");
        }
    }

    @GetMapping("/ticktick/projects")
    public ResponseEntity<TickTickProjectsResponse> getTickTickProjects() {
        try {
            TickTickProjectsView view = todoAppIntegrationService.getTickTickProjectsForCurrentUser();
            return ResponseEntity.ok(
                new TickTickProjectsResponse(
                    view.defaultProjectName(),
                    view.projects().stream().map(TickTickProjectVM::from).toList()
                )
            );
        } catch (IllegalArgumentException ex) {
            throw new BadRequestAlertException(ex.getMessage(), ENTITY_NAME, "integrationerror");
        }
    }

    @GetMapping("/ticktick/authorize-url")
    public ResponseEntity<TickTickAuthorizeUrlResponse> getTickTickAuthorizeUrl() {
        TickTickAuthorizationView view = todoAppIntegrationService.getTickTickAuthorizationViewForCurrentUser();
        return ResponseEntity.ok(new TickTickAuthorizeUrlResponse(view.authorizeUrl()));
    }

    @GetMapping(value = "/ticktick/callback", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> handleTickTickCallback(
        @RequestParam(value = "code", required = false) String code,
        @RequestParam(value = "state", required = false) String state,
        @RequestParam(value = "error", required = false) String error
    ) {
        if (error != null) {
            return ResponseEntity.ok(renderTickTickPopupHtml("error", "TickTick authorization was denied: " + error));
        }

        try {
            todoAppIntegrationService.completeTickTickAuthorization(code, state);
            return ResponseEntity.ok(renderTickTickPopupHtml("success", "TickTick authorization completed successfully."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.ok(renderTickTickPopupHtml("error", ex.getMessage()));
        }
    }

    @PostMapping("/ticktick/disconnect")
    public ResponseEntity<TickTickActionResponse> disconnectTickTick() {
        todoAppIntegrationService.disconnectTickTickForCurrentUser();
        return ResponseEntity.ok(new TickTickActionResponse(true, "TickTick disconnected successfully."));
    }

    private TodoAppProvider parseProvider(String provider) {
        try {
            return TodoAppProvider.fromCode(provider);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestAlertException(ex.getMessage(), ENTITY_NAME, "unsupportedprovider");
        }
    }

    public record TodoAppPushRequest(@NotNull Long decisionId, @NotBlank String provider, String projectId, String title, Instant dueAt) {}

    public record TodoAppConfigUpdateRequest(Boolean enabled, String accessToken, String externalUserId, String defaultProjectId, String defaultProjectName) {}

    public record TodoAppPushResponse(String provider, String externalTaskId, String message) {}

    public record TickTickAuthorizeUrlResponse(String authorizeUrl) {}

    public record TickTickActionResponse(Boolean success, String message) {}

    public record TickTickProjectsResponse(String defaultProjectName, List<TickTickProjectVM> projects) {}

    public record TickTickProjectVM(String id, String name) {
        public static TickTickProjectVM from(TickTickProjectView project) {
            return new TickTickProjectVM(project.id(), project.name());
        }
    }

    public record TodoAppUserConfigVM(
        String provider,
        Boolean available,
        Boolean configured,
        Boolean enabled,
        Boolean hasAccessToken,
        String externalUserId,
        String defaultProjectId,
        String defaultProjectName,
        String baseUrl,
        Boolean requiresDefaultProjectId
    ) {
        public static TodoAppUserConfigVM from(TodoAppConfigView config) {
            return new TodoAppUserConfigVM(
                config.provider().getCode(),
                config.available(),
                config.configured(),
                config.enabled(),
                config.hasAccessToken(),
                config.externalUserId(),
                config.defaultProjectId(),
                config.defaultProjectName(),
                config.baseUrl(),
                config.requiresDefaultProjectId()
            );
        }
    }

    private String renderTickTickPopupHtml(String status, String message) {
        String safeStatus = escapeForJs(status);
        String safeMessage = escapeForJs(message);
        return """
            <!doctype html>
            <html>
            <head><meta charset=\"utf-8\"><title>TickTick OAuth</title></head>
            <body>
              <script>
                (function () {
                  var payload = { type: 'ticktick-oauth', status: '%s', message: '%s' };
                  if (window.opener) {
                    window.opener.postMessage(payload, window.location.origin);
                    window.close();
                  } else {
                    document.body.innerText = payload.message;
                  }
                })();
              </script>
            </body>
            </html>
            """.formatted(safeStatus, safeMessage);
    }

    private String escapeForJs(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").replace("\r", " ");
    }
}

