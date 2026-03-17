package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.entities.backup.BackupConfig;
import com.revisionvehicular.backend.entities.backup.BackupRecord;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class BackupMailService {
    private final CryptoService cryptoService;

    public BackupMailService(CryptoService cryptoService) {
        this.cryptoService = cryptoService;
    }

    public void enviarNotificacion(BackupRecord record, BackupConfig config) {
        if (!Boolean.TRUE.equals(config.getMailHabilitado())) return;
        if (!cryptoService.isEnabled()) return;
        if (config.getMailUsername() == null || config.getMailUsername().isBlank()) return;
        if (config.getMailPassword() == null || config.getMailPassword().isBlank()) return;
        if (config.getEmailNotificacion() == null || config.getEmailNotificacion().isBlank()) return;

        try {
            JavaMailSenderImpl mailSender = construirMailSender(config);

            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            boolean exitoso = "EXITOSO".equals(record.getEstado());

            String from = (config.getMailFrom() != null && !config.getMailFrom().isBlank())
                    ? config.getMailFrom()
                    : config.getMailUsername();
            helper.setFrom(from);
            helper.setTo(config.getEmailNotificacion());
            helper.setSubject(exitoso
                    ? "✅ Respaldo completado: " + record.getTipo()
                    : "❌ Respaldo fallido: " + record.getTipo());
            helper.setText(construirCuerpo(record, exitoso), true);

            mailSender.send(mensaje);

        } catch (Exception e) {
            System.err.println("Error al enviar correo de notificación: " + e.getMessage());
        }
    }

    private JavaMailSenderImpl construirMailSender(BackupConfig config) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        // Gmail SMTP fijo
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername(config.getMailUsername());
        mailSender.setPassword(cryptoService.decryptOrPlain(config.getMailPassword()));
        mailSender.setDefaultEncoding("UTF-8");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.debug", "false");

        return mailSender;
    }

    private String construirCuerpo(BackupRecord record, boolean exitoso) {
        String color = exitoso ? "#2e7d32" : "#c62828";
        String estado = exitoso ? "EXITOSO" : "FALLIDO";
        String icono = exitoso ? "✅" : "❌";

        StringBuilder html = new StringBuilder();
        html.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");
        html.append("<div style='background-color: ").append(color)
                .append("; padding: 20px; border-radius: 8px 8px 0 0;'>")
                .append("<h2 style='color: white; margin: 0;'>")
                .append(icono).append(" Respaldo ").append(estado)
                .append("</h2></div>");
        html.append("<div style='background-color: #f5f5f5; padding: 24px; border-radius: 0 0 8px 8px;'>");
        html.append("<table style='width: 100%; border-collapse: collapse;'>");

        agregarFila(html, "Tipo de respaldo", record.getTipo());
        agregarFila(html, "Origen", record.getOrigen());
        agregarFila(html, "Ejecutado por", record.getEjecutadoPor() != null ? record.getEjecutadoPor() : "SCHEDULER");
        agregarFila(html, "Fecha inicio", record.getCreadoEn() != null ? record.getCreadoEn().toString() : "—");
        agregarFila(html, "Fecha fin", record.getFinalizadoEn() != null ? record.getFinalizadoEn().toString() : "—");

        if (exitoso) {
            agregarFila(html, "Archivo", record.getNombreArchivo());
            agregarFila(html, "Tamaño", formatearTamano(record.getTamanoBytes()));
            agregarFila(html, "Ruta servidor", record.getRutaServidor());
            agregarFila(html, "Google Drive", record.getDriveFileId() != null
                    ? "✅ Subido correctamente" : "No configurado");
        } else {
            agregarFila(html, "Error", "<span style='color:#c62828;'>"
                    + record.getMensajeError() + "</span>");
        }

        html.append("</table>");
        html.append("<p style='color:#666;font-size:12px;margin-top:20px;'>")
                .append("Este mensaje fue generado automáticamente por el sistema RTV.")
                .append("</p>");
        html.append("</div></div>");
        return html.toString();
    }

    private void agregarFila(StringBuilder html, String label, String valor) {
        html.append("<tr>")
                .append("<td style='padding:8px 12px;font-weight:bold;background-color:#eeeeee;")
                .append("width:40%;border-bottom:1px solid #ddd;'>").append(label).append("</td>")
                .append("<td style='padding:8px 12px;border-bottom:1px solid #ddd;'>")
                .append(valor != null ? valor : "—").append("</td></tr>");
    }

    private String formatearTamano(Long bytes) {
        if (bytes == null) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}