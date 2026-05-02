package com.atharsense.lr.service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for registering premium early-access interest.
 */
public record PremiumInterestRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    @Size(max = 254, message = "Email must not exceed 254 characters")
    String email,

    @Size(max = 2000, message = "Feedback must not exceed 2000 characters")
    String feedback,

    @Size(max = 100, message = "Source must not exceed 100 characters")
    String source
) {}

