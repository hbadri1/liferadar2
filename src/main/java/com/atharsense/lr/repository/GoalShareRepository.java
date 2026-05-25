package com.atharsense.lr.repository;

import com.atharsense.lr.domain.GoalShare;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalShareRepository extends JpaRepository<GoalShare, Long> {

    /** All shares for a specific goal. */
    List<GoalShare> findByGoalId(Long goalId);

    /** All goals shared with a user (by login). */
    List<GoalShare> findBySharedWithUserLogin(String login);

    /** Find a specific share record for a goal + user login. */
    Optional<GoalShare> findByGoalIdAndSharedWithUserLogin(Long goalId, String login);

    /** Remove all shares for a goal (e.g. when visibility changes away from FAMILY_SHARED). */
    void deleteByGoalId(Long goalId);
}

