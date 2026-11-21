package com.sonpurclinic.repository;

import com.sonpurclinic.entity.Appointment;
import com.sonpurclinic.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByBookingCode(String bookingCode);
    boolean existsBySlot_IdAndStatusIn(Long slotId, List<BookingStatus> statuses);
    List<Appointment> findAllByOrderByCreatedAtDesc();
    List<Appointment> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    long countByStatus(BookingStatus status);
    List<Appointment> findByPatientAccount_IdOrderByCreatedAtDesc(Long patientAccountId);
    List<Appointment> findByPatientAccount_PhoneOrderByCreatedAtDesc(String phone);
    List<Appointment> findByPhoneAndPatientAccountIsNull(String phone);
}
