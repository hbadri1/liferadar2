package com.atharsense.lr.service;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.Pillar;
import com.atharsense.lr.domain.PillarTranslation;
import com.atharsense.lr.domain.SubPillar;
import com.atharsense.lr.domain.SubPillarItem;
import com.atharsense.lr.domain.SubPillarItemTranslation;
import com.atharsense.lr.domain.SubPillarTranslation;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.domain.enumeration.LangCode;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.PillarRepository;
import com.atharsense.lr.repository.SubPillarItemRepository;
import com.atharsense.lr.repository.SubPillarRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class SuggestedPillarImportService {

    private static final Logger LOG = LoggerFactory.getLogger(SuggestedPillarImportService.class);

    private static final String ENTITY_NAME = "pillar";
    private static final Path SUGGESTED_PILLARS_FILE = Path.of("external", "basic-pillarsv1.0.json");
    private static final List<String> SUPPORTED_LANG_KEYS = List.of("en", "ar", "fr");
    private static final Map<String, LangCode> LANG_CODE_BY_KEY = Map.of(
        "en",
        LangCode.EN,
        "ar",
        LangCode.AR,
        "fr",
        LangCode.FR
    );

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final ExtendedUserRepository extendedUserRepository;
    private final PillarRepository pillarRepository;
    private final SubPillarRepository subPillarRepository;
    private final SubPillarItemRepository subPillarItemRepository;

    public SuggestedPillarImportService(
        ObjectMapper objectMapper,
        UserRepository userRepository,
        ExtendedUserRepository extendedUserRepository,
        PillarRepository pillarRepository,
        SubPillarRepository subPillarRepository,
        SubPillarItemRepository subPillarItemRepository
    ) {
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
        this.extendedUserRepository = extendedUserRepository;
        this.pillarRepository = pillarRepository;
        this.subPillarRepository = subPillarRepository;
        this.subPillarItemRepository = subPillarItemRepository;
    }

    public SuggestedPillarImportResult importSuggestedPillars() {
        ExtendedUser owner = getOrCreateCurrentExtendedUser();
        SuggestedPillarsPayload payload = readPayload();
        ImportCounts counts = new ImportCounts();

        for (PillarSeed pillarSeed : safeList(payload.pillars())) {
            Pillar pillar = upsertPillar(owner, pillarSeed, counts);

            for (SubPillarSeed subPillarSeed : safeList(pillarSeed.subPillars())) {
                SubPillar subPillar = upsertSubPillar(owner, pillar, subPillarSeed, counts);

                for (SubPillarItemSeed itemSeed : safeList(subPillarSeed.items())) {
                    upsertSubPillarItem(owner, subPillar, itemSeed, counts);
                }
            }
        }

        SuggestedPillarImportResult result = counts.toResult();
        LOG.info(
            "Imported suggested pillars for owner {}: pillars={}, subPillars={}, items={}, translations={}",
            owner.getId(),
            result.pillarsCreated(),
            result.subPillarsCreated(),
            result.subPillarItemsCreated(),
            result.translationsCreated()
        );
        return result;
    }

    private Pillar upsertPillar(ExtendedUser owner, PillarSeed seed, ImportCounts counts) {
        String code = normalizeCode(seed.code());
        Pillar pillar = pillarRepository.findByOwnerIdAndCodeIgnoreCase(owner.getId(), code).orElseGet(Pillar::new);
        boolean isNew = pillar.getId() == null;

        pillar.setCode(code);
        pillar.setIsActive(Boolean.TRUE);
        pillar.setOwner(owner);
        mergePillarTranslations(pillar, seed.name(), seed.description(), counts);

        Pillar saved = pillarRepository.save(pillar);
        if (isNew) {
            counts.pillarsCreated++;
        }
        return saved;
    }

    private SubPillar upsertSubPillar(ExtendedUser owner, Pillar pillar, SubPillarSeed seed, ImportCounts counts) {
        String code = normalizeCode(seed.code());
        SubPillar subPillar = subPillarRepository.findByOwnerIdAndCodeIgnoreCase(owner.getId(), code).orElseGet(SubPillar::new);
        boolean isNew = subPillar.getId() == null;

        subPillar.setCode(code);
        subPillar.setIsActive(Boolean.TRUE);
        subPillar.setOwner(owner);
        subPillar.setPillar(pillar);
        mergeSubPillarTranslations(subPillar, seed.name(), seed.description(), counts);

        SubPillar saved = subPillarRepository.save(subPillar);
        if (isNew) {
            counts.subPillarsCreated++;
        }
        return saved;
    }

    private void upsertSubPillarItem(
        ExtendedUser owner,
        SubPillar subPillar,
        SubPillarItemSeed seed,
        ImportCounts counts
    ) {
        String code = normalizeCode(seed.code());
        SubPillarItem item = subPillarItemRepository.findByOwnerIdAndCodeIgnoreCase(owner.getId(), code).orElseGet(SubPillarItem::new);
        boolean isNew = item.getId() == null;

        item.setCode(code);
        item.setSortOrder(1);
        item.setIsActive(Boolean.TRUE);
        item.setOwner(owner);
        item.setSubPillar(subPillar);
        mergeSubPillarItemTranslations(item, seed.name(), seed.description(), counts);

        subPillarItemRepository.save(item);
        if (isNew) {
            counts.subPillarItemsCreated++;
        }
    }

    private void mergePillarTranslations(
        Pillar pillar,
        Map<String, String> names,
        Map<String, String> descriptions,
        ImportCounts counts
    ) {
        Map<LangCode, PillarTranslation> existingByLang = Optional.ofNullable(pillar.getTranslations())
            .orElseGet(Collections::emptySet)
            .stream()
            .filter(translation -> translation.getLang() != null)
            .collect(Collectors.toMap(PillarTranslation::getLang, translation -> translation, (left, right) -> left));

        applyTranslations(names, descriptions, langCode -> {
            PillarTranslation translation = existingByLang.get(langCode.langCode());
            if (translation == null) {
                translation = new PillarTranslation();
                translation.setLang(langCode.langCode());
                pillar.addTranslations(translation);
                counts.translationsCreated++;
            }
            translation.setName(langCode.name());
            translation.setDescription(langCode.description());
        });
    }

    private void mergeSubPillarTranslations(
        SubPillar subPillar,
        Map<String, String> names,
        Map<String, String> descriptions,
        ImportCounts counts
    ) {
        Map<LangCode, SubPillarTranslation> existingByLang = Optional.ofNullable(subPillar.getTranslations())
            .orElseGet(Collections::emptySet)
            .stream()
            .filter(translation -> translation.getLang() != null)
            .collect(Collectors.toMap(SubPillarTranslation::getLang, translation -> translation, (left, right) -> left));

        applyTranslations(names, descriptions, langCode -> {
            SubPillarTranslation translation = existingByLang.get(langCode.langCode());
            if (translation == null) {
                translation = new SubPillarTranslation();
                translation.setLang(langCode.langCode());
                subPillar.addTranslations(translation);
                counts.translationsCreated++;
            }
            translation.setName(langCode.name());
            translation.setDescription(langCode.description());
        });
    }

    private void mergeSubPillarItemTranslations(
        SubPillarItem item,
        Map<String, String> names,
        Map<String, String> descriptions,
        ImportCounts counts
    ) {
        Map<LangCode, SubPillarItemTranslation> existingByLang = Optional.ofNullable(item.getTranslations())
            .orElseGet(Collections::emptySet)
            .stream()
            .filter(translation -> translation.getLang() != null)
            .collect(Collectors.toMap(SubPillarItemTranslation::getLang, translation -> translation, (left, right) -> left));

        applyTranslations(names, descriptions, langCode -> {
            SubPillarItemTranslation translation = existingByLang.get(langCode.langCode());
            if (translation == null) {
                translation = new SubPillarItemTranslation();
                translation.setLang(langCode.langCode());
                item.addTranslations(translation);
                counts.translationsCreated++;
            }
            translation.setName(langCode.name());
            translation.setDescription(langCode.description());
        });
    }

    private void applyTranslations(Map<String, String> names, Map<String, String> descriptions, Consumer<ResolvedTranslation> consumer) {
        Map<String, String> safeNames = names != null ? names : Collections.emptyMap();
        Map<String, String> safeDescriptions = descriptions != null ? descriptions : Collections.emptyMap();

        for (String langKey : SUPPORTED_LANG_KEYS) {
            String name = normalize(safeNames.get(langKey));
            if (!StringUtils.hasText(name)) {
                continue;
            }
            consumer.accept(new ResolvedTranslation(LANG_CODE_BY_KEY.get(langKey), name, normalize(safeDescriptions.get(langKey))));
        }
    }

    private SuggestedPillarsPayload readPayload() {
        try (InputStream inputStream = openPayloadStream()) {
            return objectMapper.readValue(inputStream, SuggestedPillarsPayload.class);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to read suggested pillars JSON", exception);
        }
    }

    private InputStream openPayloadStream() throws IOException {
        if (Files.exists(SUGGESTED_PILLARS_FILE)) {
            return Files.newInputStream(SUGGESTED_PILLARS_FILE);
        }

        InputStream classpathStream = getClass().getClassLoader().getResourceAsStream("external/basic-pillarsv1.0.json");
        if (classpathStream != null) {
            return classpathStream;
        }

        classpathStream = getClass().getClassLoader().getResourceAsStream("basic-pillarsv1.0.json");
        if (classpathStream != null) {
            return classpathStream;
        }

        throw new IOException("Suggested pillars file not found at " + SUGGESTED_PILLARS_FILE.toAbsolutePath());
    }

    private ExtendedUser getOrCreateCurrentExtendedUser() {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("User not authenticated", ENTITY_NAME, "notauthenticated"));

        User currentUser = userRepository.findOneByLogin(currentLogin)
            .orElseThrow(() -> new BadRequestAlertException("User not found", ENTITY_NAME, "usernotfound"));

        return extendedUserRepository.findOneByUser(currentUser).orElseGet(() -> {
            ExtendedUser extendedUser = new ExtendedUser();
            extendedUser.setUser(currentUser);
            extendedUser.setFullName(buildFullName(currentUser));
            extendedUser.setActive(currentUser.isActivated());
            return extendedUserRepository.save(extendedUser);
        });
    }

    private String buildFullName(User user) {
        String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? user.getLogin() : fullName;
    }

    private String normalize(String value) {
        String trimmed = value != null ? value.trim() : null;
        return StringUtils.hasText(trimmed) ? trimmed : null;
    }

    private String normalizeCode(String code) {
        String normalized = normalize(code);
        if (!StringUtils.hasText(normalized)) {
            throw new BadRequestAlertException("Missing code in suggested pillars payload", ENTITY_NAME, "missingcode");
        }
        return normalized;
    }

    private <T> List<T> safeList(List<T> values) {
        return values != null ? values : Collections.emptyList();
    }

    public record SuggestedPillarImportResult(
        int pillarsCreated,
        int subPillarsCreated,
        int subPillarItemsCreated,
        int translationsCreated
    ) {}

    private record SuggestedPillarsPayload(@JsonAlias("lifePillars") List<PillarSeed> pillars) {}

    private record PillarSeed(
        String code,
        Map<String, String> name,
        Map<String, String> description,
        @JsonAlias("subLifePillars") List<SubPillarSeed> subPillars
    ) {}

    private record SubPillarSeed(
        String code,
        Map<String, String> name,
        Map<String, String> description,
        List<SubPillarItemSeed> items
    ) {}

    private record SubPillarItemSeed(String code, Map<String, String> name, Map<String, String> description) {}

    private record ResolvedTranslation(LangCode langCode, String name, String description) {}

    private static final class ImportCounts {

        private int pillarsCreated;
        private int subPillarsCreated;
        private int subPillarItemsCreated;
        private int translationsCreated;

        private SuggestedPillarImportResult toResult() {
            return new SuggestedPillarImportResult(
                pillarsCreated,
                subPillarsCreated,
                subPillarItemsCreated,
                translationsCreated
            );
        }
    }
}

