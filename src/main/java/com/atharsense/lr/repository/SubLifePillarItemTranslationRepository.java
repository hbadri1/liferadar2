package com.atharsense.lr.repository;

import com.atharsense.lr.domain.SubLifePillarItemTranslation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SubLifePillarItemTranslation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SubLifePillarItemTranslationRepository extends JpaRepository<SubLifePillarItemTranslation, Long> {}
