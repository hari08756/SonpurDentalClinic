package com.sonpurclinic.dto;
import jakarta.validation.constraints.*;
public record SettingsUpdateRequest(
    @NotBlank @Size(max=120) String clinicName,
    @NotNull @Min(50) @Max(100) Integer bookingFee,
    @Size(max=500) String address,
    @Size(max=30) String phone,
    @Email @Size(max=160) String email,
    @Size(max=160) String workingHours,
    @Size(max=1000) String description
) {}
