package com.sonpurclinic.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationHours;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-hours:12}") long expirationHours) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationHours = expirationHours;
    }

    public String createToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);
        return Jwts.builder().subject(username).claim("role", "ADMIN").issuedAt(now).expiration(expiry).signWith(key).compact();
    }

    public String createPatientToken(String phone) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);
        return Jwts.builder().subject(phone).claim("role", "PATIENT")
                .issuedAt(now).expiration(expiry).signWith(key).compact();
    }

    public String getRole(String token) {
        Object role = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().get("role");
        return role == null ? null : role.toString();
    }

    public String getSubject(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }
}
