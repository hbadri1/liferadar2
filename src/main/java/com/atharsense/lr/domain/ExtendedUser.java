package com.atharsense.lr.domain;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * Tenant record lives in master/public schema
 * Holds the schema name created for that user.
 *
 * /** Extended profile for each JHipster User (master/public schema)
 */
@Schema(
    description = "Tenant record lives in master/public schema\nHolds the schema name created for that user.\n\n/** Extended profile for each JHipster User (master/public schema)"
)
@Entity
@Table(name = "extended_user")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ExtendedUser implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 120)
    @Column(name = "full_name", length = 120, nullable = false)
    private String fullName;

    @Size(max = 30)
    @Column(name = "mobile", length = 30)
    private String mobile;

    @Size(max = 255)
    @Column(name = "avatar", length = 255)
    private String avatar;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @NotNull
    @JoinColumn(unique = true)
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ExtendedUser id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return this.fullName;
    }

    public ExtendedUser fullName(String fullName) {
        this.setFullName(fullName);
        return this;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMobile() {
        return this.mobile;
    }

    public ExtendedUser mobile(String mobile) {
        this.setMobile(mobile);
        return this;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getAvatar() {
        return this.avatar;
    }

    public ExtendedUser avatar(String avatar) {
        this.setAvatar(avatar);
        return this;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Boolean getActive() {
        return this.active;
    }

    public ExtendedUser active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ExtendedUser user(User user) {
        this.setUser(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ExtendedUser)) {
            return false;
        }
        return getId() != null && getId().equals(((ExtendedUser) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ExtendedUser{" +
            "id=" + getId() +
            ", fullName='" + getFullName() + "'" +
            ", mobile='" + getMobile() + "'" +
            ", avatar='" + getAvatar() + "'" +
            ", active='" + getActive() + "'" +
            "}";
    }
}
