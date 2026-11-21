package com.sonpurclinic.dto;

import com.sonpurclinic.entity.ClinicSettings;

public record SettingsResponse(
        String clinicName, Integer bookingFee, String address, String phone,
        String email, String workingHours, String description,
        boolean qrUploaded, String qrUrl, boolean logoUploaded, String logoUrl) {

    public static SettingsResponse from(ClinicSettings s) {
        boolean hasQr = s.getQrImageFile() != null && !s.getQrImageFile().isBlank();
        boolean hasLogo = s.getLogoImageFile() != null && !s.getLogoImageFile().isBlank();
        return new SettingsResponse(
                s.getClinicName(), s.getBookingFee(), s.getAddress(), s.getPhone(),
                s.getEmail(), s.getWorkingHours(), s.getDescription(),
                hasQr, hasQr ? "/api/public/qr" : null,
                hasLogo, hasLogo ? "/api/public/logo" : null);
    }
}
