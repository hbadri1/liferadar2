package com.atharsense.lr.notification.domain;

import com.atharsense.lr.domain.AbstractAuditingEntity;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.notification.domain.enumeration.NotificationSourceType;
import com.atharsense.lr.notification.domain.enumeration.NotificationStatus;
import com.atharsense.lr.notification.domain.enumeration.NotificationType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "app_notification")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Notification extends AbstractAuditingEntity<Long> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50)
    private NotificationSourceType sourceType;

    @Size(max = 100)
    @Column(name = "source_id", length = 100)
    private String sourceId;

    @NotNull
    @Size(max = 160)
    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @NotNull
    @Size(max = 2000)
    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @Size(max = 500)
    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Lob
    @Column(name = "payload_json")
    private String payloadJson;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NotificationStatus status = NotificationStatus.UNREAD;

    @Column(name = "read_at")
    private Instant readAt;

    @Size(max = 191)
    @Column(name = "deduplication_key", unique = true, length = 191)
    private String deduplicationKey;

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<NotificationDelivery> deliveries = new LinkedHashSet<>();

    @Override
    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getRecipient() {
        return this.recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public NotificationType getType() {
        return this.type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public NotificationSourceType getSourceType() {
        return this.sourceType;
    }

    public void setSourceType(NotificationSourceType sourceType) {
        this.sourceType = sourceType;
    }

    public String getSourceId() {
        return this.sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }

    public String getTitle() {
        return this.title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return this.message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getActionUrl() {
        return this.actionUrl;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public String getPayloadJson() {
        return this.payloadJson;
    }

    public void setPayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
    }

    public NotificationStatus getStatus() {
        return this.status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public Instant getReadAt() {
        return this.readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public String getDeduplicationKey() {
        return this.deduplicationKey;
    }

    public void setDeduplicationKey(String deduplicationKey) {
        this.deduplicationKey = deduplicationKey;
    }

    public Set<NotificationDelivery> getDeliveries() {
        return this.deliveries;
    }

    public void setDeliveries(Set<NotificationDelivery> deliveries) {
        this.deliveries = deliveries;
    }

    public Notification addDelivery(NotificationDelivery delivery) {
        this.deliveries.add(delivery);
        delivery.setNotification(this);
        return this;
    }

    public Notification removeDelivery(NotificationDelivery delivery) {
        this.deliveries.remove(delivery);
        delivery.setNotification(null);
        return this;
    }

    public void markRead(Instant when) {
        this.status = NotificationStatus.READ;
        this.readAt = when;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Notification)) {
            return false;
        }
        return getId() != null && Objects.equals(getId(), ((Notification) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Notification{" +
            "id=" + getId() +
            ", type=" + getType() +
            ", sourceType=" + getSourceType() +
            ", sourceId='" + getSourceId() + '\'' +
            ", status=" + getStatus() +
            ", recipient=" + (getRecipient() != null ? getRecipient().getLogin() : null) +
            '}';
    }
}

