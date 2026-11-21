package com.sonpurclinic.service;

import com.sonpurclinic.dto.SettingsResponse;
import com.sonpurclinic.dto.SettingsUpdateRequest;
import com.sonpurclinic.entity.ClinicSettings;
import com.sonpurclinic.repository.ClinicSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClinicSettingsService {
    private final ClinicSettingsRepository repository;
    public ClinicSettingsService(ClinicSettingsRepository repository) { this.repository = repository; }

    @Transactional
    public ClinicSettings getEntity() {
        return repository.findById(1L).orElseGet(() -> repository.save(new ClinicSettings()));
    }

    public SettingsResponse getPublicSettings() { return SettingsResponse.from(getEntity()); }

    @Transactional
    public SettingsResponse update(SettingsUpdateRequest request) {
        ClinicSettings settings = getEntity();
        settings.setClinicName(request.clinicName().trim());
        settings.setBookingFee(request.bookingFee());
        settings.setAddress(blankToEmpty(request.address()));
        settings.setPhone(blankToEmpty(request.phone()));
        settings.setEmail(blankToEmpty(request.email()));
        settings.setWorkingHours(blankToEmpty(request.workingHours()));
        settings.setDescription(blankToEmpty(request.description()));
        return SettingsResponse.from(repository.save(settings));
    }

    @Transactional
    public void setQrFile(String fileName) {
        ClinicSettings settings = getEntity();
        settings.setQrImageFile(fileName);
        repository.save(settings);
    }

    @Transactional
    public void setLogoFile(String fileName) {
        ClinicSettings settings = getEntity();
        settings.setLogoImageFile(fileName);
        repository.save(settings);
    }

    private String blankToEmpty(String value) { return value == null ? "" : value.trim(); }
}
