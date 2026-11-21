package com.sonpurclinic.dto;

public record PatientAuthResponse(String token, PatientAccountResponse patient) {}
