package com.sonpurclinic.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
    @NotBlank @Size(max=100) String patientName,
    @NotBlank @Pattern(regexp="^[6-9][0-9]{9}$", message="Enter a valid 10-digit Indian mobile number") String phone,
    @Min(1) @Max(120) Integer age,
    @Size(max=1000) String problem,
    Long slotId,
    LocalDate date,
    LocalTime time
) {}
