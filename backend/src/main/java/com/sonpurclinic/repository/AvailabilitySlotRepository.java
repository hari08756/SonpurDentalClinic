package com.sonpurclinic.repository;

import com.sonpurclinic.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.time.LocalDate;
import java.util.List;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {
    List<AvailabilitySlot> findByDateAndEnabledTrueOrderByTimeAsc(LocalDate date);
    List<AvailabilitySlot> findByDateBetweenOrderByDateAscTimeAsc(LocalDate from, LocalDate to);
    boolean existsByDateAndTime(LocalDate date, java.time.LocalTime time);
    Optional<AvailabilitySlot> findByDateAndTime(LocalDate date, java.time.LocalTime time);

    @Modifying
    @Query(value = "INSERT INTO availability_slots (slot_date, slot_time, enabled) " +
            "VALUES (:date, :time, TRUE) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)", nativeQuery = true)
    int ensureSlotExists(@Param("date") LocalDate date, @Param("time") java.time.LocalTime time);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from AvailabilitySlot s where s.date = :date and s.time = :time")
    Optional<AvailabilitySlot> findByDateAndTimeForUpdate(@Param("date") LocalDate date,
                                                           @Param("time") java.time.LocalTime time);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from AvailabilitySlot s where s.id = :id")
    Optional<AvailabilitySlot> findByIdForUpdate(@Param("id") Long id);
}
