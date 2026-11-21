package com.sonpurclinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PatientRegisterRequest(
    @NotBlank @Size(max = 100) String fullName,
    @NotBlank @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Enter a valid 10-digit Indian mobile number") String phone,
    @NotBlank @Size(min = 8, max = 72, message = "Password must contain 8 to 72 characters") String password
) {}
