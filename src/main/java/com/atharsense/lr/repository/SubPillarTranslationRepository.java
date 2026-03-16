package com.atharsense.lr.repository;

import com.atharsense.lr.domain.SubPillarTranslation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SubPillarTranslation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SubPillarTranslationRepository extends JpaRepository<SubPillarTranslation, Long> {}
