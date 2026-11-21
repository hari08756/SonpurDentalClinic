package com.sonpurclinic.service;

import com.sonpurclinic.dto.AdminAccountResponse;
import com.sonpurclinic.dto.AdminProfileUpdateRequest;
import com.sonpurclinic.entity.AdminAccount;
import com.sonpurclinic.repository.AdminAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;

@Service
public class AdminAccountService {
    private final AdminAccountRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminAccountService(AdminAccountRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public AdminAccountResponse authenticate(String username, String password) {
        AdminAccount account = repository.findByUsername(username.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect username or password"));
        if (password.getBytes(StandardCharsets.UTF_8).length > 72 || !passwordEncoder.matches(password, account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect username or password");
        }
        return AdminAccountResponse.from(account);
    }

    @Transactional(readOnly = true)
    public AdminAccountResponse getProfile(String username) {
        return AdminAccountResponse.from(find(username));
    }

    @Transactional
    public AdminAccountResponse updateProfile(String currentUsername, AdminProfileUpdateRequest request) {
        AdminAccount account = find(currentUsername);
        if (request.currentPassword().getBytes(StandardCharsets.UTF_8).length > 72 || !passwordEncoder.matches(request.currentPassword(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        String newUsername = request.username().trim();
        if (!account.getUsername().equals(newUsername) && repository.existsByUsernameAndIdNot(newUsername, account.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That admin username is already in use");
        }
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            validateNewPassword(request.newPassword());
            account.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }
        account.setUsername(newUsername);
        account.setFullName(request.fullName().trim());
        account.setEmail(normalize(request.email()));
        account.setPhone(normalize(request.phone()));
        return AdminAccountResponse.from(repository.save(account));
    }

    @Transactional
    public void createInitialAdmin(String username, String password) {
        if (repository.count() > 0) return;
        AdminAccount account = new AdminAccount();
        account.setUsername(username.trim());
        account.setFullName("Clinic Administrator");
        account.setPasswordHash(passwordEncoder.encode(password));
        repository.save(account);
    }

    private AdminAccount find(String username) {
        return repository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin account not found. Please sign in again."));
    }

    private void validateNewPassword(String password) {
        if (password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must contain 8 to 72 characters");
        }
    }

    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
