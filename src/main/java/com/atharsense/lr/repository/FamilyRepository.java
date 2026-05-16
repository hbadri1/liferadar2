package com.atharsense.lr.repository;

import com.atharsense.lr.domain.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Family entity.
 */
@Repository
public interface FamilyRepository extends JpaRepository<Family, Long> {}

