package com.sonpurclinic.dto;

import com.sonpurclinic.entity.AdminAccount;
import java.time.LocalDateTime;

public record AdminAccountResponse(Long id, String username, String fullName, String email, String phone, LocalDateTime createdAt, LocalDateTime updatedAt) {
    public static AdminAccountResponse from(AdminAccount account) {
        return new AdminAccountResponse(account.getId(), account.getUsername(), account.getFullName(), account.getEmail(), account.getPhone(), account.getCreatedAt(), account.getUpdatedAt());
    }
}
