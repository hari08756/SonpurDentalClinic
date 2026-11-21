package com.sonpurclinic.dto;
import com.sonpurclinic.entity.Appointment;
import com.sonpurclinic.entity.BookingStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
public record AppointmentResponse(Long id, String bookingCode, String patientName, String phone, Integer age,
        String problem, LocalDate date, LocalTime time, Integer amount, BookingStatus status,
        String upiTransactionId, boolean paymentProofUploaded, LocalDateTime createdAt,
        boolean patientAccountLinked, String cancellationReason, LocalDateTime cancelledAt) {
    public static AppointmentResponse from(Appointment a) {
        return new AppointmentResponse(a.getId(), a.getBookingCode(), a.getPatientName(), a.getPhone(), a.getAge(),
                a.getProblem(), a.getSlot().getDate(), a.getSlot().getTime(), a.getAmount(), a.getStatus(),
                a.getUpiTransactionId(), a.getPaymentProofFile() != null, a.getCreatedAt(),
                a.getPatientAccount() != null, a.getCancellationReason(), a.getCancelledAt());
    }
}
