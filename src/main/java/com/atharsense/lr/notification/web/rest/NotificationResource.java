package com.atharsense.lr.notification.web.rest;

import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.service.NotificationInboxService;
import com.atharsense.lr.notification.web.rest.vm.NotificationVM;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

@RestController
@RequestMapping("/api/notifications")
public class NotificationResource {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationResource.class);

    private final NotificationInboxService notificationInboxService;

    public NotificationResource(NotificationInboxService notificationInboxService) {
        this.notificationInboxService = notificationInboxService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<NotificationVM>> getCurrentUserNotifications(
        @RequestParam(value = "unreadOnly", required = false) Boolean unreadOnly,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get current user notifications, unreadOnly={}", unreadOnly);
        Page<Notification> page = notificationInboxService.findCurrentUserNotifications(unreadOnly, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.map(NotificationVM::from).getContent());
    }

    @GetMapping("/my/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationInboxService.countUnreadForCurrentUser()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationVM> markAsRead(@PathVariable("id") Long id) {
        LOG.debug("REST request to mark notification as read: {}", id);
        Notification notification = notificationInboxService.markCurrentUserNotificationRead(id);
        return ResponseEntity.ok(NotificationVM.from(notification));
    }

    @PatchMapping("/my/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead() {
        int updated = notificationInboxService.markAllCurrentUserNotificationsRead();
        return ResponseEntity.ok(Map.of("updated", updated));
    }
}

