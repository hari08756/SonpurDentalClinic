package com.sonpurclinic.controller;

import com.sonpurclinic.dto.*;
import com.sonpurclinic.entity.PatientAccount;
import com.sonpurclinic.service.AppointmentService;
import com.sonpurclinic.service.PatientAccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PatientController {
    private final PatientAccountService patientService;
    private final AppointmentService appointmentService;

    public PatientController(PatientAccountService patientService, AppointmentService appointmentService) {
        this.patientService = patientService;
        this.appointmentService = appointmentService;
    }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public PatientAuthResponse register(@Valid @RequestBody PatientRegisterRequest request) {
        return patientService.register(request);
    }

    @PostMapping("/auth/login")
    public PatientAuthResponse login(@Valid @RequestBody PatientLoginRequest request) {
        return patientService.login(request);
    }

    @GetMapping("/me")
    public PatientAccountResponse me(HttpServletRequest request) {
        return patientService.getProfile(patientPhone(request));
    }

    @PutMapping("/me")
    public PatientAuthResponse updateMe(@Valid @RequestBody PatientProfileUpdateRequest request, HttpServletRequest servletRequest) {
        return patientService.updateProfile(patientPhone(servletRequest), request);
    }

    @GetMapping("/appointments")
    public List<AppointmentResponse> appointments(HttpServletRequest request) {
        return appointmentService.getPatientAppointments(patientPhone(request));
    }

    @PostMapping("/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public PublicAppointmentResponse createBooking(@Valid @RequestBody BookingRequest booking, HttpServletRequest request) {
        String phone = patientPhone(request);
        if (!phone.equals(booking.phone())) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,
                    "The appointment mobile number must match your logged-in account.");
        }
        PatientAccount account = patientService.getByPhone(phone);
        // The account is authoritative for identity fields; never trust a client-supplied name.
        BookingRequest accountBooking = new BookingRequest(
                account.getFullName(), account.getPhone(), booking.age(), booking.problem(),
                booking.slotId(), booking.date(), booking.time());
        return appointmentService.createBooking(accountBooking, account);
    }

    @PostMapping(value = "/bookings/{bookingCode}/payment-proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PublicAppointmentResponse uploadProof(@PathVariable("bookingCode") String bookingCode,
            @RequestParam(name = "transactionId") String transactionId,
            @RequestParam("file") MultipartFile file, HttpServletRequest request) {
        return appointmentService.submitPaymentByPatient(bookingCode, patientPhone(request), transactionId, file);
    }

    @PostMapping("/appointments/{id}/cancel")
    public AppointmentResponse cancel(@PathVariable("id") Long id, @Valid @RequestBody CancellationRequest cancellation,
                                      HttpServletRequest request) {
        return appointmentService.cancelByPatient(id, patientPhone(request), cancellation.reason());
    }

    private String patientPhone(HttpServletRequest request) {
        Object phone = request.getAttribute("patientPhone");
        if (phone == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Patient login required");
        return phone.toString();
    }
}
