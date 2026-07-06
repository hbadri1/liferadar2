package com.atharsense.lr.service;

import com.atharsense.lr.domain.MyDocument;
import com.atharsense.lr.domain.MyDocument.DocumentStatus;
import com.atharsense.lr.domain.MyDocument.RenewalReminderOption;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.MyDocumentRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.dto.MyDocumentSummaryDTO;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MyDocumentService {

    private static final Logger LOG = LoggerFactory.getLogger(MyDocumentService.class);
    private static final EnumSet<DocumentStatus> ACTIVE_STATUSES = EnumSet.of(DocumentStatus.ACTIVE, DocumentStatus.RENEWED);

    private final MyDocumentRepository myDocumentRepository;
    private final UserService userService;
    private final ExtendedUserRepository extendedUserRepository;

    public MyDocumentService(MyDocumentRepository myDocumentRepository, UserService userService, ExtendedUserRepository extendedUserRepository) {
        this.myDocumentRepository = myDocumentRepository;
        this.userService = userService;
        this.extendedUserRepository = extendedUserRepository;
    }

    public MyDocument save(MyDocument document) {
        LOG.debug("Request to save MyDocument : {}", document);
        normalizeDocument(document);
        return myDocumentRepository.save(document);
    }

    public MyDocument update(MyDocument document) {
        LOG.debug("Request to update MyDocument : {}", document);
        normalizeDocument(document);
        return myDocumentRepository.save(document);
    }

    public Optional<MyDocument> partialUpdate(MyDocument document) {
        LOG.debug("Request to partially update MyDocument : {}", document);

        return myDocumentRepository
            .findById(document.getId())
            .map(existingDocument -> {
                if (document.getName() != null) {
                    existingDocument.setName(document.getName());
                }
                if (document.getDocumentType() != null) {
                    existingDocument.setDocumentType(document.getDocumentType());
                }
                if (document.getIssuer() != null) {
                    existingDocument.setIssuer(document.getIssuer());
                }
                if (document.getIssueDate() != null) {
                    existingDocument.setIssueDate(document.getIssueDate());
                }
                if (document.getRenewalDate() != null) {
                    existingDocument.setRenewalDate(document.getRenewalDate());
                }
                if (document.getStatus() != null) {
                    existingDocument.setStatus(document.getStatus());
                }
                if (document.getRenewalReminder() != null) {
                    existingDocument.setRenewalReminder(document.getRenewalReminder());
                }
                if (document.getNotes() != null) {
                    existingDocument.setNotes(document.getNotes());
                }
                normalizeDocument(existingDocument);
                return existingDocument;
            })
            .map(myDocumentRepository::save);
    }

    @Transactional(readOnly = true)
    public Page<MyDocument> findByCurrentUser(Pageable pageable) {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> myDocumentRepository.findByOwnerId(owner.getId(), pageable))
            .orElseGet(Page::empty);
    }

    @Transactional(readOnly = true)
    public Optional<MyDocument> findOne(Long id) {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .flatMap(owner -> myDocumentRepository.findByIdAndOwnerId(id, owner.getId()));
    }

    public void delete(Long id) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .flatMap(owner -> myDocumentRepository.findByIdAndOwnerId(id, owner.getId()))
            .ifPresent(myDocumentRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<MyDocument> findReminderCandidates(LocalDate renewalDate, RenewalReminderOption reminderOption) {
        return myDocumentRepository.findReminderCandidates(renewalDate, reminderOption, ACTIVE_STATUSES);
    }

    @Transactional(readOnly = true)
    public List<MyDocument> findDueTodayCandidates(LocalDate businessDate) {
        return myDocumentRepository.findDueTodayCandidates(businessDate, ACTIVE_STATUSES);
    }

    @Transactional(readOnly = true)
    public List<MyDocument> findOverdueCandidates(LocalDate businessDate) {
        return myDocumentRepository.findOverdueCandidates(businessDate, ACTIVE_STATUSES);
    }

    public int markExpiredDocuments(LocalDate businessDate) {
        return myDocumentRepository.markDocumentsExpired(
            businessDate,
            DocumentStatus.EXPIRED,
            EnumSet.of(DocumentStatus.ACTIVE, DocumentStatus.RENEWED)
        );
    }

    @Transactional(readOnly = true)
    public MyDocumentSummaryDTO getSummaryByCurrentUser() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> {
                List<MyDocument> documents = myDocumentRepository.findByOwnerId(owner.getId());
                LocalDate today = LocalDate.now();
                int upcomingRenewals = (int) documents
                    .stream()
                    .filter(document -> document.getRenewalDate() != null)
                    .filter(document -> !document.getRenewalDate().isBefore(today))
                    .filter(document -> !document.getRenewalDate().isAfter(today.plusDays(30)))
                    .count();
                int expiredDocuments = (int) documents.stream().filter(document -> document.getStatus() == DocumentStatus.EXPIRED).count();
                return new MyDocumentSummaryDTO(documents.size(), upcomingRenewals, expiredDocuments);
            })
            .orElseGet(() -> new MyDocumentSummaryDTO(0, 0, 0));
    }

    private void normalizeDocument(MyDocument document) {
        if (document.getStatus() == null) {
            document.setStatus(DocumentStatus.ACTIVE);
        }
    }
}
