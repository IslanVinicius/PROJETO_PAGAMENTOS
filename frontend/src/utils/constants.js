/**
 * Constantes utilizadas na aplicação
 */

export const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    SOLICITANTE: 'ROLE_SOLICITANTE',
    ESCRITORIO: 'ROLE_ESCRITORIO',
    APROVADOR: 'ROLE_APROVADOR'
};

export const PERMISSOES = {
    [ROLES.ADMIN]: [
        'empresa',
        'prestador',
        'dadosBancarios',
        'orcamento',
        'pedidoAprovacao',
        'aprovacao',
        'usuario',
        'grupoItens',
        'itens'
    ],
    [ROLES.SOLICITANTE]: ['prestador', 'orcamento'],
    [ROLES.ESCRITORIO]: ['orcamento', 'pedidoAprovacao', 'grupoItens', 'itens'],
    [ROLES.APROVADOR]: ['aprovacao']
};

export const STATUS_ORCAMENTO = {
    PENDENTE: 'PENDENTE',
    APROVADO: 'APROVADO',
    REPROVADO: 'REPROVADO',
    CANCELADO: 'CANCELADO'
};
