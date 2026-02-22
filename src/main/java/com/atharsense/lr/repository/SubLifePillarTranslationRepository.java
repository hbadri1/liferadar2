package com.atharsense.lr.repository;

import com.atharsense.lr.domain.SubLifePillarTranslation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SubLifePillarTranslation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SubLifePillarTranslationRepository extends JpaRepository<SubLifePillarTranslation, Long> {}
