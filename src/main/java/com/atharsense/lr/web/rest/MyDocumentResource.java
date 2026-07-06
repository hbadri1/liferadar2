package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.MyDocument;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.MyDocumentService;
import com.atharsense.lr.service.UserService;
import com.atharsense.lr.service.dto.CreateMyDocumentRequest;
import com.atharsense.lr.service.dto.MyDocumentSummaryDTO;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/my-documents")
public class MyDocumentResource {

    private static final Logger LOG = LoggerFactory.getLogger(MyDocumentResource.class);
    private static final String ENTITY_NAME = "myDocument";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final MyDocumentService myDocumentService;
    private final UserService userService;
    private final ExtendedUserRepository extendedUserRepository;

    public MyDocumentResource(MyDocumentService myDocumentService, UserService userService, ExtendedUserRepository extendedUserRepository) {
        this.myDocumentService = myDocumentService;
        this.userService = userService;
        this.extendedUserRepository = extendedUserRepository;
    }

    @PostMapping("")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<MyDocument> createDocument(@Valid @RequestBody CreateMyDocumentRequest request) throws URISyntaxException {
        LOG.debug("REST request to save MyDocument : {}", request);

        MyDocument document = new MyDocument();
        document.setName(request.name());
        document.setDocumentType(request.documentType());
        document.setIssuer(request.issuer());
        document.setIssueDate(request.issueDate());
        document.setRenewalDate(request.renewalDate());
        document.setStatus(request.status());
        document.setRenewalReminder(request.renewalReminder());
        document.setNotes(request.notes());

        Optional<MyDocument> result = SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> {
                document.setOwner(owner);
                return myDocumentService.save(document);
            });

        if (result.isEmpty()) {
            throw new BadRequestAlertException("Could not find current user", ENTITY_NAME, "usernotfound");
        }

        MyDocument saved = result.orElseThrow();
        return ResponseEntity.created(new URI("/api/my-documents/" + saved.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, saved.getId().toString()))
            .body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<MyDocument> updateDocument(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CreateMyDocumentRequest request
    ) {
        LOG.debug("REST request to update MyDocument : {}, {}", id, request);
        MyDocument existingDocument = myDocumentService.findOne(id).orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));

        existingDocument.setName(request.name());
        existingDocument.setDocumentType(request.documentType());
        existingDocument.setIssuer(request.issuer());
        existingDocument.setIssueDate(request.issueDate());
        existingDocument.setRenewalDate(request.renewalDate());
        existingDocument.setStatus(request.status());
        existingDocument.setRenewalReminder(request.renewalReminder());
        existingDocument.setNotes(request.notes());

        MyDocument result = myDocumentService.update(existingDocument);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<List<MyDocument>> getAllMyDocuments(Pageable pageable) {
        Page<MyDocument> page = myDocumentService.findByCurrentUser(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<MyDocument> getDocument(@PathVariable("id") Long id) {
        Optional<MyDocument> document = myDocumentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(document);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<Void> deleteDocument(@PathVariable("id") Long id) {
        myDocumentService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<MyDocumentSummaryDTO> getSummary() {
        return ResponseEntity.ok(myDocumentService.getSummaryByCurrentUser());
    }
}
