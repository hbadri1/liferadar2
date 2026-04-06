package com.atharsense.lr.web.rest;

import com.atharsense.lr.service.MailService;
import com.atharsense.lr.web.rest.vm.ContactMessageVM;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for the public contact / feedback form.
 * Accessible to both authenticated and unauthenticated users.
 */
@RestController
@RequestMapping("/api")
public class ContactResource {

    private static final Logger LOG = LoggerFactory.getLogger(ContactResource.class);

    private static final String CONTACT_EMAIL = "info@atharsense.com";

    private final MailService mailService;

    public ContactResource(MailService mailService) {
        this.mailService = mailService;
    }

    /**
     * {@code POST /contact} : receive a feedback message and forward it by e-mail.
     *
     * @param contact the contact form payload.
     * @return 200 OK on success.
     */
    @PostMapping("/contact")
    public ResponseEntity<Void> sendContactMessage(@Valid @RequestBody ContactMessageVM contact) {
        LOG.info("Contact message received from: {}", contact.getName());

        String subject = "[Liferadar] Message from " + contact.getName();

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><body>");
        html.append("<h2 style=\"color:#142033;\">New feedback message — Liferadar</h2>");
        html.append("<table style=\"font-family:sans-serif;font-size:14px;border-collapse:collapse;\">");
        html.append("<tr><td style=\"padding:6px 12px;font-weight:bold;\">Name</td>")
            .append("<td style=\"padding:6px 12px;\">").append(escapeHtml(contact.getName())).append("</td></tr>");
        if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
            html.append("<tr><td style=\"padding:6px 12px;font-weight:bold;\">Email</td>")
                .append("<td style=\"padding:6px 12px;\">").append(escapeHtml(contact.getEmail())).append("</td></tr>");
        }
        html.append("</table>");
        html.append("<hr style=\"margin:16px 0;\"/>");
        html.append("<p style=\"font-family:sans-serif;font-size:14px;white-space:pre-wrap;\">")
            .append(escapeHtml(contact.getMessage()).replace("\n", "<br/>"))
            .append("</p>");
        html.append("<hr style=\"margin:16px 0;\"/>");
        html.append("<p style=\"font-family:sans-serif;font-size:12px;color:#888;\">")
            .append("Sent via the Liferadar feedback form.</p>");
        html.append("</body></html>");

        mailService.sendEmail(CONTACT_EMAIL, subject, html.toString(), false, true);

        return ResponseEntity.ok().build();
    }

    private static String escapeHtml(String input) {
        if (input == null) {
            return "";
        }
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;");
    }
}

