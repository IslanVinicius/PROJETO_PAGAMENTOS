-- Tornar ITEM_ID opcional na tabela ORCAMENTO_ITENS para suportar itens manuais
ALTER TABLE ORCAMENTO_ITENS ALTER COLUMN ITEM_ID DROP NOT NULL;

-- Adicionar coluna para descrição manual (itens sem vínculo com Item cadastrado)
ALTER TABLE ORCAMENTO_ITENS ADD COLUMN IF NOT EXISTS DESCRICAO_MANUAL VARCHAR(500);

-- Adicionar coluna para tipo unitário manual
ALTER TABLE ORCAMENTO_ITENS ADD COLUMN IF NOT EXISTS TIPO_UNITARIO_MANUAL VARCHAR(50);

-- Comentários explicativos
COMMENT ON COLUMN ORCAMENTO_ITENS.ITEM_ID IS 'ID do item cadastrado (NULL para itens manuais)';
COMMENT ON COLUMN ORCAMENTO_ITENS.DESCRICAO_MANUAL IS 'Descrição do item manual quando ITEM_ID é NULL';
COMMENT ON COLUMN ORCAMENTO_ITENS.TIPO_UNITARIO_MANUAL IS 'Tipo unitário do item manual quando ITEM_ID é NULL';
