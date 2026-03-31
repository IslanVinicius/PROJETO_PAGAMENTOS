# 🧪 Guia de Testes - IdFieldWithLookup Melhorado

## 📋 Checklist de Testes

### **✅ Testes Funcionais**

#### 1. **Preenchimento de ID com Busca Automática**
- [ ] Digite um ID válido no campo
- [ ] Aguarde o carregamento (loading)
- [ ] Verifique se o nome associado aparece corretamente
- [ ] Confirme que o nome está no campo ao lado (desktop) ou abaixo (mobile)

**Resultado Esperado:**
```
Desktop:
┌──────────────┬─────────────────┐
│ ID: 123      │ PRESTADOR       │
│              │ João Silva ✅   │
└──────────────┴─────────────────┘

Mobile:
┌──────────────┐
│ ID: 123      │
│              │
│ PRESTADOR    │
│ João Silva ✅│
└──────────────┘
```

---

#### 2. **Alteração de ID**
- [ ] Preencha um ID e aguarde o nome carregar
- [ ] Altere o ID para outro valor
- [ ] Verifique se o nome anterior é limpo
- [ ] Confirme se novo nome é buscado corretamente

**Comportamento Esperado:**
1. Nome antigo desaparece suavemente
2. Loading indicator aparece
3. Novo nome é exibido com animação slide

---

#### 3. **ID Inválido**
- [ ] Digite um ID que não existe na API
- [ ] Verifique se nenhum nome é exibido
- [ ] Confirme que não há erros no console

**Resultado Esperado:**
- Campo de nome não aparece
- Mensagem de erro tratada graciosamente
- Console sem erros críticos

---

#### 4. **Estado de Carregamento**
- [ ] Digite um ID rapidamente
- [ ] Observe o estado de loading
- [ ] Verifique se "Carregando..." ou "Buscando..." aparece

**Indicadores Visuais:**
```
Opção 1 (no campo do nome):
┌──────────────────┐
│ Carregando...    │ ← Itálico, cor terciária
└──────────────────┘

Opção 2 (abaixo dos campos):
Buscando...
```

---

### **📱 Testes Responsivos**

#### 5. **Desktop (> 1024px)**
- [ ] Abra em resolução 1920x1080
- [ ] Verifique se ID e nome estão lado a lado
- [ ] Confirme gap de ~8px entre campos
- [ ] Meça largura mínima do ID (~150px)
- [ ] Meça largura mínima do nome (~200px)

**Layout Esperado:**
```
┌────────────┐  ┌──────────────────────┐
│ ID Field   │  │ Name Display         │
│ (150px+)   │  │ (flex: 1, 200px+)    │
└────────────┘  └──────────────────────┘
     ↑                  ↑
  Fixed width      Flexible width
```

---

#### 6. **Tablet (769px - 1024px)**
- [ ] Redimensione janela para 900px de largura
- [ ] Verifique se campos permanecem lado a lado
- [ ] Confirme que larguras mínimas se ajustam
- [ ] Gap deve ser menor (~4px)

**Ajustes Esperados:**
- ID: min-width 120px (reduzido de 150px)
- Nome: min-width 150px (reduzido de 200px)
- Gap: spacing-xs (4px)

---

#### 7. **Mobile (≤ 768px)**
- [ ] Redimensione janela para 375px de largura
- [ ] Verifique se layout muda para vertical
- [ ] Confirme que campos ocupam 100% da largura
- [ ] Gap mínimo entre campos (4px)

**Layout Esperado:**
```
┌─────────────────────┐
│ ID Field            │
│ ┌────────────────┐  │
│ │ Input          │  │
│ └────────────────┘  │
│                     │ ← 4px gap
│ Name Display        │
│ ┌────────────────┐  │
│ │ Name           │  │
│ └────────────────┘  │
└─────────────────────┘
```

---

### **🎨 Testes Visuais**

#### 8. **Animação SlideIn**
- [ ] Preencha um ID
- [ ] Observe a entrada do nome
- [ ] Verifique se animação é suave (~150-300ms)
- [ ] Confirme direção: esquerda para direita

**Animação Esperada:**
```
Frame 1:  [opacity: 0, translateX: -10px]
Frame 5:  [opacity: 0.5, translateX: -5px]
Frame 10: [opacity: 1, translateX: 0] ✅
```

---

#### 9. **Estilização do Nome**
- [ ] Verifique borda esquerda de 4px (primary-color)
- [ ] Confirme background (bg-secondary)
- [ ] Cheque contraste do texto
- [ ] Valide tamanho da fonte (14px)

**Especificações CSS:**
```css
.nameDisplay {
    border-left: 4px solid #8B2635;  /* primary-color */
    background-color: #f8f9fa;        /* bg-secondary */
}

.nameText {
    font-size: 14px;
    font-weight: 600;
    color: #202124;                   /* text-primary */
}
```

---

#### 10. **Hover e Focus States**
- [ ] Passe mouse sobre o input do ID (hover)
- [ ] Clique no input do ID (focus)
- [ ] Verifique mudanças de cor da borda
- [ ] Confirme box-shadow no focus

**Estados Esperados:**

**Hover:**
```
Border: primary-light (#A63446)
```

**Focus:**
```
Border: primary-color (#8B2635)
Box-shadow: 0 0 0 3px rgba(139, 38, 53, 0.1)
```

---

### **♿ Testes de Acessibilidade**

#### 11. **Labels e Leitura**
- [ ] Verifique se labels são visíveis
- [ ] Confirme contraste adequado (WCAG AA)
- [ ] Labels devem estar em uppercase
- [ ] Tamanho da fonte legível (≥12px)

**Especificações:**
```css
label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
```

---

#### 12. **Navegação por Teclado**
- [ ] Navegue até o campo com Tab
- [ ] Preencha ID usando apenas teclado
- [ ] Verifique se focus é visível
- [ ] Confirma que Enter não causa submit indesejado

**Focus Indicator:**
- Borda colorida visível
- Box-shadow presente
- Contraste adequado

---

### **🔄 Testes de Integração**

#### 13. **OrcamentoCadastro.jsx**
- [ ] Acesse formulário de orçamento
- [ ] Preencha ID do prestador
- [ ] Verifique se nome aparece corretamente
- [ ] Confirme layout lado a lado
- [ ] Teste em desktop e mobile

**Campos para Testar:**
- ID PRESTADOR → PRESTADOR (nome)
- EMPRESA ID → EMPRESA (nome)

---

#### 14. **DadosBancariosCadastro.jsx**
- [ ] Acesse dados bancários
- [ ] Preencha CÓDIGO PRESTADOR
- [ ] Verifique exibição do nome
- [ ] Valide responsividade

**Campo para Testar:**
- CÓDIGO PRESTADOR → PRESTADOR (nome)

---

### **⚡ Testes de Performance**

#### 15. **Tempo de Resposta**
- [ ] Meie tempo entre digitar ID e nome aparecer
- [ ] Deve ser < 1 segundo (dependendo da API)
- [ ] Loading indicator deve aparecer imediatamente
- [ ] Animação deve ser suave (60fps)

**Métricas Alvo:**
- Início do loading: < 100ms
- Requisição API: 200-500ms (varia)
- Render + animação: < 300ms

---

#### 16. **Múltiplas Requisições**
- [ ] Digite IDs rapidamente em sequência
- [ ] Verifique se requisições antigas são canceladas
- [ ] Confirme que apenas último nome aparece
- [ ] Sem vazamentos de memória ou erros

**Comportamento Esperado:**
```
ID: 123 → Request A iniciada
ID: 456 → Request B iniciada (A cancelada)
ID: 789 → Request C iniciada (B cancelada)
Resultado final: Nome do ID 789 exibido ✅
```

---

## 🐛 Casos de Borda para Testar

### **17. IDs Especiais**
- [ ] ID = 0
- [ ] ID negativo
- [ ] ID muito grande (ex: 999999999)
- [ ] ID com zeros à esquerda (ex: 00123)
- [ ] ID vazio

### **18. Nomes Especiais**
- [ ] Nome com caracteres especiais (ç, ã, ê)
- [ ] Nome muito longo (> 100 caracteres)
- [ ] Nome vazio
- [ ] Nome com HTML/Scripts (XSS prevention)

### **19. Estados do Componente**
- [ ] Disabled (desabilitado)
- [ ] Read-only (somente leitura)
- [ ] Múltiplos componentes na mesma tela
- [ ] Componente em modal

---

## 📊 Critérios de Aceite

### **Funcionais (Obrigatórios)**
- ✅ ID e nome aparecem lado a lado em desktop
- ✅ Layout vertical em mobile
- ✅ Nome busca automaticamente ao digitar ID
- ✅ Loading indicator visível
- ✅ Animação suave ao carregar
- ✅ Responsivo em todos breakpoints

### **Visuais (Obrigatórios)**
- ✅ Borda de 4px no nome
- ✅ Background secundário no nome
- ✅ Labels em uppercase
- ✅ Hover/focus states claros
- ✅ Contraste adequado

### **Performance (Desejáveis)**
- ✅ Tempo de resposta < 1s
- ✅ Animações a 60fps
- ✅ Sem memory leaks
- ✅ Requisições otimizadas

### **Acessibilidade (Desejáveis)**
- ✅ Labels legíveis
- ✅ Focus visível
- ✅ Navegação por teclado
- ✅ Contraste WCAG AA

---

## 🚀 Como Reportar Bugs

### **Template de Report**

```markdown
**Descrição:**
[Descreva o problema claramente]

**Passos para Reproduzir:**
1. Acesse [página]
2. Preencha [campo] com [valor]
3. Observe [comportamento]

**Comportamento Esperado:**
[O que deveria acontecer]

**Comportamento Atual:**
[O que está acontecendo]

**Ambiente:**
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Resolução: [1920x1080]
- Device: [Desktop/Mobile/Tablet]

**Screenshots/Vídeos:**
[Se aplicável]

**Severidade:**
[ ] Crítico - Funcionalidade quebrada
[ ] Alto - Impacta UX significativamente
[ ] Médio - Problema visual
[ ] Baixo - Melhoria cosmética
```

---

## ✅ Sign-off

### **Checklist Final**
- [ ] Todos testes funcionais passaram
- [ ] Layout responsivo verificado
- [ ] Performance dentro do esperado
- [ ] Acessibilidade validada
- [ ] Nenhum bug crítico encontrado
- [ ] Documentação atualizada
- [ ] Código revisado

### **Aprovação**
- [ ] Dev Lead ✅
- [ ] QA Team ✅
- [ ] Product Owner ✅

---

**Data dos Testes:** ___________  
**Responsável:** ___________  
**Status:** [ ] Aprovado [ ] Reprovado [ ] Pendente

**Observações:**
_____________________________________________
_____________________________________________
_____________________________________________
