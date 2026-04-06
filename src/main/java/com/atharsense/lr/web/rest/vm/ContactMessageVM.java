package com.atharsense.lr.web.rest.vm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * View Model for the contact / feedback form.
 */
public class ContactMessageVM {

    @NotBlank
    @Size(min = 1, max = 100)
    private String name;

    @Size(max = 100)
    private String email;

    @NotBlank
    @Size(min = 1, max = 2000)
    private String message;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

