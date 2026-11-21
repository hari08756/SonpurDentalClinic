package com.sonpurclinic.controller;

import com.sonpurclinic.config.JwtService;
import com.sonpurclinic.dto.*;
import com.sonpurclinic.entity.*;
import com.sonpurclinic.repository.ClinicSettingsRepository;
import com.sonpurclinic.service.*;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final JwtService jwtService;
    private final AdminAccountService adminAccountService;
    private final AppointmentService appointmentService;
    private final AvailabilityService availabilityService;
    private final ClinicSettingsService settingsService;
    private final ClinicSettingsRepository settingsRepository;
    private final FileStorageService fileStorage;
    private final PatientAccountService patientAccountService;

    public AdminController(JwtService jwtService,
            AdminAccountService adminAccountService,
            AppointmentService appointmentService, AvailabilityService availabilityService,
            ClinicSettingsService settingsService, ClinicSettingsRepository settingsRepository,
            FileStorageService fileStorage, PatientAccountService patientAccountService) {
        this.jwtService = jwtService;
        this.adminAccountService = adminAccountService;
        this.appointmentService = appointmentService;
        this.availabilityService = availabilityService;
        this.settingsService = settingsService;
        this.settingsRepository = settingsRepository;
        this.fileStorage = fileStorage;
        this.patientAccountService = patientAccountService;
    }

    @PostMapping("/auth/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        AdminAccountResponse profile = adminAccountService.authenticate(request.username(), request.password());
        return Map.of("token", jwtService.createToken(profile.username()), "username", profile.username(), "profile", profile);
    }

    @GetMapping("/me")
    public AdminAccountResponse me(HttpServletRequest request) {
        return adminAccountService.getProfile(adminUsername(request));
    }

    @PutMapping("/me")
    public Map<String, Object> updateMe(@Valid @RequestBody AdminProfileUpdateRequest profile, HttpServletRequest request) {
        AdminAccountResponse updated = adminAccountService.updateProfile(adminUsername(request), profile);
        return Map.of("token", jwtService.createToken(updated.username()), "username", updated.username(), "profile", updated);
    }

    private String adminUsername(HttpServletRequest request) {
        Object username = request.getAttribute("adminUsername");
        if (username == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin login required");
        return username.toString();
    }

    @GetMapping("/summary")
    public Map<String, Long> summary() {
        return Map.of(
                "pendingPayment", appointmentService.count(BookingStatus.PENDING_PAYMENT),
                "paymentSubmitted", appointmentService.count(BookingStatus.PAYMENT_SUBMITTED),
                "confirmed", appointmentService.count(BookingStatus.CONFIRMED),
                "rejected", appointmentService.count(BookingStatus.REJECTED),
                "cancelled", appointmentService.count(BookingStatus.CANCELLED),
                "patientAccounts", patientAccountService.count());
    }

    @GetMapping("/patients")
    public Object patients() { return patientAccountService.getAll(); }

    @GetMapping("/bookings")
    public Object bookings(@RequestParam(name = "status", required = false) String status) {
    return appointmentService.getAll(status);
}

    @PutMapping("/bookings/{id}/status")
    public AppointmentResponse updateStatus(@PathVariable("id") Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return appointmentService.updateStatus(id, request.status());
    }

    @GetMapping("/bookings/{id}/payment-proof")
    public ResponseEntity<Resource> paymentProof(@PathVariable("id") Long id) {
        Appointment appointment = appointmentService.getEntity(id);
        if (appointment.getPaymentProofFile() == null) return ResponseEntity.notFound().build();
        Resource resource = fileStorage.load(appointment.getPaymentProofFile());
        return ResponseEntity.ok().contentType(mediaType(appointment.getPaymentProofFile()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=payment-proof")
                .cacheControl(CacheControl.noStore()).body(resource);
    }

    @GetMapping("/slots")
public Object slots(@RequestParam("from") LocalDate from, @RequestParam("to") LocalDate to) {
        return availabilityService.getAdminSlots(from, to);
    }

    @PostMapping("/slots")
    public Object addSlot(@Valid @RequestBody SlotRequest request) { return availabilityService.add(request); }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<Void> deleteSlot(@PathVariable("id") Long id) {
        availabilityService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/settings")
    public SettingsResponse settings() { return settingsService.getPublicSettings(); }

    @PutMapping("/settings")
    public SettingsResponse updateSettings(@Valid @RequestBody SettingsUpdateRequest request) {
        return settingsService.update(request);
    }

    @PostMapping(value = "/settings/qr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SettingsResponse uploadQr(@RequestParam("file") MultipartFile file) {
        String stored = fileStorage.storeImage(file, "qr");
        settingsService.setQrFile(stored);
        return settingsService.getPublicSettings();
    }

    @PostMapping(value = "/settings/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SettingsResponse uploadLogo(@RequestParam("file") MultipartFile file) {
        String stored = fileStorage.storeImage(file, "logo");
        settingsService.setLogoFile(stored);
        return settingsService.getPublicSettings();
    }

    private MediaType mediaType(String file) {
        String f = file.toLowerCase();
        if (f.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (f.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }
}
