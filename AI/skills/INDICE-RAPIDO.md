# Índice Rápido - Skills do Projeto

## 📚 Documentação Completa (7 arquivos)

### 1. [resumo-executivo.md](resumo-executivo.md) - VISÃO GERAL
**Quando usar**: Primeira leitura, entender o projeto rapidamente
- Stack tecnológica completa
- Arquitetura e padrões principais
- Funcionalidades implementadas
- Métricas do projeto
- Diferenciais

**Tempo de leitura**: 5 minutos

---

### 2. [backend.md](backend.md) - IMPLEMENTAÇÃO BACKEND
**Quando usar**: Criar/modificar código Java/Spring
- Fluxo de criação CRUD (Entity → Repository → DTO → Service → Controller)
- Padrões de segurança e permissões
- Exemplos de código completos
- Migrações Flyway
- Armadilhas comuns backend

**Tempo de leitura**: 20-30 minutos (referência contínua)

---

### 3. [frontend.md](frontend.md) - IMPLEMENTAÇÃO FRONTEND
**Quando usar**: Criar/modificar código React
- Fluxo de criação (Service → Component → CSS Module → Rota)
- Autenticação com AuthContext
- Padrão de cores Marsala
- Exemplos de componentes completos
- Armadilhas comuns frontend

**Tempo de leitura**: 20-30 minutos (referência contínua)

---

### 4. [padroes.md](padroes.md) - REGRAS GLOBAIS
**Quando usar**: Verificar padrões arquiteturais obrigatórios
- Controller → Service → Repository
- DTO Pattern
- CSS Modules
- Fluxos críticos (JWT, Orçamentos, PDF)
- Lista completa do NÃO FAZER

**Tempo de leitura**: 15 minutos (consultar frequentemente)

---

### 5. [context-map.md](context-map.md) - ONDE ESTÁ CADA COISA
**Quando usar**: Encontrar arquivos, entender estrutura
- Estrutura completa de diretórios
- Onde implementar cada coisa
- Como encontrar rapidamente
- Exemplos reais de modificações

**Tempo de leitura**: 10 minutos (consulta rápida)

---

### 6. [licoes-aprendidas.md](licoes-aprendidas.md) - EVITAR ERROS
**Quando usar**: Debugging, evitar problemas conhecidos
- 10 problemas críticos resolvidos
- Causa raiz e solução de cada bug
- Padrões descobertos
- Checklist de debugging
- Dicas de ouro

**Tempo de leitura**: 15 minutos (antes de debugar)

---

### 7. [README.md](README.md) - ÍNDICE PRINCIPAL
**Quando usar**: Navegação entre documentos
- Visão geral de todos os arquivos
- Ordem de leitura recomendada
- Quando usar cada arquivo
- Checklists rápidos

**Tempo de leitura**: 3 minutos

---

## 🎯 Cenários Comuns

### "Vou criar um novo CRUD"
1. Ler **backend.md** (fluxo completo)
2. Ler **frontend.md** (fluxo completo)
3. Consultar **padroes.md** (regras obrigatórias)
4. Verificar **context-map.md** (onde criar arquivos)
5. Checar **licoes-aprendidas.md** (evitar erros)

**Tempo total**: ~2 horas de leitura + implementação

---

### "Preciso modificar algo existente"
1. Abrir **context-map.md** (encontrar arquivos)
2. Verificar **padroes.md** (seguir padrões)
3. Consultar **licoes-aprendidas.md** (bugs conhecidos)
4. Implementar mudanças
5. Testar manualmente

**Tempo total**: ~30 minutos de leitura + implementação

---

### "Está dando erro, preciso debugar"
1. Abrir **licoes-aprendidas.md** (checklist de debugging)
2. Verificar se é problema conhecido
3. Seguir passos de solução documentados
4. Se não resolver, consultar **backend.md** ou **frontend.md**

**Tempo total**: ~10 minutos de leitura + debugging

---

### "Quero entender o projeto rapidamente"
1. Ler **resumo-executivo.md** (visão geral)
2. Ler **README.md** (estrutura da documentação)
3. Explorar **context-map.md** (estrutura de arquivos)

**Tempo total**: ~15 minutos

---

### "Vou implementar dashboard/filtros"
1. Ler **frontend.md** → seção "Dashboard Profissional"
2. Ler **padroes.md** → seção "Padrão de Dashboards"
3. Verificar **licoes-aprendidas.md** → problema #8 e #9
4. Implementar seguindo padrão drill-down

**Tempo total**: ~45 minutos de leitura + implementação

---

### "Preciso integrar com API externa"
1. Ler **padroes.md** → seção "Integração com APIs Externas"
2. Verificar **licoes-aprendidas.md** → problema #7 (ViaCEP)
3. Seguir padrão de proxy backend

**Tempo total**: ~20 minutos de leitura + implementação

---

## 📊 Estatísticas da Documentação

| Arquivo | Tamanho | Páginas estimadas | Tempo leitura |
|---------|---------|-------------------|---------------|
| resumo-executivo.md | 9.4 KB | 4 páginas | 5 min |
| README.md | 5.0 KB | 2 páginas | 3 min |
| backend.md | 21.4 KB | 9 páginas | 25 min |
| frontend.md | 29.0 KB | 12 páginas | 30 min |
| padroes.md | 14.7 KB | 6 páginas | 15 min |
| context-map.md | 17.7 KB | 7 páginas | 10 min |
| licoes-aprendidas.md | 15.2 KB | 6 páginas | 15 min |
| **TOTAL** | **112.4 KB** | **~46 páginas** | **~103 min** |

---

## 🚀 Atalhos por Tipo de Desenvolvedor

### Backend Developer
**Leitura obrigatória:**
1. backend.md (completo)
2. padroes.md (seções de segurança e transações)
3. licoes-aprendidas.md (problemas 1-7)

**Consulta frequente:**
- backend.md → exemplos de código
- padroes.md → NÃO FAZER
- licoes-aprendidas.md → debugging

---

### Frontend Developer
**Leitura obrigatória:**
1. frontend.md (completo)
2. padroes.md (CSS Modules, autenticação)
3. licoes-aprendidas.md (problemas 2, 8, 9)

**Consulta frequente:**
- frontend.md → exemplos de componentes
- padroes.md → padrão de cores
- licoes-aprendidas.md → CSS Modules bugs

---

### Fullstack Developer
**Leitura completa:** Todos os arquivos
**Tempo estimado**: 2-3 horas distribuídas

**Ordem recomendada:**
1. resumo-executivo.md (visão geral)
2. backend.md (backend completo)
3. frontend.md (frontend completo)
4. padroes.md (regras globais)
5. context-map.md (navegação)
6. licoes-aprendidas.md (lições)

---

## 💡 Dicas de Uso

### Para Agents AI
1. **SEMPRE** ler backend.md ou frontend.md antes de implementar
2. **SEMPRE** verificar padroes.md para regras obrigatórias
3. **SEMPRE** consultar licoes-aprendidas.md antes de debugar
4. **NUNCA** pular a verificação de permissões (padroes.md)
5. **NUNCA** hardcode dados (licoes-aprendidas.md → problema #8)

### Para Desenvolvedores Humanos
1. Usar como referência durante desenvolvimento
2. Consultar antes de commits importantes
3. Revisar licoes-aprendidas.md semanalmente
4. Atualizar documentação quando descobrir novos padrões
5. Compartilhar com novos membros da equipe

---

## 🔄 Manutenção da Documentação

### Quando Atualizar
- Nova funcionalidade implementada
- Novo padrão descoberto
- Bug crítico resolvido
- Mudança arquitetural
- Nova biblioteca adicionada

### Como Atualizar
1. Adicionar na seção apropriada
2. Manter consistência com formato existente
3. Incluir exemplo de código se relevante
4. Atualizar "Última atualização" no final do arquivo
5. Incrementar versão se mudança significativa

---

## ✅ Checklist de Leitura

### Onboarding de Novo Desenvolvedor
- [ ] Li resumo-executivo.md
- [ ] Li README.md
- [ ] Li backend.md OU frontend.md (dependendo da especialidade)
- [ ] Li padroes.md
- [ ] Li context-map.md
- [ ] Li licoes-aprendidas.md
- [ ] Configurei ambiente de desenvolvimento
- [ ] Executei build com sucesso
- [ ] Implementei primeira tarefa simples

### Antes de Cada Tarefa
- [ ] Verifiquei context-map.md (onde trabalhar)
- [ ] Verifiquei padroes.md (regras a seguir)
- [ ] Verifiquei licoes-aprendidas.md (erros a evitar)
- [ ] Entendi requisitos completamente
- [ ] Planejei implementação

### Antes de Commit
- [ ] Código segue padrões documentados
- [ ] Build passa sem erros
- [ ] Testei manualmente
- [ ] Não introduzi armadilhas conhecidas
- [ ] Documentação atualizada (se necessário)

---

**Versão**: 2.0  
**Última atualização**: 2026-05-01  
**Total de documentos**: 7 arquivos  
**Total de conteúdo**: ~112 KB / ~46 páginas
