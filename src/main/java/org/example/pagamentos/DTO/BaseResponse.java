package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO base para respostas da API
 * Fornece uma estrutura padrão para todas as respostas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseResponse<T> {
    private LocalDateTime timestamp;
    private Integer status;
    private String message;
    private T data;

    public static <T> BaseResponse<T> success(T data, String message) {
        return new BaseResponse<>(LocalDateTime.now(), 200, message, data);
    }

    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(LocalDateTime.now(), 200, "Operação realizada com sucesso", data);
    }

    public static <T> BaseResponse<T> error(String message, Integer status) {
        return new BaseResponse<>(LocalDateTime.now(), status, message, null);
    }
}
