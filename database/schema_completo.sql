-- ============================================
-- SCHEMA COMPLETO - PROJETO PAGAMENTOS
-- Banco de Dados: PostgreSQL 14+
-- Gerado em: 27/04/2026
-- ============================================

-- Criar banco de dados
CREATE DATABASE projeto_pagamentos
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

\c projeto_pagamentos

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- 1. USUÁRIOS (Tabela base para autenticação)
CREATE TABLE usuarios (
    -- PK
    id BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'SOLICITANTE', 'ESCRITORIO', 'APROVADOR', 'EXPANSAO')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_username ON usuarios(username);
CREATE INDEX idx_role ON usuarios(role);

-- 2. EMPRESAS
CREATE TABLE empresas (
    -- PK
    entidade BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    razao VARCHAR(150) NOT NULL,
    
    -- FK
    usuario_criador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_cnpj ON empresas(cnpj);
CREATE INDEX idx_nome ON empresas(nome);
CREATE INDEX idx_usuario_criador ON empresas(usuario_criador_id);

-- 3. PRESTADORES
CREATE TABLE prestadores (
    -- PK
    codprestador BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    nome VARCHAR(50) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    
    -- FK
    usuario_criador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_cpf ON prestadores(cpf);
CREATE INDEX idx_nome ON prestadores(nome);
CREATE INDEX idx_usuario_criador ON prestadores(usuario_criador_id);

-- 4. ENDEREÇOS
CREATE TABLE enderecos (
    -- PK
    idendereco BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(50),
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    
    -- FK
    empresa_id BIGINT REFERENCES empresas(entidade) ON DELETE CASCADE,
    usuario_criador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_cep ON enderecos(cep);
CREATE INDEX idx_empresa ON enderecos(empresa_id);
CREATE INDEX idx_usuario_criador ON enderecos(usuario_criador_id);

-- 5. DADOS BANCÁRIOS PRESTADOR
CREATE TABLE dados_bancarios_prestador (
    -- PK
    dados_bancario_id BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    banco VARCHAR(50),
    tipo_conta VARCHAR(20),
    agencia VARCHAR(10),
    conta VARCHAR(20),
    chave_pix VARCHAR(100),
    
    -- FK
    cod_prestador BIGINT NOT NULL UNIQUE REFERENCES prestadores(codprestador) ON DELETE CASCADE,
    usuario_criador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_prestador ON dados_bancarios_prestador(cod_prestador);
CREATE INDEX idx_usuario_criador ON dados_bancarios_prestador(usuario_criador_id);

-- 6. GRUPO DE ITENS
CREATE TABLE grupo_itens (
    -- PK
    id_grupo BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    
    -- FK
    usuario_criador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_nome ON grupo_itens(nome);
CREATE INDEX idx_usuario_criador ON grupo_itens(usuario_criador_id);

-- 7. ITENS
CREATE TABLE itens (
    -- PK
    id_item BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor_unitario DECIMAL(10, 2),
    preco_medio DECIMAL(10, 2),
    tipo_unitario VARCHAR(20) CHECK (tipo_unitario IN ('UNIDADE', 'KILO', 'METRO', 'LITRO', 'CAIXA', 'PACOTE')),
    
    -- FK
    id_grupo BIGINT NOT NULL REFERENCES grupo_itens(id_grupo) ON DELETE RESTRICT,
    usuario_criador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_nome ON itens(nome);
CREATE INDEX idx_grupo ON itens(id_grupo);
CREATE INDEX idx_usuario_criador ON itens(usuario_criador_id);

-- 8. DESCONTO ITEM (Descontos progressivos por quantidade)
CREATE TABLE desconto_item (
    -- PK
    id_desconto BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    quantidade_minima INT NOT NULL,
    percentual_desconto DECIMAL(5, 2),
    valor_final DECIMAL(10, 2),
    descricao VARCHAR(255),
    
    -- FK
    id_item BIGINT NOT NULL REFERENCES itens(id_item) ON DELETE CASCADE,
    
    -- Índices
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_item ON desconto_item(id_item);
CREATE INDEX idx_quantidade ON desconto_item(quantidade_minima);

-- 9. ORÇAMENTOS
CREATE TABLE orcamentos (
    -- PK
    orcamentoid BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    movimento DATE NOT NULL,
    descricao TEXT,
    valor DECIMAL(10, 2),
    valor_total_itens DECIMAL(10, 2),
    desconto DECIMAL(10, 2) DEFAULT 0,
    valor_final DECIMAL(10, 2),
    tipo_pagamento VARCHAR(20) CHECK (tipo_pagamento IN ('DINHEIRO', 'PIX', 'BOLETO', 'TRANSFERENCIA', 'CARTAO_CREDITO', 'CARTAO_DEBITO')),
    
    -- FK
    entidade BIGINT NOT NULL REFERENCES empresas(entidade) ON DELETE RESTRICT,
    cod_prestador BIGINT NOT NULL REFERENCES prestadores(codprestador) ON DELETE RESTRICT,
    usuario_criador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_movimento ON orcamentos(movimento);
CREATE INDEX idx_empresa ON orcamentos(entidade);
CREATE INDEX idx_prestador ON orcamentos(cod_prestador);
CREATE INDEX idx_usuario_criador ON orcamentos(usuario_criador_id);

-- 10. ORÇAMENTO ITENS (Itens do orçamento)
CREATE TABLE orcamento_itens (
    -- PK
    id_orcamento_item BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10, 2) NOT NULL,
    valor_total DECIMAL(10, 2),
    
    -- FK
    orcamento_id BIGINT NOT NULL REFERENCES orcamentos(orcamentoid) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES itens(id_item) ON DELETE RESTRICT,
    
    -- Índices
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orcamento ON orcamento_itens(orcamento_id);
CREATE INDEX idx_item ON orcamento_itens(item_id);

-- Trigger para calcular valor total
CREATE OR REPLACE FUNCTION calcular_valor_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.valor_total := NEW.quantidade * NEW.valor_unitario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_valor_total
BEFORE INSERT OR UPDATE ON orcamento_itens
FOR EACH ROW EXECUTE FUNCTION calcular_valor_total();

-- 11. ORÇAMENTO IMAGENS (Anexos do orçamento)
CREATE TABLE orcamento_imagens (
    -- PK
    id_imagem BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(50),
    tamanho_arquivo BIGINT,
    caminho_arquivo VARCHAR(500) NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- FK
    orcamento_id BIGINT NOT NULL REFERENCES orcamentos(orcamentoid) ON DELETE CASCADE,
    
    -- Índices
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orcamento ON orcamento_imagens(orcamento_id);
CREATE INDEX idx_data_upload ON orcamento_imagens(data_upload);

-- 12. SOLICITAÇÕES DE APROVAÇÃO
CREATE TABLE solicitacoes_aprovacao (
    -- PK
    solicitacao_aprovacao BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    movimento DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO', 'CANCELADO')),
    
    -- FK
    orcamentoid BIGINT NOT NULL UNIQUE REFERENCES orcamentos(orcamentoid) ON DELETE CASCADE,
    usuario_criador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_status ON solicitacoes_aprovacao(status);
CREATE INDEX idx_movimento ON solicitacoes_aprovacao(movimento);
CREATE INDEX idx_orcamento ON solicitacoes_aprovacao(orcamentoid);
CREATE INDEX idx_usuario_criador ON solicitacoes_aprovacao(usuario_criador_id);

-- 13. PAGAMENTOS
CREATE TABLE pagamentos (
    -- PK
    pagamentoid BIGSERIAL PRIMARY KEY,
    
    -- Colunas
    valor DECIMAL(10, 2) NOT NULL,
    data_pagamento DATE,
    status_pagamento VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status_pagamento IN ('PENDENTE', 'PAGO', 'CANCELADO', 'ATRASADO')),
    forma_pagamento VARCHAR(20) CHECK (forma_pagamento IN ('DINHEIRO', 'PIX', 'BOLETO', 'TRANSFERENCIA', 'CARTAO_CREDITO', 'CARTAO_DEBITO')),
    observacoes TEXT,
    
    -- FK
    solicitacaoaprovacaoid BIGINT NOT NULL UNIQUE REFERENCES solicitacoes_aprovacao(solicitacao_aprovacao) ON DELETE CASCADE,
    usuario_criador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_status ON pagamentos(status_pagamento);
CREATE INDEX idx_data ON pagamentos(data_pagamento);
CREATE INDEX idx_solicitacao ON pagamentos(solicitacaoaprovacaoid);
CREATE INDEX idx_usuario_criador ON pagamentos(usuario_criador_id);

-- ============================================
-- DADOS INICIAIS (Opcional)
-- ============================================

-- Inserir usuário ADMIN padrão (senha: admin123 - BCrypt)
-- IMPORTANTE: Altere a senha após o primeiro login!
INSERT INTO usuarios (username, password, role) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');

-- Inserir usuário EXPANSAO de exemplo (senha: expansao123 - BCrypt)
INSERT INTO usuarios (username, password, role) VALUES 
('expansao', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'EXPANSAO');

-- ============================================
-- VIEWS ÚTEIS (Opcional)
-- ============================================

-- View: Orçamentos com detalhes completos
CREATE OR REPLACE VIEW vw_orcamentos_completos AS
SELECT 
    o.orcamentoid,
    o.movimento,
    e.nome AS empresa_nome,
    e.cnpj AS empresa_cnpj,
    p.nome AS prestador_nome,
    p.cpf AS prestador_cpf,
    o.descricao,
    o.valor,
    o.valor_total_itens,
    o.desconto,
    o.valor_final,
    o.tipo_pagamento,
    u.username AS criado_por,
    sa.status AS status_aprovacao
FROM orcamentos o
JOIN empresas e ON o.entidade = e.entidade
JOIN prestadores p ON o.cod_prestador = p.codprestador
JOIN usuarios u ON o.usuario_criador_id = u.id
LEFT JOIN solicitacoes_aprovacao sa ON sa.orcamentoid = o.orcamentoid;

-- View: Itens com grupo e descontos
CREATE OR REPLACE VIEW vw_itens_completos AS
SELECT 
    i.id_item,
    i.nome AS item_nome,
    i.descricao AS item_descricao,
    i.valor_unitario,
    i.preco_medio,
    i.tipo_unitario,
    g.nome AS grupo_nome,
    COUNT(di.id_desconto) AS total_descontos
FROM itens i
JOIN grupo_itens g ON i.id_grupo = g.id_grupo
LEFT JOIN desconto_item di ON i.id_item = di.id_item
GROUP BY i.id_item, i.nome, i.descricao, i.valor_unitario, i.preco_medio, i.tipo_unitario, g.nome;

-- ============================================
-- PERMISSÕES (Opcional - para produção)
-- ============================================

-- Criar usuário específico para a aplicação
-- CREATE USER app_pagamentos WITH PASSWORD 'senha_segura_aqui';
-- GRANT ALL PRIVILEGES ON DATABASE projeto_pagamentos TO app_pagamentos;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_pagamentos;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_pagamentos;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
