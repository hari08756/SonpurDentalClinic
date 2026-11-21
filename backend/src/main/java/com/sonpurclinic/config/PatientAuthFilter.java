package com.sonpurclinic.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@Order(1)
public class PatientAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    public PatientAuthFilter(JwtService jwtService) { this.jwtService = jwtService; }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !path.startsWith("/api/patient/")
                || path.equals("/api/patient/auth/login")
                || path.equals("/api/patient/auth/register");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Patient login required");
            return;
        }
        try {
            String token = header.substring(7);
            if (!"PATIENT".equals(jwtService.getRole(token))) {
                throw new IllegalArgumentException("Not a patient token");
            }
            request.setAttribute("patientPhone", jwtService.getSubject(token));
        } catch (Exception ex) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired. Please log in again.");
            return;
        }
        chain.doFilter(request, response);
    }
}
