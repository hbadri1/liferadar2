package com.atharsense.lr.repository;

import com.atharsense.lr.domain.SubPillarItemTranslation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SubPillarItemTranslation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SubPillarItemTranslationRepository extends JpaRepository<SubPillarItemTranslation, Long> {}
