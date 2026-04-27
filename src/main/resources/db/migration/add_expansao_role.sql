-- Script para adicionar EXPANSAO à constraint de check da tabela usuarios
-- Execute este script no banco de dados PostgreSQL

-- 1. Dropar a constraint existente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_role_check;

-- 2. Criar nova constraint com todos os valores do enum, incluindo EXPANSAO
ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_role_check 
CHECK (role IN ('ADMIN', 'SOLICITANTE', 'ESCRITORIO', 'APROVADOR', 'EXPANSAO'));

-- Verificar se a constraint foi criada corretamente
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'usuarios'::regclass
AND contype = 'c';
