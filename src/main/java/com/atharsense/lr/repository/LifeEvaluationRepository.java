package com.atharsense.lr.repository;

import com.atharsense.lr.domain.LifeEvaluation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the LifeEvaluation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LifeEvaluationRepository extends JpaRepository<LifeEvaluation, Long>, JpaSpecificationExecutor<LifeEvaluation> {}
