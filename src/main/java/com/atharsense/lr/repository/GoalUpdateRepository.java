package com.atharsense.lr.repository;

import com.atharsense.lr.domain.GoalUpdate;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalUpdateRepository extends JpaRepository<GoalUpdate, Long> {

    List<GoalUpdate> findByGoalIdOrderByUpdateDateDesc(Long goalId);
}

