package com.sonpurclinic.dto;
import jakarta.validation.constraints.NotNull;
import com.sonpurclinic.entity.BookingStatus;
public record StatusUpdateRequest(@NotNull BookingStatus status) {}
