package com.sonpurclinic.dto;

import com.sonpurclinic.entity.PatientAccount;
import java.time.LocalDateTime;

public record PatientAccountResponse(Long id, String fullName, String phone, String email, LocalDateTime createdAt) {
    public static PatientAccountResponse from(PatientAccount account) {
        return new PatientAccountResponse(account.getId(), account.getFullName(), account.getPhone(), account.getEmail(), account.getCreatedAt());
    }
}
