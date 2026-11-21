package com.sonpurclinic.service;

import com.sonpurclinic.dto.AppointmentResponse;
import com.sonpurclinic.dto.PublicAppointmentResponse;
import com.sonpurclinic.dto.BookingRequest;
import com.sonpurclinic.dto.BookingTimeSuggestionResponse;
import com.sonpurclinic.entity.*;
import com.sonpurclinic.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {
    private static final List<BookingStatus> ACTIVE_STATUSES = List.of(
            BookingStatus.PENDING_PAYMENT, BookingStatus.PAYMENT_SUBMITTED, BookingStatus.CONFIRMED);
    private final AppointmentRepository appointmentRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final ClinicSettingsService settingsService;
    private final FileStorageService fileStorage;
    private final SecureRandom random = new SecureRandom();

    public AppointmentService(AppointmentRepository appointmentRepository, AvailabilitySlotRepository slotRepository,
                              ClinicSettingsService settingsService, FileStorageService fileStorage) {
        this.appointmentRepository = appointmentRepository;
        this.slotRepository = slotRepository;
        this.settingsService = settingsService;
        this.fileStorage = fileStorage;
    }

    @Transactional(readOnly = true)
    public BookingTimeSuggestionResponse suggestBookingTime(LocalDate date, LocalTime time) {
        LocalDateTime requested = date.atTime(time);
        LocalDateTime now = LocalDateTime.now();

        if (!requested.isAfter(now)) {
            return new BookingTimeSuggestionResponse(
                    false, null, null, "NONE",
                    "Please choose a future appointment time."
            );
        }

        if (isTimeAvailable(date, time)) {
            return new BookingTimeSuggestionResponse(
                    true, null, null, "NONE",
                    "Your requested time is available."
            );
        }

        LocalDateTime twentyMinutesLater = requested.plusMinutes(20);

        if (twentyMinutesLater.isAfter(now)
                && isTimeAvailable(twentyMinutesLater.toLocalDate(), twentyMinutesLater.toLocalTime())) {
            return new BookingTimeSuggestionResponse(
                    false,
                    twentyMinutesLater.toLocalDate(),
                    twentyMinutesLater.toLocalTime(),
                    "TWENTY_MINUTES",
                    "Your requested time is booked. Would you like to book 20 minutes later?"
            );
        }

        List<AvailabilitySlot> availableSlots = slotRepository.findByDateBetweenOrderByDateAscTimeAsc(
                date, date.plusDays(90)
        );

        for (AvailabilitySlot candidate : availableSlots) {
            LocalDateTime candidateTime = candidate.getDate().atTime(candidate.getTime());
            if (candidateTime.isAfter(twentyMinutesLater)
                    && candidateTime.isAfter(now)
                    && candidate.isEnabled()
                    && !appointmentRepository.existsBySlot_IdAndStatusIn(candidate.getId(), ACTIVE_STATUSES)) {
                return new BookingTimeSuggestionResponse(
                        false,
                        candidate.getDate(),
                        candidate.getTime(),
                        "NEXT_AVAILABLE",
                        "Your requested time is booked. Here is the next available clinic slot."
                );
            }
        }

        return new BookingTimeSuggestionResponse(
                false, null, null, "NONE",
                "No alternative time is currently available. Please choose another date or time."
        );
    }

    private boolean isTimeAvailable(LocalDate date, LocalTime time) {
        return slotRepository.findByDateAndTime(date, time)
                .map(slot -> slot.isEnabled()
                        && !appointmentRepository.existsBySlot_IdAndStatusIn(slot.getId(), ACTIVE_STATUSES))
                .orElse(true);
    }

    @Transactional
    public PublicAppointmentResponse createBooking(BookingRequest request, PatientAccount patientAccount) {
        if (patientAccount == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Please log in or create a patient account before booking an appointment.");
        }
        if (!patientAccount.getPhone().equals(request.phone())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "The appointment mobile number must match your logged-in account.");
        }
        boolean hasPublishedSlot = request.slotId() != null;
        boolean hasCustomDate = request.date() != null;
        boolean hasCustomTime = request.time() != null;
        if (hasPublishedSlot == (hasCustomDate || hasCustomTime) || hasCustomDate != hasCustomTime) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose an available slot or enter both a date and a preferred time");
        }

        AvailabilitySlot slot;
        if (hasPublishedSlot) {
            slot = slotRepository.findByIdForUpdate(request.slotId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Selected time slot was not found"));
        } else {
            LocalDate today = LocalDate.now();
            if (request.date().isBefore(today) ||
                    (request.date().equals(today) && !request.time().isAfter(LocalTime.now()))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please choose a future appointment date and time");
            }
            // This creates the patient's requested time if it was not pre-published by the admin.
            // The unique date/time key plus row lock prevents two patients taking the same time.
            slotRepository.ensureSlotExists(request.date(), request.time());
            slot = slotRepository.findByDateAndTimeForUpdate(request.date(), request.time())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to reserve the requested time"));
        }

        LocalDate today = LocalDate.now();
        if (!slot.isEnabled() || slot.getDate().isBefore(today) ||
                (slot.getDate().equals(today) && !slot.getTime().isAfter(LocalTime.now()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This time slot is no longer available");
        }
        if (appointmentRepository.existsBySlot_IdAndStatusIn(slot.getId(), ACTIVE_STATUSES)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This time slot has just been booked. Please choose another time.");
        }
        ClinicSettings settings = settingsService.getEntity();
        Appointment appointment = new Appointment();
        appointment.setBookingCode(generateBookingCode());
        appointment.setPatientName(patientAccount.getFullName());
        appointment.setPhone(patientAccount.getPhone());
        appointment.setAge(request.age());
        appointment.setProblem(request.problem() == null ? "" : request.problem().trim());
        appointment.setSlot(slot);
        appointment.setAmount(settings.getBookingFee());
        appointment.setStatus(BookingStatus.PENDING_PAYMENT);
        appointment.setPatientAccount(patientAccount);
        return PublicAppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional
    public PublicAppointmentResponse submitPayment(String bookingCode, String transactionId, MultipartFile file) {
        Appointment appointment = getByCode(bookingCode);
        if (appointment.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment proof cannot be changed for this booking");
        }
        if (transactionId == null || transactionId.trim().length() < 6 || transactionId.trim().length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid UPI transaction/reference ID");
        }
        String stored = fileStorage.storeImage(file, "payment");
        appointment.setPaymentProofFile(stored);
        appointment.setUpiTransactionId(transactionId.trim());
        appointment.setStatus(BookingStatus.PAYMENT_SUBMITTED);
        return PublicAppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional
    public PublicAppointmentResponse submitPaymentByPatient(String bookingCode, String patientPhone,
                                                              String transactionId, MultipartFile file) {
        Appointment appointment = getByCode(bookingCode);
        if (appointment.getPatientAccount() == null
                || !patientPhone.equals(appointment.getPatientAccount().getPhone())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found for this patient account");
        }
        return submitPayment(bookingCode, transactionId, file);
    }

    @Transactional(readOnly = true)
    public PublicAppointmentResponse getPublicBooking(String code) { return PublicAppointmentResponse.from(getByCode(code)); }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAll(String status) {
        List<Appointment> appointments;
        if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) {
            appointments = appointmentRepository.findAllByOrderByCreatedAtDesc();
        } else {
            try { appointments = appointmentRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.valueOf(status.toUpperCase())); }
            catch (IllegalArgumentException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown booking status"); }
        }
        return appointments.stream().map(AppointmentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(String phone) {
        return appointmentRepository.findByPatientAccount_PhoneOrderByCreatedAtDesc(phone)
                .stream().map(AppointmentResponse::from).toList();
    }

    @Transactional
    public AppointmentResponse cancelByPatient(Long id, String phone, String reason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (appointment.getPatientAccount() == null || !phone.equals(appointment.getPatientAccount().getPhone())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found for this patient account");
        }
        if (!ACTIVE_STATUSES.contains(appointment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This appointment can no longer be cancelled");
        }
        LocalDateTime appointmentAt = appointment.getSlot().getDate().atTime(appointment.getSlot().getTime());
        if (!appointmentAt.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Past appointments cannot be cancelled online");
        }
        appointment.setStatus(BookingStatus.CANCELLED);
        appointment.setCancellationReason(reason.trim());
        appointment.setCancelledAt(LocalDateTime.now());
        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, BookingStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (newStatus == BookingStatus.CONFIRMED) {
            if (appointment.getStatus() != BookingStatus.PAYMENT_SUBMITTED || appointment.getPaymentProofFile() == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A submitted payment proof is required before confirmation");
            }
        } else if (newStatus == BookingStatus.REJECTED) {
            if (appointment.getStatus() != BookingStatus.PAYMENT_SUBMITTED && appointment.getStatus() != BookingStatus.PENDING_PAYMENT) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending payment requests can be rejected");
            }
        } else if (newStatus == BookingStatus.CANCELLED) {
            if (appointment.getStatus() == BookingStatus.CANCELLED || appointment.getStatus() == BookingStatus.REJECTED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "This appointment is already closed");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported status change");
        }
        appointment.setStatus(newStatus);
        if (newStatus == BookingStatus.CANCELLED) {
            appointment.setCancellationReason("Cancelled by clinic administrator");
            appointment.setCancelledAt(LocalDateTime.now());
        }
        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public Appointment getEntity(Long id) {
        return appointmentRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
    }

    @Transactional(readOnly = true)
    public long count(BookingStatus status) { return appointmentRepository.countByStatus(status); }

    private Appointment getByCode(String code) {
        return appointmentRepository.findByBookingCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking ID not found"));
    }

    private String generateBookingCode() {
        final String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        String code;
        do {
            StringBuilder value = new StringBuilder("SDC-");
            for (int i = 0; i < 10; i++) value.append(alphabet.charAt(random.nextInt(alphabet.length())));
            code = value.toString();
        } while (appointmentRepository.findByBookingCode(code).isPresent());
        return code;
    }
}
