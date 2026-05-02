package com.atharsense.lr.repository;

import com.atharsense.lr.domain.PremiumInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link PremiumInterest} entity.
 */
@Repository
public interface PremiumInterestRepository extends JpaRepository<PremiumInterest, Long> {}

