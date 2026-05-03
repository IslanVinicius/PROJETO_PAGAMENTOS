# Skills do Projeto Pagamentos

## 📚 Como Usar Estes Arquivos

Esta pasta contém documentação completa para agents e desenvolvedores trabalharem no projeto.

### Arquivos Disponíveis

1. **[backend.md](backend.md)** - Guia completo para implementação backend
   - Stack tecnológica (Java 21, Spring Boot 4.0.2, PostgreSQL)
   - Estrutura de pacotes
   - Fluxo de criação (Entity → Repository → DTO → Service → Controller)
   - Padrões de código com exemplos
   - Segurança e permissões (ADMIN/EXPANSAO/USER)
   - Padrões específicos do projeto (itens manuais, preço médio, dashboard)
   - Regras obrigatórias
   - O que NÃO fazer
   - Definição de pronto
   - Exemplos reais do projeto

2. **[frontend.md](frontend.md)** - Guia completo para implementação frontend
   - Stack tecnológica (React 19.2.0, Vite 7.3.1)
   - Estrutura de diretórios
   - Fluxo de criação (Service → Component → CSS Module → Rota)
   - Padrões React com exemplos
   - Autenticação e autorização (AuthContext, PrivateRoute)
   - Padrão de cores Marsala + Amarelo + Branco
   - Padrões específicos (modais, hooks, ViaCEP, dashboard drill-down)
   - Regras obrigatórias
   - O que NÃO fazer
   - Definição de pronto
   - Exemplos reais do projeto

3. **[padroes.md](padroes.md)** - Padrões arquiteturais e regras globais
   - Padrões arquiteturais (Controller→Service→Repository, DTO Pattern, CSS Modules)
   - Fluxos críticos (JWT, Orçamentos com itens, PDF)
   - Regras obrigatórias para TODO o projeto
   - Lista completa do NÃO FAZER (backend e frontend)
   - Padrão de cores oficial
   - Padrão de dashboards profissionais (drill-down)
   - Integração com APIs externas (ViaCEP)
   - Definição de pronto completa

4. **[context-map.md](context-map.md)** - Mapa de navegação do projeto
   - Estrutura completa de arquivos
   - Onde implementar cada coisa
   - Como encontrar coisas rapidamente
   - Exemplos reais de modificações
   - Pontos de atenção críticos
   - Comandos rápidos

5. **[licoes-aprendidas.md](licoes-aprendidas.md)** - Lições e armadilhas comuns
   - 10 problemas críticos resolvidos (com causa raiz e solução)
   - Padrões descobertos durante desenvolvimento
   - Estatísticas do projeto
   - Checklist de debugging
   - Dicas de ouro

---

## 🚨 ORDEM DE LEITURA OBRIGATÓRIA

**SEMPRE** nesta ordem:

1. **backend.md** ou **frontend.md** → Entender camada específica
2. **padroes.md** → Entender REGRAS e padrões globais
3. **context-map.md** → Entender ONDE está trabalhando
4. **licoes-aprendidas.md** → Evitar armadilhas conhecidas

---

## 🎯 Quando Usar Cada Arquivo

### Estou implementando algo NOVO
→ Leia **backend.md** ou **frontend.md** (dependendo da camada)

### Quero entender padrões do projeto
→ Leia **padroes.md**

### Não sei onde fica algo
→ Consulte **context-map.md**

### Vou modificar código existente
→ Consulte **context-map.md** para encontrar arquivos
→ Consulte **padroes.md** para verificar regras
→ Consulte **licoes-aprendidas.md** para evitar erros conhecidos

### Preciso de exemplo real
→ Todos os arquivos têm seção "Exemplos Reais"
→ **licoes-aprendidas.md** tem casos específicos de bugs e soluções

### Estou debugando um erro
→ Consulte **licoes-aprendidas.md** - Checklist de Debugging
→ Verifique se é um problema já documentado

---

## 🔄 Atualizando os Skills

Sempre que algo mudar no projeto, atualize estes arquivos:

### Quando atualizar:
- Nova entidade criada
- Novo padrão descoberto
- Nova biblioteca adicionada
- Mudança arquitetural
- Bug comum encontrado
- Solução elegante implementada

### Como atualizar:
1. Adicionar na seção apropriada
2. Manter consistência com formato existente
3. Incluir exemplo de código se relevante
4. Atualizar "Última atualização" no final

---

## 💡 Dicas para Agents

1. **Sempre consulte context-map.md primeiro** para entender onde está trabalhando
2. **Verifique padroes.md** antes de implementar para seguir convenções
3. **Use backend.md ou frontend.md** como guia passo-a-passo
4. **Procure em "Exemplos Reais"** por situações similares
5. **Consulte "NÃO FAZER"** para evitar armadilhas comuns
6. **Verifique "Definição de Pronto"** antes de considerar tarefa completa

---

## 📋 Checklist Rápido para Implementação

### Backend
- [ ] Li backend.md
- [ ] Criei Entity (se necessário)
- [ ] Criei Repository
- [ ] Criei DTOs
- [ ] Criei Service com permissões
- [ ] Criei Controller
- [ ] Criei migração Flyway (se necessário)
- [ ] Testei endpoints
- [ ] Build passa

### Frontend
- [ ] Li frontend.md
- [ ] Criei service API
- [ ] Criei componente
- [ ] Criei CSS module
- [ ] Adicionei rota (se necessário)
- [ ] Integrei com backend
- [ ] Tratamento de erros
- [ ] Loading states
- [ ] Build passa

### Geral
- [ ] Li padroes.md
- [ ] Verifiquei context-map.md
- [ ] Segui padrões existentes
- [ ] Evitei armadilhas listadas
- [ ] Atualizei skills (se novo padrão)

---

**Última atualização**: 2026-05-01  
**Versão**: 2.0
