package com.atharsense.lr.domain;

import com.atharsense.lr.integrations.todoapps.TodoAppProvider;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;

@Entity
@Table(
    name = "todo_app_user_config",
    uniqueConstraints = { @UniqueConstraint(name = "ux_todo_app_user_config_user_provider", columnNames = { "user_id", "provider" }) }
)
public class TodoAppUserConfig implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 40)
    private TodoAppProvider provider;

    @NotNull
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = Boolean.TRUE;

    @Size(max = 1000)
    @Column(name = "access_token", length = 1000)
    private String accessToken;

    @Size(max = 255)
    @Column(name = "external_user_id", length = 255)
    private String externalUserId;

    @Size(max = 255)
    @Column(name = "default_project_id", length = 255)
    private String defaultProjectId;

    @Size(max = 255)
    @Column(name = "default_project_name", length = 255)
    private String defaultProjectName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @NotNull
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties(value = { "authorities" }, allowSetters = true)
    private User user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TodoAppProvider getProvider() {
        return provider;
    }

    public void setProvider(TodoAppProvider provider) {
        this.provider = provider;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getExternalUserId() {
        return externalUserId;
    }

    public void setExternalUserId(String externalUserId) {
        this.externalUserId = externalUserId;
    }

    public String getDefaultProjectId() {
        return defaultProjectId;
    }

    public void setDefaultProjectId(String defaultProjectId) {
        this.defaultProjectId = defaultProjectId;
    }

    public String getDefaultProjectName() {
        return defaultProjectName;
    }

    public void setDefaultProjectName(String defaultProjectName) {
        this.defaultProjectName = defaultProjectName;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}

