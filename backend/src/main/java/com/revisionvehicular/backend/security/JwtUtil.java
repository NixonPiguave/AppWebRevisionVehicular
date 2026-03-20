package com.revisionvehicular.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey secretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String usuario, String usuarioDB, String contrasenaDB) {
        return generateToken(usuario, usuarioDB, contrasenaDB, null);
    }

    public String generateToken(String usuario, String usuarioDB, String contrasenaDB, Long sesionId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("usuarioDB", usuarioDB);
        claims.put("contrasenaDB", contrasenaDB);
        if (sesionId != null) {
            claims.put("sid", sesionId);
        }

        return Jwts.builder()
                .claims(claims)
                .subject(usuario)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey())
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractUsuarioDB(String token) {
        return extractClaims(token).get("usuarioDB", String.class);
    }

    public String extractContrasenaDB(String token) {
        return extractClaims(token).get("contrasenaDB", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            return extractClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public Long extractSesionId(String token) {
        try {
            Object sid = extractClaims(token).get("sid");
            if (sid instanceof Number) {
                return ((Number) sid).longValue();
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }


    private static final long CLOCK_SKEW_SECONDS_FOR_EXPIRED_READ = 3650L * 24 * 60 * 60;


    public Claims extractClaimsIgnoringExpiration(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            return Jwts.parser()
                    .verifyWith(secretKey())
                    .clockSkewSeconds(CLOCK_SKEW_SECONDS_FOR_EXPIRED_READ)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }
}
