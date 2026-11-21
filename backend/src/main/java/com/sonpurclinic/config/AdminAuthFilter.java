package com.sonpurclinic.config;

import com.sonpurclinic.repository.AdminAccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class AdminAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final AdminAccountRepository adminRepository;

    public AdminAuthFilter(JwtService jwtService, AdminAccountRepository adminRepository) {
        this.jwtService = jwtService;
        this.adminRepository = adminRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !path.startsWith("/api/admin/")
                || path.equals("/api/admin/auth/login");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Admin login required");
            return;
        }
        try {
            String token = header.substring(7);
            String username = jwtService.getSubject(token);
            String role = jwtService.getRole(token);
            // A missing role is accepted only for old, unexpired admin tokens created before role claims were added.
            if ((role != null && !"ADMIN".equals(role)) || !adminRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("Invalid admin session");
            }
            request.setAttribute("adminUsername", username);
        } catch (Exception ex) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired. Please sign in again.");
            return;
        }
        chain.doFilter(request, response);
    }
}
