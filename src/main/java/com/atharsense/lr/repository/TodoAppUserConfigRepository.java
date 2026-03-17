package com.atharsense.lr.repository;

import com.atharsense.lr.domain.TodoAppUserConfig;
import com.atharsense.lr.integrations.todoapps.TodoAppProvider;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TodoAppUserConfigRepository extends JpaRepository<TodoAppUserConfig, Long> {
    List<TodoAppUserConfig> findAllByUserId(Long userId);

    Optional<TodoAppUserConfig> findOneByUserIdAndProvider(Long userId, TodoAppProvider provider);
}

