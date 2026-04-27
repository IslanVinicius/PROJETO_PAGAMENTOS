# Correção do Erro de Constraint - ROLE_EXPANSAO

## Problema
Ao tentar criar um usuário com role EXPANSAO, ocorre o erro:
```
ERROR: new row for relation "usuarios" violates check constraint "usuarios_role_check"
``` 

## Causa
O enum Role foi atualizado no código Java para incluir EXPANSAO, mas a constraint de check no banco de dados PostgreSQL ainda tem apenas os valores antigos.

## Solução

### Opção 1: Executar Script SQL (Recomendado)

1. Conecte-se ao banco de dados PostgreSQL
2. Execute o script localizado em:
   ```
   src/main/resources/db/migration/add_expansao_role.sql
   ```

3. Ou execute manualmente estes comandos SQL:
   ```sql
   -- Dropar constraint antiga
   ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_role_check;
   
   -- Criar nova constraint com EXPANSAO
   ALTER TABLE usuarios 
   ADD CONSTRAINT usuarios_role_check 
   CHECK (role IN ('ADMIN', 'SOLICITANTE', 'ESCRITORIO', 'APROVADOR', 'EXPANSAO'));
   ```

### Opção 2: Via pgAdmin

1. Abra o pgAdmin
2. Conecte-se ao banco de dados
3. Abra a ferramenta Query Tool
4. Cole e execute o SQL da Opção 1

### Opção 3: Via Linha de Comando (psql)

```bash
psql -U seu_usuario -d nome_do_banco -f src/main/resources/db/migration/add_expansao_role.sql
```

## Verificação

Após executar o script, verifique se a constraint foi atualizada:

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'usuarios'::regclass
AND contype = 'c';
```

Deve retornar algo como:
```
CHECK ((role)::text = ANY (ARRAY['ADMIN'::character varying, 'SOLICITANTE'::character varying, 'ESCRITORIO'::character varying, 'APROVADOR'::character varying, 'EXPANSAO'::character varying]::text[]))
```

## Teste

Após aplicar a correção, tente criar um novo usuário com role EXPANSAO novamente. Deve funcionar sem erros.
