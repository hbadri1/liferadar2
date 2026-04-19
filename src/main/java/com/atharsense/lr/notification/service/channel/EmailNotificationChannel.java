package com.atharsense.lr.notification.service.channel;

import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.domain.NotificationDelivery;
import com.atharsense.lr.notification.domain.enumeration.NotificationChannelType;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import org.apache.commons.lang3.StringUtils;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import tech.jhipster.config.JHipsterProperties;

@Component
public class EmailNotificationChannel implements NotificationChannel {

    private final JavaMailSender javaMailSender;
    private final JHipsterProperties jHipsterProperties;

    public EmailNotificationChannel(JavaMailSender javaMailSender, JHipsterProperties jHipsterProperties) {
        this.javaMailSender = javaMailSender;
        this.jHipsterProperties = jHipsterProperties;
    }

    @Override
    public NotificationChannelType getChannelType() {
        return NotificationChannelType.EMAIL;
    }

    @Override
    public DeliveryResult deliver(Notification notification, NotificationDelivery delivery) {
        String targetEmail = StringUtils.firstNonBlank(
            delivery != null ? delivery.getDestination() : null,
            notification.getRecipient() != null ? notification.getRecipient().getEmail() : null
        );

        if (StringUtils.isBlank(targetEmail)) {
            return DeliveryResult.failure("Recipient email is missing", false);
        }

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, StandardCharsets.UTF_8.name());
            helper.setTo(targetEmail);
            helper.setFrom(jHipsterProperties.getMail().getFrom());
            helper.setSubject(notification.getTitle());
            helper.setText(buildEmailBody(notification), false);
            javaMailSender.send(mimeMessage);
            return DeliveryResult.success(null);
        } catch (MailAuthenticationException e) {
            return DeliveryResult.failure(e.getMessage(), false);
        } catch (MailException | MessagingException e) {
            return DeliveryResult.failure(e.getMessage(), true);
        }
    }

    private String buildEmailBody(Notification notification) {
        StringBuilder builder = new StringBuilder();
        builder.append(notification.getMessage());
        if (StringUtils.isNotBlank(notification.getActionUrl())) {
            builder.append(System.lineSeparator()).append(System.lineSeparator()).append("Open: ").append(notification.getActionUrl());
        }
        return builder.toString();
    }
}

