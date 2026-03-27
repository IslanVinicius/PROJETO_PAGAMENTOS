import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar mensagens temporárias
 * @param {number} duration - Duração em milissegundos antes de limpar a mensagem (padrão: 3000ms)
 * @returns {Object} Estado da mensagem e função para definir
 */
export function useMensagemTemporaria(duration = 3000) {
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [message, duration]);

    return [message, setMessage];
}
