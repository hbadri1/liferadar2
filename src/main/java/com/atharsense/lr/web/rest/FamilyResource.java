package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.User;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.security.AuthoritiesConstants;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.UserService;
import com.atharsense.lr.service.dto.AdminUserDTO;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for family management (parent creates child accounts).
 */
@RestController
@RequestMapping("/api/family")
public class FamilyResource {

    private static final Logger LOG = LoggerFactory.getLogger(FamilyResource.class);

    private final UserRepository userRepository;
    private final UserService userService;

    public FamilyResource(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    /**
     * GET /api/family/children — list children.
     * Accessible by FAMILY_ADMIN, ADMIN (their own children) and CHILD (read-only view of siblings).
     */
    @GetMapping("/children")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.FAMILY_ADMIN + "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.CHILD + "')")
    public ResponseEntity<List<AdminUserDTO>> getMyChildren() {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Not authenticated", "family", "notauthenticated"));

        // For ROLE_CHILD: find the parent (createdBy) then return siblings
        // For ROLE_FAMILY_ADMIN / ROLE_ADMIN: return their own children
        List<AdminUserDTO> children = userRepository.findAll().stream()
            .filter(u -> {
                // include users where current login is the parent
                if (currentLogin.equals(u.getCreatedBy())) return true;
                // if current user is a CHILD, also show siblings (users created by same parent)
                return userRepository.findOneByLogin(currentLogin)
                    .map(me -> me.getCreatedBy() != null && me.getCreatedBy().equals(u.getCreatedBy())
                        && !u.getLogin().equals(currentLogin))
                    .orElse(false);
            })
            .filter(u -> u.getAuthorities().stream()
                .anyMatch(a -> AuthoritiesConstants.CHILD.equals(a.getName())))
            .map(AdminUserDTO::new)
            .collect(Collectors.toList());

        LOG.debug("Found {} children for user {}", children.size(), currentLogin);
        return ResponseEntity.ok(children);
    }

    /**
     * POST /api/family/children — create a child account. FAMILY_ADMIN and ADMIN only.
     */
    @PostMapping("/children")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.FAMILY_ADMIN + "', '" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<AdminUserDTO> createChild(@Valid @RequestBody CreateChildRequest request) {
        LOG.debug("REST request to create child account: {}", request.login());

        // Validate login uniqueness
        if (userRepository.findOneByLogin(request.login().toLowerCase()).isPresent()) {
            throw new BadRequestAlertException("Login already in use", "family", "loginalreadyused");
        }

        // Validate email uniqueness
        if (request.email() != null && userRepository.findOneByEmailIgnoreCase(request.email()).isPresent()) {
            throw new BadRequestAlertException("Email already in use", "family", "emailalreadyused");
        }

        // Build DTO with ROLE_CHILD authority
        AdminUserDTO userDTO = new AdminUserDTO();
        userDTO.setLogin(request.login());
        userDTO.setFirstName(request.firstName());
        userDTO.setLastName(request.lastName());
        userDTO.setEmail(request.email());
        userDTO.setLangKey("en");
        userDTO.setActivated(true);
        userDTO.setAuthorities(Set.of(AuthoritiesConstants.CHILD));

        User created = userService.createUser(userDTO);
        // Set password after creation
        userRepository.findOneByLogin(created.getLogin()).ifPresent(u -> {
            // update password — encode and save
            u.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(request.password()));
            userRepository.save(u);
        });

        return ResponseEntity.ok(new AdminUserDTO(created));
    }

    /**
     * DELETE /api/family/children/{login} — remove a child account. FAMILY_ADMIN and ADMIN only.
     */
    @DeleteMapping("/children/{login}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.FAMILY_ADMIN + "', '" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<Void> deleteChild(@PathVariable String login) {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Not authenticated", "family", "notauthenticated"));

        User child = userRepository.findOneByLogin(login.toLowerCase())
            .orElseThrow(() -> new BadRequestAlertException("Child not found", "family", "notfound"));

        // Only allow deletion if this parent created the child
        if (!currentLogin.equals(child.getCreatedBy())) {
            throw new BadRequestAlertException("Not your child account", "family", "forbidden");
        }

        boolean isChild = child.getAuthorities().stream()
            .anyMatch(a -> AuthoritiesConstants.CHILD.equals(a.getName()));
        if (!isChild) {
            throw new BadRequestAlertException("User is not a child account", "family", "notchild");
        }

        userService.deleteUser(login);
        LOG.debug("Deleted child account: {}", login);
        return ResponseEntity.noContent().build();
    }

    /**
     * Simple record for child creation request body.
     */
    public record CreateChildRequest(
        String login,
        String firstName,
        String lastName,
        String email,
        String password
    ) {}
}

