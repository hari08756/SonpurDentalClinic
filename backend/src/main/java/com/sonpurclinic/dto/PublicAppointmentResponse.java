package com.sonpurclinic.dto;
import com.sonpurclinic.entity.Appointment;
import com.sonpurclinic.entity.BookingStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
public record PublicAppointmentResponse(String bookingCode, String patientName, LocalDate date, LocalTime time,
        Integer amount, BookingStatus status, String upiTransactionId, boolean paymentProofUploaded, LocalDateTime createdAt) {
    public static PublicAppointmentResponse from(Appointment a) {
        return new PublicAppointmentResponse(a.getBookingCode(), a.getPatientName(), a.getSlot().getDate(), a.getSlot().getTime(),
                a.getAmount(), a.getStatus(), a.getUpiTransactionId(), a.getPaymentProofFile() != null, a.getCreatedAt());
    }
}
