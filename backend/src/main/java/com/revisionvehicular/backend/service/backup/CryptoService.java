package com.revisionvehicular.backend.service.backup;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class CryptoService {

    private static final String PREFIX = "v1:";
    private static final int IV_LEN = 12;
    private static final int TAG_LEN_BITS = 128;

    private final SecureRandom random = new SecureRandom();
    private final SecretKey masterKey;

    public CryptoService(@Value("${backup.mail.master-key:}") String masterKeyBase64) {
        if (masterKeyBase64 == null || masterKeyBase64.isBlank()) {
            this.masterKey = null;
            return;
        }
        byte[] raw = Base64.getDecoder().decode(masterKeyBase64.trim());
        if (raw.length != 32) {
            throw new IllegalArgumentException("backup.mail.master-key debe ser Base64 de 32 bytes (AES-256)");
        }
        this.masterKey = new SecretKeySpec(raw, "AES");
    }

    public boolean isEnabled() {
        return masterKey != null;
    }

    /** Devuelve ciphertext en formato v1:base64(iv):base64(ciphertext). */
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isBlank()) return plaintext;
        requireKey();
        try {
            byte[] iv = new byte[IV_LEN];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, masterKey, new GCMParameterSpec(TAG_LEN_BITS, iv));
            byte[] ct = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return PREFIX
                    + Base64.getEncoder().encodeToString(iv)
                    + ":"
                    + Base64.getEncoder().encodeToString(ct);
        } catch (Exception e) {
            throw new RuntimeException("Error cifrando secreto: " + e.getMessage(), e);
        }
    }

    /**
     * Si no tiene prefijo v1:, devuelve el valor tal cual (compatibilidad/backwards).
     * Si tiene prefijo, lo descifra con la clave maestra.
     */
    public String decryptOrPlain(String value) {
        if (value == null || value.isBlank()) return value;
        if (!value.startsWith(PREFIX)) return value;
        requireKey();
        try {
            String payload = value.substring(PREFIX.length());
            String[] parts = payload.split(":", 2);
            if (parts.length != 2) {
                throw new IllegalArgumentException("Formato cifrado inválido");
            }
            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] ct = Base64.getDecoder().decode(parts[1]);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, masterKey, new GCMParameterSpec(TAG_LEN_BITS, iv));
            byte[] pt = cipher.doFinal(ct);
            return new String(pt, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error descifrando secreto: " + e.getMessage(), e);
        }
    }

    private void requireKey() {
        if (masterKey == null) {
            throw new IllegalStateException("backup.mail.master-key no está configurada en el servidor");
        }
    }
}

