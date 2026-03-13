package com.revisionvehicular.backend.security;

import com.revisionvehicular.backend.service.srtv.ISesionUsuarioService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ISesionUsuarioService sesionUsuarioService;

    public JwtFilter(JwtUtil jwtUtil, ISesionUsuarioService sesionUsuarioService) {
        this.jwtUtil = jwtUtil;
        this.sesionUsuarioService = sesionUsuarioService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                if (jwtUtil.isTokenValid(token)) {
                    Long sid = jwtUtil.extractSesionId(token);
                    if (sid != null && !sesionUsuarioService.isSesionActiva(sid)) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"error\":\"Sesión cerrada\"}");
                        return;
                    }
                    String username = jwtUtil.extractUsername(token);
                    String usuarioDB = jwtUtil.extractUsuarioDB(token);
                    String contrasenaDB = jwtUtil.extractContrasenaDB(token);

                    UserDatabaseContext.setCredentials(usuarioDB, contrasenaDB);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);

        } finally {
            UserDatabaseContext.clear();
        }
    }
}