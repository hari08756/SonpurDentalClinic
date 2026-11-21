package com.sonpurclinic.service;

import com.sonpurclinic.config.JwtService;
import com.sonpurclinic.dto.*;
import com.sonpurclinic.entity.Appointment;
import com.sonpurclinic.entity.PatientAccount;
import com.sonpurclinic.repository.AppointmentRepository;
import com.sonpurclinic.repository.PatientAccountRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.nio.charset.StandardCharsets;

@Service
public class PatientAccountService {
    private final PatientAccountRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public PatientAccountService(PatientAccountRepository patientRepository,
                                  AppointmentRepository appointmentRepository,
                                  JwtService jwtService) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public PatientAuthResponse register(PatientRegisterRequest request) {
        String phone = request.phone().trim();
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be no longer than 72 UTF-8 bytes");
        }
        if (patientRepository.existsByPhone(phone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already exists with this mobile number. Please log in.");
        }
        PatientAccount account = new PatientAccount();
        account.setFullName(request.fullName().trim());
        account.setPhone(phone);
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        final PatientAccount savedAccount;
        try {
            savedAccount = patientRepository.saveAndFlush(account);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already exists with this mobile number. Please log in.");
        }

        // Attach earlier guest bookings made with this mobile number to the new account.
        List<Appointment> legacyBookings = appointmentRepository.findByPhoneAndPatientAccountIsNull(phone);
        legacyBookings.forEach(booking -> booking.setPatientAccount(savedAccount));
        if (!legacyBookings.isEmpty()) appointmentRepository.saveAll(legacyBookings);

        return new PatientAuthResponse(jwtService.createPatientToken(phone), PatientAccountResponse.from(savedAccount));
    }

    @Transactional(readOnly = true)
    public PatientAuthResponse login(PatientLoginRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect mobile number or password");
        }
        PatientAccount account = patientRepository.findByPhone(request.phone().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect mobile number or password"));
        if (!passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect mobile number or password");
        }
        return new PatientAuthResponse(jwtService.createPatientToken(account.getPhone()), PatientAccountResponse.from(account));
    }

    @Transactional(readOnly = true)
    public PatientAccount getByPhone(String phone) {
        return patientRepository.findByPhone(phone)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Patient account not found. Please log in again."));
    }

    @Transactional(readOnly = true)
    public PatientAccountResponse getProfile(String phone) {
        return PatientAccountResponse.from(getByPhone(phone));
    }


    @Transactional
    public PatientAuthResponse updateProfile(String currentPhone, PatientProfileUpdateRequest request) {
        PatientAccount account = getByPhone(currentPhone);
        if (request.currentPassword().getBytes(StandardCharsets.UTF_8).length > 72 || !passwordEncoder.matches(request.currentPassword(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.newPassword().length() < 8 || request.newPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must contain 8 to 72 characters");
            }
        }

        String oldPhone = account.getPhone();
        String newPhone = request.phone().trim();
        if (!oldPhone.equals(newPhone) && patientRepository.existsByPhoneAndIdNot(newPhone, account.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Another patient account already uses this mobile number");
        }

        account.setFullName(request.fullName().trim());
        account.setPhone(newPhone);
        account.setEmail(normalizeOptional(request.email()));
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            account.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }
        patientRepository.save(account);
        syncAppointments(account, oldPhone);
        return new PatientAuthResponse(jwtService.createPatientToken(newPhone), PatientAccountResponse.from(account));
    }

    private void syncAppointments(PatientAccount account, String oldPhone) {
        List<Appointment> linked = appointmentRepository.findByPatientAccount_IdOrderByCreatedAtDesc(account.getId());
        linked.forEach(booking -> {
            booking.setPhone(account.getPhone());
            booking.setPatientName(account.getFullName());
        });
        List<Appointment> legacy = appointmentRepository.findByPhoneAndPatientAccountIsNull(oldPhone);
        legacy.forEach(booking -> {
            booking.setPatientAccount(account);
            booking.setPhone(account.getPhone());
            booking.setPatientName(account.getFullName());
        });
        if (!linked.isEmpty()) appointmentRepository.saveAll(linked);
        if (!legacy.isEmpty()) appointmentRepository.saveAll(legacy);
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    @Transactional(readOnly = true)
    public long count() { return patientRepository.count(); }

    @Transactional(readOnly = true)
    public List<PatientAccountResponse> getAll() {
        return patientRepository.findAll().stream().map(PatientAccountResponse::from).toList();
    }
}
