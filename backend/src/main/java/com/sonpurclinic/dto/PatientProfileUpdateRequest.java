package com.sonpurclinic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PatientProfileUpdateRequest(
    @NotBlank @Size(max = 100) String fullName,
    @NotBlank @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Enter a valid 10-digit Indian mobile number") String phone,
    @Email @Size(max = 150) String email,
    @NotBlank @Size(max = 72) String currentPassword,
    @Size(max = 72) String newPassword
) {}
