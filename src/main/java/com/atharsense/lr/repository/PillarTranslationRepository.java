package com.atharsense.lr.repository;

import com.atharsense.lr.domain.PillarTranslation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the PillarTranslation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PillarTranslationRepository extends JpaRepository<PillarTranslation, Long> {}
