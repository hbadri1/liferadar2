package com.atharsense.lr.repository;

import com.atharsense.lr.domain.KidObjectiveItemDefinition;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface KidObjectiveItemDefinitionRepository extends JpaRepository<KidObjectiveItemDefinition, Long> {
    @Query(
        "select distinct itemDefinition from KidObjectiveItemDefinition itemDefinition " +
        "left join fetch itemDefinition.objective objective " +
        "left join fetch objective.kid kid " +
        "left join fetch kid.user kidUser " +
        "left join fetch itemDefinition.progressEntries progressEntry " +
        "where itemDefinition.id = :id"
    )
    Optional<KidObjectiveItemDefinition> findByIdWithDetails(@Param("id") Long id);
}

