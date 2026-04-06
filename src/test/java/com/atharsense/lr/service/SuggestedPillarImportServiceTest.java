package com.atharsense.lr.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.Pillar;
import com.atharsense.lr.domain.SubPillar;
import com.atharsense.lr.domain.SubPillarItem;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.PillarRepository;
import com.atharsense.lr.repository.SubPillarItemRepository;
import com.atharsense.lr.repository.SubPillarRepository;
import com.atharsense.lr.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class SuggestedPillarImportServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExtendedUserRepository extendedUserRepository;

    @Mock
    private PillarRepository pillarRepository;

    @Mock
    private SubPillarRepository subPillarRepository;

    @Mock
    private SubPillarItemRepository subPillarItemRepository;

    private SuggestedPillarImportService suggestedPillarImportService;

    @BeforeEach
    void setUp() {
        suggestedPillarImportService = new SuggestedPillarImportService(
            new ObjectMapper(),
            userRepository,
            extendedUserRepository,
            pillarRepository,
            subPillarRepository,
            subPillarItemRepository
        );

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("tester", "token"));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldImportSuggestedPillarsAndAvoidDuplicatesOnSecondRun() {
        User user = new User();
        user.setId(1L);
        user.setLogin("tester");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setActivated(true);

        ExtendedUser owner = new ExtendedUser();
        owner.setId(10L);
        owner.setUser(user);
        owner.setFullName("Test User");
        owner.setActive(true);

        when(userRepository.findOneByLogin("tester")).thenReturn(Optional.of(user));
        when(extendedUserRepository.findOneByUser(user)).thenReturn(Optional.of(owner));

        Map<String, Pillar> pillarsByCode = new HashMap<>();
        Map<String, SubPillar> subPillarsByCode = new HashMap<>();
        Map<String, SubPillarItem> itemsByCode = new HashMap<>();
        AtomicLong pillarSequence = new AtomicLong(100);
        AtomicLong subPillarSequence = new AtomicLong(500);
        AtomicLong itemSequence = new AtomicLong(1000);

        when(pillarRepository.findByOwnerIdAndCodeIgnoreCase(eq(owner.getId()), anyString()))
            .thenAnswer(invocation -> Optional.ofNullable(pillarsByCode.get(invocation.getArgument(1, String.class))));
        when(subPillarRepository.findByOwnerIdAndCodeIgnoreCase(eq(owner.getId()), anyString()))
            .thenAnswer(invocation -> Optional.ofNullable(subPillarsByCode.get(invocation.getArgument(1, String.class))));
        when(subPillarItemRepository.findByOwnerIdAndCodeIgnoreCase(eq(owner.getId()), anyString()))
            .thenAnswer(invocation -> Optional.ofNullable(itemsByCode.get(invocation.getArgument(1, String.class))));

        when(pillarRepository.save(any(Pillar.class))).thenAnswer(invocation -> {
            Pillar entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                entity.setId(pillarSequence.incrementAndGet());
            }
            pillarsByCode.put(entity.getCode(), entity);
            return entity;
        });
        when(subPillarRepository.save(any(SubPillar.class))).thenAnswer(invocation -> {
            SubPillar entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                entity.setId(subPillarSequence.incrementAndGet());
            }
            subPillarsByCode.put(entity.getCode(), entity);
            return entity;
        });
        when(subPillarItemRepository.save(any(SubPillarItem.class))).thenAnswer(invocation -> {
            SubPillarItem entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                entity.setId(itemSequence.incrementAndGet());
            }
            itemsByCode.put(entity.getCode(), entity);
            return entity;
        });

        SuggestedPillarImportService.SuggestedPillarImportResult firstImport = suggestedPillarImportService.importSuggestedPillars();
        SuggestedPillarImportService.SuggestedPillarImportResult secondImport = suggestedPillarImportService.importSuggestedPillars();

        assertThat(firstImport.pillarsCreated()).isEqualTo(4);
        assertThat(firstImport.subPillarsCreated()).isEqualTo(19);
        assertThat(firstImport.subPillarItemsCreated()).isEqualTo(56);
        assertThat(firstImport.translationsCreated()).isEqualTo(237);

        assertThat(secondImport.pillarsCreated()).isZero();
        assertThat(secondImport.subPillarsCreated()).isZero();
        assertThat(secondImport.subPillarItemsCreated()).isZero();
        assertThat(secondImport.translationsCreated()).isZero();

        assertThat(pillarsByCode.get("P").getTranslations()).hasSize(3);
        assertThat(subPillarsByCode.get("P-H").getTranslations()).hasSize(3);
        assertThat(itemsByCode.get("P-H-N").getTranslations()).hasSize(3);
        assertThat(itemsByCode.get("P-H-N").getSubPillar()).isSameAs(subPillarsByCode.get("P-H"));
        assertThat(subPillarsByCode.get("P-H").getPillar()).isSameAs(pillarsByCode.get("P"));
    }
}

