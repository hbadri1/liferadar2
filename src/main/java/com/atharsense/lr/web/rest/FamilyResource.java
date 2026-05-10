package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.User;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.security.AuthoritiesConstants;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.FamilyObjectiveService;
import com.atharsense.lr.service.MailService;
import com.atharsense.lr.service.UserService;
import com.atharsense.lr.service.dto.CreateFamilyObjectiveRequest;
import com.atharsense.lr.service.dto.CreateObjectiveProgressRequest;
import com.atharsense.lr.service.dto.AdminUserDTO;
import com.atharsense.lr.service.dto.FamilyObjectiveDTO;
import com.atharsense.lr.service.dto.UpdateFamilyObjectiveRequest;
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
    private final FamilyObjectiveService familyObjectiveService;
    private final MailService mailService;

    public FamilyResource(UserRepository userRepository, UserService userService, FamilyObjectiveService familyObjectiveService, MailService mailService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.familyObjectiveService = familyObjectiveService;
        this.mailService = mailService;
    }

    /**
     * GET /api/family/children — list children.
      * Accessible by ROLE_PARENT, ADMIN (their own children) and CHILD (read-only view of siblings).
     */
    @GetMapping("/children")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.CHILD + "')")
    public ResponseEntity<List<AdminUserDTO>> getMyChildren() {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Not authenticated", "family", "notauthenticated"));

        // For ROLE_CHILD: find the parent (createdBy) then return siblings
        // For ROLE_PARENT / ROLE_ADMIN: return their own children
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
     * GET /api/family/parents — list parent accounts created by current parent.
     */
    @GetMapping("/parents")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<List<AdminUserDTO>> getMyParents() {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Not authenticated", "family", "notauthenticated"));

        List<AdminUserDTO> parents = userRepository.findAll().stream()
            .filter(u -> currentLogin.equals(u.getCreatedBy()))
            .filter(u -> u.getAuthorities().stream().anyMatch(a -> AuthoritiesConstants.PARENT.equals(a.getName())))
            .map(AdminUserDTO::new)
            .collect(Collectors.toList());

        LOG.debug("Found {} parent accounts for user {}", parents.size(), currentLogin);
        return ResponseEntity.ok(parents);
    }

    /**
     * GET /api/family/objectives — list objectives for the current family scope.
     */
    @GetMapping("/objectives")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.CHILD + "')")
    public ResponseEntity<List<FamilyObjectiveDTO>> getFamilyObjectives() {
        return ResponseEntity.ok(familyObjectiveService.findObjectivesForCurrentScope());
    }

    /**
     * POST /api/family/objectives — create one objective per selected child.
     */
    @PostMapping("/objectives")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<List<FamilyObjectiveDTO>> createFamilyObjectives(@Valid @RequestBody CreateFamilyObjectiveRequest request) {
        return ResponseEntity.ok(familyObjectiveService.createObjectives(request));
    }

    /**
     * PUT /api/family/objectives/{objectiveId} — update objective and its item definitions.
     */
    @PutMapping("/objectives/{objectiveId}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<FamilyObjectiveDTO> updateFamilyObjective(
        @PathVariable Long objectiveId,
        @Valid @RequestBody UpdateFamilyObjectiveRequest request
    ) {
        return ResponseEntity.ok(familyObjectiveService.updateObjective(objectiveId, request));
    }

    /**
     * PATCH /api/family/objectives/{objectiveId}/deactivate — deactivate an objective.
     */
    @PatchMapping("/objectives/{objectiveId}/deactivate")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<FamilyObjectiveDTO> deactivateFamilyObjective(@PathVariable Long objectiveId) {
        return ResponseEntity.ok(familyObjectiveService.deactivateObjective(objectiveId));
    }

    /**
     * DELETE /api/family/objectives/{objectiveId} — delete an objective.
     */
    @DeleteMapping("/objectives/{objectiveId}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<Void> deleteFamilyObjective(@PathVariable Long objectiveId) {
        familyObjectiveService.deleteObjective(objectiveId);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/family/objective-items/{itemDefinitionId}/progress — add a progress entry for an objective item.
     */
    @PostMapping("/objective-items/{itemDefinitionId}/progress")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.CHILD + "')")
    public ResponseEntity<FamilyObjectiveDTO> addObjectiveProgress(
        @PathVariable Long itemDefinitionId,
        @Valid @RequestBody CreateObjectiveProgressRequest request
    ) {
        return ResponseEntity.ok(familyObjectiveService.addProgress(itemDefinitionId, request));
    }

    /**
     * POST /api/family/children — create a child account. ROLE_PARENT and ADMIN only.
     */
    @PostMapping("/children")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "')")
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
     * POST /api/family/parents — create a parent account. ROLE_PARENT and ADMIN only.
     */
    @PostMapping("/parents")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<AdminUserDTO> createParent(@Valid @RequestBody CreateChildRequest request) {
        LOG.debug("REST request to create parent account: {}", request.login());

        if (request.email() == null || request.email().trim().isEmpty()) {
            throw new BadRequestAlertException("Email is required to send reset password link", "family", "emailrequired");
        }

        if (userRepository.findOneByLogin(request.login().toLowerCase()).isPresent()) {
            throw new BadRequestAlertException("Login already in use", "family", "loginalreadyused");
        }

        if (request.email() != null && userRepository.findOneByEmailIgnoreCase(request.email()).isPresent()) {
            throw new BadRequestAlertException("Email already in use", "family", "emailalreadyused");
        }

        AdminUserDTO userDTO = new AdminUserDTO();
        userDTO.setLogin(request.login());
        userDTO.setFirstName(request.firstName());
        userDTO.setLastName(request.lastName());
        userDTO.setEmail(request.email());
        userDTO.setLangKey("en");
        userDTO.setActivated(true);
        userDTO.setAuthorities(Set.of(AuthoritiesConstants.PARENT));

        User created = userService.createUser(userDTO);
        // createUser already sets resetKey/resetDate; send reset-link mail to set password.
        mailService.sendPasswordResetMail(created);

        return ResponseEntity.ok(new AdminUserDTO(created));
    }

    /**
     * DELETE /api/family/children/{login} — remove a child account. ROLE_PARENT and ADMIN only.
     */
    @DeleteMapping("/children/{login}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "')")
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
     * DELETE /api/family/parents/{login} — remove a parent account created by current user.
     */
    @DeleteMapping("/parents/{login}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.PARENT + "', '" + AuthoritiesConstants.ADMIN + "')")
    public ResponseEntity<Void> deleteParent(@PathVariable String login) {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Not authenticated", "family", "notauthenticated"));

        User parent = userRepository.findOneByLogin(login.toLowerCase())
            .orElseThrow(() -> new BadRequestAlertException("Parent not found", "family", "notfound"));

        if (!currentLogin.equals(parent.getCreatedBy())) {
            throw new BadRequestAlertException("Not your parent account", "family", "forbidden");
        }

        boolean isParent = parent.getAuthorities().stream().anyMatch(a -> AuthoritiesConstants.PARENT.equals(a.getName()));
        if (!isParent) {
            throw new BadRequestAlertException("User is not a parent account", "family", "notparent");
        }

        userService.deleteUser(login);
        LOG.debug("Deleted parent account: {}", login);
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

