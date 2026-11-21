package com.sonpurclinic.controller;

import com.sonpurclinic.dto.*;
import com.sonpurclinic.service.*;
import com.sonpurclinic.entity.ClinicSettings;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final ClinicSettingsService settingsService;
    private final AvailabilityService availabilityService;
    private final AppointmentService appointmentService;
    private final FileStorageService fileStorage;

    public PublicController(ClinicSettingsService settingsService, AvailabilityService availabilityService,
                            AppointmentService appointmentService, FileStorageService fileStorage) {
        this.settingsService = settingsService;
        this.availabilityService = availabilityService;
        this.appointmentService = appointmentService;
        this.fileStorage = fileStorage;
    }

    @GetMapping("/settings")
    public SettingsResponse settings() { return settingsService.getPublicSettings(); }

    @GetMapping("/slots")
    public Object slots(@RequestParam("date") LocalDate date) { return availabilityService.getPublicSlots(date); }

    @GetMapping("/booking-time-suggestion")
    public BookingTimeSuggestionResponse suggestBookingTime(
            @RequestParam("date") LocalDate date,
            @RequestParam("time") java.time.LocalTime time) {
        return appointmentService.suggestBookingTime(date, time);
    }

    /**
     * Public booking is intentionally disabled. New appointments must belong to
     * an authenticated patient account so one account is associated with each phone.
     */
    @PostMapping("/bookings")
    public void createBookingRequiresPatientLogin() {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Please log in or create a patient account before booking an appointment.");
    }

    /** Payment proof can only be submitted by the patient who owns the booking. */
    @PostMapping(value = "/bookings/{bookingCode}/payment-proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void uploadProofRequiresPatientLogin(@PathVariable("bookingCode") String bookingCode,
            @RequestParam(name = "transactionId", required = false) String transactionId,
            @RequestParam(name = "file", required = false) MultipartFile file) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Please log in to the patient account that owns this appointment before submitting payment proof.");
    }

    @GetMapping("/bookings/{bookingCode}")
    public PublicAppointmentResponse bookingStatus(@PathVariable("bookingCode") String bookingCode) {
        return appointmentService.getPublicBooking(bookingCode);
    }

    @GetMapping("/qr")
    public ResponseEntity<Resource> qr() {
        ClinicSettings settings = settingsService.getEntity();
        if (settings.getQrImageFile() == null || settings.getQrImageFile().isBlank()) return ResponseEntity.notFound().build();
        Resource resource = fileStorage.load(settings.getQrImageFile());
        return ResponseEntity.ok().contentType(mediaType(settings.getQrImageFile())).cacheControl(CacheControl.noCache()).body(resource);
    }

    @GetMapping("/logo")
    public ResponseEntity<Resource> logo() {
        ClinicSettings settings = settingsService.getEntity();
        if (settings.getLogoImageFile() == null || settings.getLogoImageFile().isBlank()) return ResponseEntity.notFound().build();
        Resource resource = fileStorage.load(settings.getLogoImageFile());
        return ResponseEntity.ok().contentType(mediaType(settings.getLogoImageFile()))
                .cacheControl(CacheControl.noCache()).body(resource);
    }

    private MediaType mediaType(String file) {
        String f = file.toLowerCase();
        if (f.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (f.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }
}
