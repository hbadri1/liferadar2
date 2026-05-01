package com.atharsense.lr.repository;

import com.atharsense.lr.domain.TodoAppUserConfig;
import com.atharsense.lr.integrations.todoapps.TodoAppProvider;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TodoAppUserConfigRepository extends JpaRepository<TodoAppUserConfig, Long> {
    List<TodoAppUserConfig> findAllByUserId(Long userId);

    Optional<TodoAppUserConfig> findOneByUserIdAndProvider(Long userId, TodoAppProvider provider);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update TodoAppUserConfig c set c.enabled = false where c.user.id = :userId and c.provider <> :provider and c.enabled = true")
    int disableOtherEnabledConfigs(@Param("userId") Long userId, @Param("provider") TodoAppProvider provider);
}

