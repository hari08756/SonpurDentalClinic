package com.sonpurclinic.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingTimeSuggestionResponse(
        boolean requestedTimeAvailable,
        LocalDate suggestedDate,
        LocalTime suggestedTime,
        String suggestionType,
        String message
) {}
