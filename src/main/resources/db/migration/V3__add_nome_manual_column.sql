-- Adicionar coluna para nome manual (itens sem vínculo com Item cadastrado)
ALTER TABLE ORCAMENTO_ITENS ADD COLUMN IF NOT EXISTS NOME_MANUAL VARCHAR(200);

-- Comentário explicativo
COMMENT ON COLUMN ORCAMENTO_ITENS.NOME_MANUAL IS 'Nome do item manual quando ITEM_ID é NULL';
