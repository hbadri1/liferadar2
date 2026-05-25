package com.atharsense.lr.repository;

import com.atharsense.lr.domain.Goal;
import com.atharsense.lr.domain.enumeration.GoalStatus;
import com.atharsense.lr.domain.enumeration.GoalVisibility;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByOwnerUserLoginAndIsArchivedFalseOrderByCreatedDateDesc(String login);

    List<Goal> findByOwnerUserLoginOrderByCreatedDateDesc(String login);

    List<Goal> findByOwnerUserLoginAndStatusOrderByCreatedDateDesc(String login, GoalStatus status);

    List<Goal> findByOwnerUserFamilyIdAndVisibilityAndIsArchivedFalseOrderByCreatedDateDesc(
        Long familyId,
        GoalVisibility visibility
    );

    long countByOwnerUserLoginAndStatusAndIsArchivedFalse(String login, GoalStatus status);
}

