package com.atharsense.lr.repository;

import com.atharsense.lr.domain.KidObjectiveProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KidObjectiveProgressRepository extends JpaRepository<KidObjectiveProgress, Long> {}

