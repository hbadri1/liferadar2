package com.atharsense.lr.repository;

import com.atharsense.lr.domain.EvaluationDecision;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the EvaluationDecision entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EvaluationDecisionRepository
    extends JpaRepository<EvaluationDecision, Long>, JpaSpecificationExecutor<EvaluationDecision> {}
