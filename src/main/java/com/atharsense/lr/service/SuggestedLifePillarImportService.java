package com.atharsense.lr.service;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.LifePillar;
import com.atharsense.lr.domain.LifePillarTranslation;
import com.atharsense.lr.domain.SubLifePillar;
import com.atharsense.lr.domain.SubLifePillarItem;
import com.atharsense.lr.domain.SubLifePillarItemTranslation;
import com.atharsense.lr.domain.SubLifePillarTranslation;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.domain.enumeration.LangCode;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.LifePillarRepository;
import com.atharsense.lr.repository.SubLifePillarItemRepository;
import com.atharsense.lr.repository.SubLifePillarRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
public class SuggestedLifePillarImportService {

    private static final Logger LOG = LoggerFactory.getLogger(SuggestedLifePillarImportService.class);

    private static final String ENTITY_NAME = "lifePillar";
    private static final Path SUGGESTED_PILLARS_FILE = Paths.get("external", "basic-pillarsv1.0.json");
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
    private final LifePillarRepository lifePillarRepository;
    private final SubLifePillarRepository subLifePillarRepository;
    private final SubLifePillarItemRepository subLifePillarItemRepository;

    public SuggestedLifePillarImportService(
        ObjectMapper objectMapper,
        UserRepository userRepository,
        ExtendedUserRepository extendedUserRepository,
        LifePillarRepository lifePillarRepository,
        SubLifePillarRepository subLifePillarRepository,
        SubLifePillarItemRepository subLifePillarItemRepository
    ) {
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
        this.extendedUserRepository = extendedUserRepository;
        this.lifePillarRepository = lifePillarRepository;
        this.subLifePillarRepository = subLifePillarRepository;
        this.subLifePillarItemRepository = subLifePillarItemRepository;
    }

    public SuggestedLifePillarImportResult importSuggestedLifePillars() {
        ExtendedUser owner = getOrCreateCurrentExtendedUser();
        SuggestedLifePillarsPayload payload = readPayload();
        ImportCounts counts = new ImportCounts();

        for (PillarSeed pillarSeed : safeList(payload.lifePillars())) {
            LifePillar lifePillar = upsertLifePillar(owner, pillarSeed, counts);

            for (SubLifePillarSeed subLifePillarSeed : safeList(pillarSeed.subLifePillars())) {
                SubLifePillar subLifePillar = upsertSubLifePillar(owner, lifePillar, subLifePillarSeed, counts);

                for (SubLifePillarItemSeed itemSeed : safeList(subLifePillarSeed.items())) {
                    upsertSubLifePillarItem(owner, subLifePillar, itemSeed, counts);
                }
            }
        }

        SuggestedLifePillarImportResult result = counts.toResult();
        LOG.info(
            "Imported suggested life pillars for owner {}: pillars={}, subPillars={}, items={}, translations={}",
            owner.getId(),
            result.lifePillarsCreated(),
            result.subLifePillarsCreated(),
            result.subLifePillarItemsCreated(),
            result.translationsCreated()
        );
        return result;
    }

    private LifePillar upsertLifePillar(ExtendedUser owner, PillarSeed seed, ImportCounts counts) {
        LifePillar lifePillar = lifePillarRepository.findByOwnerIdAndCode(owner.getId(), seed.code()).orElseGet(LifePillar::new);
        boolean isNew = lifePillar.getId() == null;

        lifePillar.setCode(seed.code());
        lifePillar.setIsActive(Boolean.TRUE);
        lifePillar.setOwner(owner);
        mergeLifePillarTranslations(lifePillar, seed.name(), seed.description(), counts);

        LifePillar saved = lifePillarRepository.save(lifePillar);
        if (isNew) {
            counts.lifePillarsCreated++;
        }
        return saved;
    }

    private SubLifePillar upsertSubLifePillar(ExtendedUser owner, LifePillar lifePillar, SubLifePillarSeed seed, ImportCounts counts) {
        SubLifePillar subLifePillar = subLifePillarRepository.findByOwnerIdAndCode(owner.getId(), seed.code()).orElseGet(SubLifePillar::new);
        boolean isNew = subLifePillar.getId() == null;

        subLifePillar.setCode(seed.code());
        subLifePillar.setIsActive(Boolean.TRUE);
        subLifePillar.setOwner(owner);
        subLifePillar.setLifePillar(lifePillar);
        mergeSubLifePillarTranslations(subLifePillar, seed.name(), seed.description(), counts);

        SubLifePillar saved = subLifePillarRepository.save(subLifePillar);
        if (isNew) {
            counts.subLifePillarsCreated++;
        }
        return saved;
    }

    private void upsertSubLifePillarItem(
        ExtendedUser owner,
        SubLifePillar subLifePillar,
        SubLifePillarItemSeed seed,
        ImportCounts counts
    ) {
        SubLifePillarItem item = subLifePillarItemRepository.findByOwnerIdAndCode(owner.getId(), seed.code()).orElseGet(SubLifePillarItem::new);
        boolean isNew = item.getId() == null;

        item.setCode(seed.code());
        item.setSortOrder(1);
        item.setIsActive(Boolean.TRUE);
        item.setOwner(owner);
        item.setSubLifePillar(subLifePillar);
        mergeSubLifePillarItemTranslations(item, seed.name(), seed.description(), counts);

        subLifePillarItemRepository.save(item);
        if (isNew) {
            counts.subLifePillarItemsCreated++;
        }
    }

    private void mergeLifePillarTranslations(
        LifePillar lifePillar,
        Map<String, String> names,
        Map<String, String> descriptions,
        ImportCounts counts
    ) {
        Map<LangCode, LifePillarTranslation> existingByLang = Optional.ofNullable(lifePillar.getTranslations())
            .orElseGet(Collections::emptySet)
            .stream()
            .filter(translation -> translation.getLang() != null)
            .collect(Collectors.toMap(LifePillarTranslation::getLang, translation -> translation, (left, right) -> left));

        applyTranslations(names, descriptions, langCode -> {
            LifePillarTranslation translation = existingByLang.get(langCode.langCode());
            if (translation == null) {
                translation = new LifePillarTranslation();
                translation.setLang(langCode.langCode());
                lifePillar.addTranslations(translation);
                counts.translationsCreated++;
            }
            translation.setName(langCode.name());
            translation.setDescription(langCode.description());
        });
    }

    private void mergeSubLifePillarTranslations(
        SubLifePillar subLifePillar,
        Map<String, String> names,
        Map<String, String> descriptions,
        ImportCounts counts
    ) {
        Map<LangCode, SubLifePillarTranslation> existingByLang = Optional.ofNullable(subLifePillar.getTranslations())
            .orElseGet(Collections::emptySet)
            .stream()
            .filter(translation -> translation.getLang() != null)
            .collect(Collectors.toMap(SubLifePillarTranslation::getLang, translation -> translation, (left, right) -> left));

        applyTranslations(names, descriptions, langCode -> {
            SubLifePillarTranslation translation = existingByLang.get(langCode.langCode());
            if (translation == null) {
                translation = new SubLifePillarTranslation();
                translation.setLang(langCode.langCode());
                subLifePillar.addTranslations(translation);
                counts.translationsCreated++;
            }
            translation.setName(langCode.name());
            translation.setDescription(langCode.description());
        });
    }

    private void mergeSubLifePillarItemTranslations(
        SubLifePillarItem item,
        Map<String, String> names,
        Map<String, String> descriptions,
        ImportCounts counts
    ) {
        Map<LangCode, SubLifePillarItemTranslation> existingByLang = Optional.ofNullable(item.getTranslations())
            .orElseGet(Collections::emptySet)
            .stream()
            .filter(translation -> translation.getLang() != null)
            .collect(Collectors.toMap(SubLifePillarItemTranslation::getLang, translation -> translation, (left, right) -> left));

        applyTranslations(names, descriptions, langCode -> {
            SubLifePillarItemTranslation translation = existingByLang.get(langCode.langCode());
            if (translation == null) {
                translation = new SubLifePillarItemTranslation();
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

    private SuggestedLifePillarsPayload readPayload() {
        try (InputStream inputStream = openPayloadStream()) {
            return objectMapper.readValue(inputStream, SuggestedLifePillarsPayload.class);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to read suggested life pillars JSON", exception);
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

        throw new IOException("Suggested life pillars file not found at " + SUGGESTED_PILLARS_FILE.toAbsolutePath());
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

    private <T> List<T> safeList(List<T> values) {
        return values != null ? values : Collections.emptyList();
    }

    public record SuggestedLifePillarImportResult(
        int lifePillarsCreated,
        int subLifePillarsCreated,
        int subLifePillarItemsCreated,
        int translationsCreated
    ) {}

    private record SuggestedLifePillarsPayload(List<PillarSeed> lifePillars) {}

    private record PillarSeed(String code, Map<String, String> name, Map<String, String> description, List<SubLifePillarSeed> subLifePillars) {}

    private record SubLifePillarSeed(
        String code,
        Map<String, String> name,
        Map<String, String> description,
        List<SubLifePillarItemSeed> items
    ) {}

    private record SubLifePillarItemSeed(String code, Map<String, String> name, Map<String, String> description) {}

    private record ResolvedTranslation(LangCode langCode, String name, String description) {}

    private static final class ImportCounts {

        private int lifePillarsCreated;
        private int subLifePillarsCreated;
        private int subLifePillarItemsCreated;
        private int translationsCreated;

        private SuggestedLifePillarImportResult toResult() {
            return new SuggestedLifePillarImportResult(
                lifePillarsCreated,
                subLifePillarsCreated,
                subLifePillarItemsCreated,
                translationsCreated
            );
        }
    }
}

