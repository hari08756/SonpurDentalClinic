package com.sonpurclinic.service;

import com.sonpurclinic.dto.SlotRequest;
import com.sonpurclinic.entity.AvailabilitySlot;
import com.sonpurclinic.entity.BookingStatus;
import com.sonpurclinic.repository.AvailabilitySlotRepository;
import com.sonpurclinic.repository.AppointmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;

@Service
public class AvailabilityService {
    private static final List<BookingStatus> ACTIVE = List.of(BookingStatus.PENDING_PAYMENT, BookingStatus.PAYMENT_SUBMITTED, BookingStatus.CONFIRMED);
    private final AvailabilitySlotRepository slots;
    private final AppointmentRepository appointments;
    public AvailabilityService(AvailabilitySlotRepository slots, AppointmentRepository appointments) { this.slots = slots; this.appointments = appointments; }

    @Transactional(readOnly = true)
    public List<SlotView> getPublicSlots(LocalDate date) {
        if (date.isBefore(LocalDate.now())) return List.of();
        return slots.findByDateAndEnabledTrueOrderByTimeAsc(date).stream()
                .filter(slot -> !appointments.existsBySlot_IdAndStatusIn(slot.getId(), ACTIVE))
                .map(slot -> new SlotView(slot.getId(), slot.getDate(), slot.getTime(), true)).toList();
    }

    @Transactional(readOnly = true)
    public List<SlotView> getAdminSlots(LocalDate from, LocalDate to) {
        return slots.findByDateBetweenOrderByDateAscTimeAsc(from, to).stream()
                .map(slot -> new SlotView(slot.getId(), slot.getDate(), slot.getTime(),
                        slot.isEnabled() && !appointments.existsBySlot_IdAndStatusIn(slot.getId(), ACTIVE))).toList();
    }

    @Transactional
    public SlotView add(SlotRequest request) {
        if (request.date().isBefore(LocalDate.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot add a slot in the past");
        if (slots.existsByDateAndTime(request.date(), request.time())) throw new ResponseStatusException(HttpStatus.CONFLICT, "This date and time already exists");
        AvailabilitySlot slot = slots.save(new AvailabilitySlot(request.date(), request.time()));
        return new SlotView(slot.getId(), slot.getDate(), slot.getTime(), true);
    }

    @Transactional
    public void delete(Long id) {
        AvailabilitySlot slot = slots.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));
        if (appointments.existsBySlot_IdAndStatusIn(id, ACTIVE)) throw new ResponseStatusException(HttpStatus.CONFLICT, "This slot has an active appointment. Cancel or reject it first.");
        slots.delete(slot);
    }

    public record SlotView(Long id, LocalDate date, java.time.LocalTime time, boolean available) {}
}
