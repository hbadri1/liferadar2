package com.atharsense.lr.repository;

import com.atharsense.lr.domain.LifePillarTranslation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the LifePillarTranslation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LifePillarTranslationRepository extends JpaRepository<LifePillarTranslation, Long> {}
