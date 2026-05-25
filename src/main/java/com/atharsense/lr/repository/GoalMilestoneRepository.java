package com.atharsense.lr.repository;

import com.atharsense.lr.domain.GoalMilestone;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalMilestoneRepository extends JpaRepository<GoalMilestone, Long> {

    List<GoalMilestone> findByGoalIdOrderBySortOrderAscIdAsc(Long goalId);

    long countByGoalId(Long goalId);

    long countByGoalIdAndStatusIn(Long goalId, List<com.atharsense.lr.domain.enumeration.GoalMilestoneStatus> statuses);
}

