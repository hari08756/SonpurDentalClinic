package com.sonpurclinic.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_slots", uniqueConstraints = @UniqueConstraint(columnNames = {"slot_date", "slot_time"}))
public class AvailabilitySlot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "slot_date", nullable = false)
    private LocalDate date;
    @Column(name = "slot_time", nullable = false)
    private LocalTime time;
    @Column(nullable = false)
    private boolean enabled = true;

    public AvailabilitySlot() {}
    public AvailabilitySlot(LocalDate date, LocalTime time) { this.date = date; this.time = time; this.enabled = true; }
    public Long getId() { return id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
