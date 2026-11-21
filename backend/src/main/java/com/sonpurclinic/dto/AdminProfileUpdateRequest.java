package com.sonpurclinic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminProfileUpdateRequest(
    @NotBlank @Size(min = 3, max = 60) @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "Username may contain letters, numbers, dot, underscore and hyphen") String username,
    @NotBlank @Size(max = 100) String fullName,
    @Email @Size(max = 150) String email,
    @Pattern(regexp = "^$|^[6-9][0-9]{9}$", message = "Enter a valid 10-digit Indian mobile number") String phone,
    @NotBlank @Size(max = 72) String currentPassword,
    @Size(max = 72) String newPassword
) {}
