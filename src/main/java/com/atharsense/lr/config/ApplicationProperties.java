package com.atharsense.lr.config;

import com.atharsense.lr.notification.domain.enumeration.NotificationChannelType;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Liferadar.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final Liquibase liquibase = new Liquibase();
    private final Notifications notifications = new Notifications();
    private final Todoapps todoapps = new Todoapps();

    // jhipster-needle-application-properties-property

    public Liquibase getLiquibase() {
        return liquibase;
    }

    public Notifications getNotifications() {
        return notifications;
    }

    public Todoapps getTodoapps() {
        return todoapps;
    }

    // jhipster-needle-application-properties-property-getter

    public static class Liquibase {

        private Boolean asyncStart = true;

        public Boolean getAsyncStart() {
            return asyncStart;
        }

        public void setAsyncStart(Boolean asyncStart) {
            this.asyncStart = asyncStart;
        }
    }

    public static class Todoapps {

        private Map<String, Provider> providers = new LinkedHashMap<>();

        public Map<String, Provider> getProviders() {
            return providers;
        }

        public void setProviders(Map<String, Provider> providers) {
            this.providers = providers;
        }
    }

    public static class Notifications {

        private boolean enabled = true;

        private final Scheduler scheduler = new Scheduler();

        private final Delivery delivery = new Delivery();

        private final Channels channels = new Channels();

        private final Websocket websocket = new Websocket();

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public Scheduler getScheduler() {
            return scheduler;
        }

        public Delivery getDelivery() {
            return delivery;
        }

        public Channels getChannels() {
            return channels;
        }

        public Websocket getWebsocket() {
            return websocket;
        }
    }

    public static class Scheduler {

        private String cron = "0 0 0 * * *";

        private String zone = "UTC";

        private Integer upcomingRenewalDays = 7;

        private EnumSet<NotificationChannelType> defaultChannels = EnumSet.of(NotificationChannelType.PORTAL, NotificationChannelType.EMAIL);

        public String getCron() {
            return cron;
        }

        public void setCron(String cron) {
            this.cron = cron;
        }

        public String getZone() {
            return zone;
        }

        public void setZone(String zone) {
            this.zone = zone;
        }

        public Integer getUpcomingRenewalDays() {
            return upcomingRenewalDays;
        }

        public void setUpcomingRenewalDays(Integer upcomingRenewalDays) {
            this.upcomingRenewalDays = upcomingRenewalDays;
        }

        public EnumSet<NotificationChannelType> getDefaultChannels() {
            return defaultChannels;
        }

        public void setDefaultChannels(EnumSet<NotificationChannelType> defaultChannels) {
            this.defaultChannels = defaultChannels;
        }
    }

    public static class Delivery {

        private String retryCron = "0 */15 * * * *";

        private String retryZone = "UTC";

        private Integer maxAttempts = 5;

        private Integer retryBackoffMinutes = 30;

        private Integer batchSize = 100;

        public String getRetryCron() {
            return retryCron;
        }

        public void setRetryCron(String retryCron) {
            this.retryCron = retryCron;
        }

        public String getRetryZone() {
            return retryZone;
        }

        public void setRetryZone(String retryZone) {
            this.retryZone = retryZone;
        }

        public Integer getMaxAttempts() {
            return maxAttempts;
        }

        public void setMaxAttempts(Integer maxAttempts) {
            this.maxAttempts = maxAttempts;
        }

        public Integer getRetryBackoffMinutes() {
            return retryBackoffMinutes;
        }

        public void setRetryBackoffMinutes(Integer retryBackoffMinutes) {
            this.retryBackoffMinutes = retryBackoffMinutes;
        }

        public Integer getBatchSize() {
            return batchSize;
        }

        public void setBatchSize(Integer batchSize) {
            this.batchSize = batchSize;
        }
    }

    public static class Channels {

        private boolean uiEnabled = true;

        private boolean emailEnabled = true;

        public boolean isUiEnabled() {
            return uiEnabled;
        }

        public void setUiEnabled(boolean uiEnabled) {
            this.uiEnabled = uiEnabled;
        }

        public boolean isEmailEnabled() {
            return emailEnabled;
        }

        public void setEmailEnabled(boolean emailEnabled) {
            this.emailEnabled = emailEnabled;
        }
    }

    public static class Websocket {

        private boolean enabled = false;

        private String endpoint = "/websocket/notifications";

        private String userDestination = "/queue/notifications";

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getEndpoint() {
            return endpoint;
        }

        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }

        public String getUserDestination() {
            return userDestination;
        }

        public void setUserDestination(String userDestination) {
            this.userDestination = userDestination;
        }
    }


    public static class Provider {

        private boolean enabled = false;

        private String baseUrl;

        private String createTaskPath;

        private String projectsPath;

        private String clientId;

        private String secretId;

        private String authorizeUrl;

        private String tokenPath;

        private String redirectUri;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getCreateTaskPath() {
            return createTaskPath;
        }

        public void setCreateTaskPath(String createTaskPath) {
            this.createTaskPath = createTaskPath;
        }

        public String getProjectsPath() {
            return projectsPath;
        }

        public void setProjectsPath(String projectsPath) {
            this.projectsPath = projectsPath;
        }

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }

        public String getSecretId() {
            return secretId;
        }

        public void setSecretId(String secretId) {
            this.secretId = secretId;
        }

        public String getAuthorizeUrl() {
            return authorizeUrl;
        }

        public void setAuthorizeUrl(String authorizeUrl) {
            this.authorizeUrl = authorizeUrl;
        }

        public String getTokenPath() {
            return tokenPath;
        }

        public void setTokenPath(String tokenPath) {
            this.tokenPath = tokenPath;
        }

        public String getRedirectUri() {
            return redirectUri;
        }

        public void setRedirectUri(String redirectUri) {
            this.redirectUri = redirectUri;
        }
    }
    // jhipster-needle-application-properties-property-class
}
