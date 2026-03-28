package com.atharsense.lr.repository;

import com.atharsense.lr.domain.KidObjective;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the KidObjective entity.
 */
@Repository
public interface KidObjectiveRepository extends JpaRepository<KidObjective, Long> {
    @Query(
        "select distinct objective from KidObjective objective " +
        "left join fetch objective.kid kid " +
        "left join fetch kid.user kidUser " +
        "left join fetch objective.itemDefinitions itemDefinition " +
        "left join fetch itemDefinition.progressEntries progressEntry " +
        "where objective.kid.id in :kidIds"
    )
    List<KidObjective> findAllByKidIdInWithDetails(@Param("kidIds") Collection<Long> kidIds);

    @Query(
        "select distinct objective from KidObjective objective " +
        "left join fetch objective.kid kid " +
        "left join fetch kid.user kidUser " +
        "left join fetch objective.itemDefinitions itemDefinition " +
        "left join fetch itemDefinition.progressEntries progressEntry " +
        "where objective.id = :id"
    )
    Optional<KidObjective> findByIdWithDetails(@Param("id") Long id);
}

