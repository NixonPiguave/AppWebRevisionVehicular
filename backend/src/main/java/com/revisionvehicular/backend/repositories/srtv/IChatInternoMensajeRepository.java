package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.ChatInternoMensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface IChatInternoMensajeRepository extends JpaRepository<ChatInternoMensaje, Long> {

    @Query("SELECT m FROM ChatInternoMensaje m " +
            "WHERE (m.emisor.usuarioId = :usuarioA AND m.receptor.usuarioId = :usuarioB) " +
            "OR (m.emisor.usuarioId = :usuarioB AND m.receptor.usuarioId = :usuarioA) " +
            "ORDER BY m.creadoEn ASC")
    List<ChatInternoMensaje> findConversacion(@Param("usuarioA") Long usuarioA, @Param("usuarioB") Long usuarioB);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE ChatInternoMensaje m SET m.leidoEn = :ahora " +
            "WHERE m.receptor.usuarioId = :receptorId AND m.emisor.usuarioId = :emisorId AND m.leidoEn IS NULL")
    int marcarLeidosEnConversacion(
            @Param("receptorId") Long receptorId,
            @Param("emisorId") Long emisorId,
            @Param("ahora") LocalDateTime ahora
    );

    @Query("SELECT m.emisor.usuarioId, COUNT(m) FROM ChatInternoMensaje m " +
            "WHERE m.receptor.usuarioId = :receptorId AND m.leidoEn IS NULL GROUP BY m.emisor.usuarioId")
    List<Object[]> contarSinLeerPorEmisor(@Param("receptorId") Long receptorId);
}
