package com.atharsense.lr.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.LifePillar;
import com.atharsense.lr.domain.SubLifePillar;
import com.atharsense.lr.domain.SubLifePillarItem;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.LifePillarRepository;
import com.atharsense.lr.repository.SubLifePillarItemRepository;
import com.atharsense.lr.repository.SubLifePillarRepository;
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
class SuggestedLifePillarImportServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExtendedUserRepository extendedUserRepository;

    @Mock
    private LifePillarRepository lifePillarRepository;

    @Mock
    private SubLifePillarRepository subLifePillarRepository;

    @Mock
    private SubLifePillarItemRepository subLifePillarItemRepository;

    private SuggestedLifePillarImportService suggestedLifePillarImportService;

    @BeforeEach
    void setUp() {
        suggestedLifePillarImportService = new SuggestedLifePillarImportService(
            new ObjectMapper(),
            userRepository,
            extendedUserRepository,
            lifePillarRepository,
            subLifePillarRepository,
            subLifePillarItemRepository
        );

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("tester", "token"));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldImportSuggestedLifePillarsAndAvoidDuplicatesOnSecondRun() {
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

        Map<String, LifePillar> lifePillarsByCode = new HashMap<>();
        Map<String, SubLifePillar> subLifePillarsByCode = new HashMap<>();
        Map<String, SubLifePillarItem> itemsByCode = new HashMap<>();
        AtomicLong lifePillarSequence = new AtomicLong(100);
        AtomicLong subLifePillarSequence = new AtomicLong(500);
        AtomicLong itemSequence = new AtomicLong(1000);

        when(lifePillarRepository.findByOwnerIdAndCode(eq(owner.getId()), anyString()))
            .thenAnswer(invocation -> Optional.ofNullable(lifePillarsByCode.get(invocation.getArgument(1, String.class))));
        when(subLifePillarRepository.findByOwnerIdAndCode(eq(owner.getId()), anyString()))
            .thenAnswer(invocation -> Optional.ofNullable(subLifePillarsByCode.get(invocation.getArgument(1, String.class))));
        when(subLifePillarItemRepository.findByOwnerIdAndCode(eq(owner.getId()), anyString()))
            .thenAnswer(invocation -> Optional.ofNullable(itemsByCode.get(invocation.getArgument(1, String.class))));

        when(lifePillarRepository.save(any(LifePillar.class))).thenAnswer(invocation -> {
            LifePillar entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                entity.setId(lifePillarSequence.incrementAndGet());
            }
            lifePillarsByCode.put(entity.getCode(), entity);
            return entity;
        });
        when(subLifePillarRepository.save(any(SubLifePillar.class))).thenAnswer(invocation -> {
            SubLifePillar entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                entity.setId(subLifePillarSequence.incrementAndGet());
            }
            subLifePillarsByCode.put(entity.getCode(), entity);
            return entity;
        });
        when(subLifePillarItemRepository.save(any(SubLifePillarItem.class))).thenAnswer(invocation -> {
            SubLifePillarItem entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                entity.setId(itemSequence.incrementAndGet());
            }
            itemsByCode.put(entity.getCode(), entity);
            return entity;
        });

        SuggestedLifePillarImportService.SuggestedLifePillarImportResult firstImport = suggestedLifePillarImportService.importSuggestedLifePillars();
        SuggestedLifePillarImportService.SuggestedLifePillarImportResult secondImport = suggestedLifePillarImportService.importSuggestedLifePillars();

        assertThat(firstImport.lifePillarsCreated()).isEqualTo(4);
        assertThat(firstImport.subLifePillarsCreated()).isEqualTo(19);
        assertThat(firstImport.subLifePillarItemsCreated()).isEqualTo(54);
        assertThat(firstImport.translationsCreated()).isEqualTo(231);

        assertThat(secondImport.lifePillarsCreated()).isZero();
        assertThat(secondImport.subLifePillarsCreated()).isZero();
        assertThat(secondImport.subLifePillarItemsCreated()).isZero();
        assertThat(secondImport.translationsCreated()).isZero();

        assertThat(lifePillarsByCode.get("P").getTranslations()).hasSize(3);
        assertThat(subLifePillarsByCode.get("P-H").getTranslations()).hasSize(3);
        assertThat(itemsByCode.get("P-H-N").getTranslations()).hasSize(3);
        assertThat(itemsByCode.get("P-H-N").getSubLifePillar()).isSameAs(subLifePillarsByCode.get("P-H"));
        assertThat(subLifePillarsByCode.get("P-H").getLifePillar()).isSameAs(lifePillarsByCode.get("P"));
    }
}

