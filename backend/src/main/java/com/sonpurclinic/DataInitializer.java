package com.sonpurclinic;

import com.sonpurclinic.entity.ClinicSettings;
import com.sonpurclinic.repository.ClinicSettingsRepository;
import com.sonpurclinic.service.AdminAccountService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initializeClinicSettings(ClinicSettingsRepository repository,
                                               AdminAccountService adminAccountService,
                                               @Value("${app.admin.username}") String adminUsername,
                                               @Value("${app.admin.password}") String adminPassword) {
        return args -> {
            if (!repository.existsById(1L)) {
                ClinicSettings settings = new ClinicSettings();
                settings.setClinicName("Sonpur Dental Clinic");
                settings.setBookingFee(100);
                settings.setDescription("Comfortable, patient-focused dental care.");
                repository.save(settings);
            }
            // The environment credentials create the first database admin only.
            // Future profile and password changes are stored in admin_accounts.
            adminAccountService.createInitialAdmin(adminUsername, adminPassword);
        };
    }
}
