package com.sonpurclinic.dto;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
public record SlotRequest(@NotNull LocalDate date, @NotNull LocalTime time) {}
