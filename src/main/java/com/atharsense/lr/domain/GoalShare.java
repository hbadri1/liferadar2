package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;

/**
 * Represents a shared access link between a Goal and a family ExtendedUser.
 * Created automatically when a Goal's visibility is set to FAMILY_SHARED.
 */
@Entity
@Table(
    name = "goal_share",
    uniqueConstraints = @UniqueConstraint(columnNames = { "goal_id", "shared_with_id" })
)
public class GoalShare implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    @JsonIgnoreProperties(value = { "milestones", "updates", "owner", "pillar" }, allowSetters = true)
    private Goal goal;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_id", nullable = false)
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser sharedWith;

    /** If true the shared member can edit this goal (progress, milestones, reviews). */
    @Column(name = "can_edit", nullable = false)
    private Boolean canEdit = true;

    // ── Getters / Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }

    public ExtendedUser getSharedWith() { return sharedWith; }
    public void setSharedWith(ExtendedUser sharedWith) { this.sharedWith = sharedWith; }

    public Boolean getCanEdit() { return canEdit; }
    public void setCanEdit(Boolean canEdit) { this.canEdit = canEdit; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GoalShare)) return false;
        return id != null && id.equals(((GoalShare) o).id);
    }

    @Override
    public int hashCode() { return getClass().hashCode(); }

    @Override
    public String toString() {
        return "GoalShare{id=" + id + ", canEdit=" + canEdit + "}";
    }
}

