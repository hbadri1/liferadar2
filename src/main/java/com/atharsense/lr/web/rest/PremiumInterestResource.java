package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.PremiumInterest;
import com.atharsense.lr.repository.PremiumInterestRepository;
import com.atharsense.lr.security.AuthoritiesConstants;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.dto.PremiumInterestRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for capturing premium early-access interest registrations.
 * This endpoint is intentionally public – no authentication required.
 * Phase 0: no billing, no subscriptions, purely informational.
 */
@RestController
public class PremiumInterestResource {

    private static final Logger LOG = LoggerFactory.getLogger(PremiumInterestResource.class);

    private final PremiumInterestRepository premiumInterestRepository;

    public PremiumInterestResource(PremiumInterestRepository premiumInterestRepository) {
        this.premiumInterestRepository = premiumInterestRepository;
    }

    /**
     * {@code POST /api/premium-interests} : Register early-access interest.
     *
     * @param request the interest payload (email, optional feedback, optional source).
     * @return {@code 201 Created} with the saved record.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/api/premium-interests")
    public ResponseEntity<PremiumInterest> registerInterest(@Valid @RequestBody PremiumInterestRequest request)
        throws URISyntaxException {
        LOG.info("Premium early-access interest registered for email: {}", request.email());

        PremiumInterest interest = new PremiumInterest();
        interest.setEmail(request.email());
        interest.setFeedback(request.feedback());
        interest.setSource(request.source() != null ? request.source() : "web");

        // Attach authenticated user login if available
        SecurityUtils.getCurrentUserLogin().ifPresent(interest::setUserLogin);

        PremiumInterest saved = premiumInterestRepository.save(interest);

        LOG.info("Premium interest saved with id={} for email={}", saved.getId(), saved.getEmail());

        return ResponseEntity.created(new URI("/api/premium-interests/" + saved.getId())).body(saved);
    }

    /**
     * {@code GET /api/admin/premium-interests} : List all early-access registrations.
     * Restricted to ROLE_ADMIN.
     *
     * @return list of all {@link PremiumInterest} records ordered by createdDate descending.
     */
    @GetMapping("/api/admin/premium-interests")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<List<PremiumInterest>> getAllInterests() {
        LOG.info("Admin request: listing all premium interest registrations");
        List<PremiumInterest> interests = premiumInterestRepository.findAll(
            Sort.by(Sort.Direction.DESC, "createdDate")
        );
        return ResponseEntity.ok(interests);
    }
}

