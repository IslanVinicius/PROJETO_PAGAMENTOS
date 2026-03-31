# Guia Visual - Layout IdFieldWithLookup

## 📐 Diagrama do Layout

### **Layout Desktop (Horizontal)**

```
┌──────────────────────────────────────────────────────────────┐
│  FORMULÁRIO DE ORÇAMENTO                                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ID ORÇAMENTO        │ MOVIMENTO *                    │   │
│  │ ┌──────────────┐    │ ┌──────────────┐               │   │
│  │ │ Automático   │    │ │ 15/03/2026   │               │   │
│  │ └──────────────┘    │ └──────────────┘               │   │
│  │                     │                                 │   │
│  │ ID PRESTADOR *      │ EMPRESA ID *                   │   │
│  │ ┌──────────────┐    │ ┌──────────────┐               │   │
│  │ │ 123          │    │ │ 456          │               │   │
│  │ └──────────────┘    │ └──────────────┘               │   │
│  │ ┌──────────────────────┐ ┌──────────────────────┐    │   │
│  │ │PRESTADOR             │ │EMPRESA               │    │   │
│  │ │João Silva            │ │Empresa XPTO Ltda     │    │   │
│  │ └──────────────────────┘ └──────────────────────┘    │   │
│  │                                                        │   │
│  │ DESCRIÇÃO *                                           │   │
│  │ ┌─────────────────────────────────────────────────┐   │   │
│  │ │ Descrição do orçamento...                       │   │   │
│  │ └─────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

### **Layout Mobile (Vertical)**

```
┌────────────────────────────┐
│  FORMULÁRIO                │
│                            │
│  ┌──────────────────────┐ │
│  │ ID ORÇAMENTO         │ │
│  │ ┌────────────────┐   │ │
│  │ │ Automático     │   │ │
│  │ └────────────────┘   │ │
│  │                      │ │
│  │ MOVIMENTO *          │ │
│  │ ┌────────────────┐   │ │
│  │ │ 15/03/2026     │   │ │
│  │ └────────────────┘   │ │
│  │                      │ │
│  │ ID PRESTADOR *       │ │
│  │ ┌────────────────┐   │ │
│  │ │ 123            │   │ │
│  │ └────────────────┘   │ │
│  │ ┌────────────────┐   │ │
│  │ │PRESTADOR       │   │ │
│  │ │João Silva      │   │ │
│  │ └────────────────┘   │ │
│  │                      │ │
│  │ EMPRESA ID *         │ │
│  │ ┌────────────────┐   │ │
│  │ │ 456            │   │ │
│  │ └────────────────┘   │ │
│  │ ┌────────────────┐   │ │
│  │ │EMPRESA         │   │ │
│  │ │Empresa XPTO    │   │ │
│  │ └────────────────┘   │ │
│  └──────────────────────┘ │
└────────────────────────────┘
```

---

## 🔍 Detalhe do Componente

### **Estado Normal (Sem ID)**

```
┌─────────────────────────────────────┐
│ ID PRESTADOR *                      │
│ ┌─────────────────────────────┐     │
│ │ Código do prestador         │     │
│ └─────────────────────────────┘     │
└─────────────────────────────────────┘
```

### **Estado Preenchido (Com Nome)**

```
┌─────────────────────────────────────────────────┐
│ ID PRESTADOR *          │ PRESTADOR              │
│ ┌────────────────┐      │ ┌──────────────────┐   │
│ │ 123            │      │ │ João Silva       │   │
│ └────────────────┘      │ └──────────────────┘   │
│                         ▲                        │
│                         │                        │
│                   Borda esquerda:                │
│                   4px primary-color              │
│                   Background: bg-secondary       │
└─────────────────────────────────────────────────┘
```

### **Estado de Carregamento**

```
┌─────────────────────────────────────────────────┐
│ ID PRESTADOR *          │ PRESTADOR              │
│ ┌────────────────┐      │ ┌──────────────────┐   │
│ │ 123            │      │ │ Carregando...    │   │
│ └────────────────┘      │ └──────────────────┘   │
│                                              │
│ Ou:                                          │
│                                              │
│ Buscando...                                  │
└─────────────────────────────────────────────────┘
```

---

## 📏 Medidas e Espaçamentos

### **Desktop**

```
ID Field                 Name Display
┌──────────────┐        ┌────────────────────────┐
│              │  8px   │                        │
│  Input       │  gap   │  Name Display          │
│  (150px min) │        │  (200px min, flex: 1)  │
│              │        │                        │
└──────────────┘        └────────────────────────┘
      ↑                        ↑
      │                        │
  Fixed width           Flexible width
```

### **Mobile**

```
┌─────────────────────────┐
│                         │
│  ID Field               │
│  ┌──────────────────┐   │
│  │                  │   │
│  │  Input           │   │
│  │  (100% width)    │   │
│  │                  │   │
│  └──────────────────┘   │
│                         │
│  4px gap                │
│                         │
│  Name Display           │
│  ┌──────────────────┐   │
│  │                  │   │
│  │  Name Display    │   │
│  │  (100% width)    │   │
│  │                  │   │
│  └──────────────────┘   │
│                         │
└─────────────────────────┘
```

---

## 🎨 Elementos Visuais

### **Cores e Bordas**

```
Name Display Detail:
┌────────────────────────────────┐
│ PRESTADOR                      │ ← Label: text-tertiary, 11px, uppercase
│ ┌────────────────────────────┐ │
│ │ João Silva                 │ │ ← Text: text-primary, 14px, font-weight: 600
│ └────────────────────────────┘ │
  ↑                              ↑
  │                              │
  4px solid                      Background:
  primary-color                  bg-secondary
  (#8B2635)                      (#f8f9fa)
```

### **Animação SlideIn**

```
Frame 1 (0ms):          Frame 5 (75ms):         Frame 10 (150ms):
                        ┌──────────────┐        ┌──────────────┐
                        │ ░░░░░░░░     │        │ João Silva   │
                        └──────────────┘        └──────────────┘
                        Opacity: 0.5            Opacity: 1
                        TranslateX: -10px       TranslateX: 0
                        
                        ↓ Aparece da esquerda ←
```

---

## 🔄 Fluxo de Interação

### **Sequência de Uso**

```
1. Usuário digita ID
   ┌────────────────┐
   │ 123|           │  ← Cursor piscando
   └────────────────┘

2. Sistema detecta mudança
   ⏳ Buscando...

3. API retorna dados
   ✅ Nome encontrado!

4. Nome aparece com animação
   ┌──────────────────┐
   │ João Silva       │  ← Slide da esquerda
   └──────────────────┘
```

---

## 📱 Breakpoints

### **Grid Layout Changes**

```
Telas Grandes (> 1024px)
┌────────┬─────────┬────────┬─────────┐
│ Field 1│ Field 2 │ Field 3│ Field 4 │
└────────┴─────────┴────────┴─────────┘

Telas Médias (769px - 1024px)
┌──────────┬──────────┐
│ Field 1  │ Field 2  │
├──────────┼──────────┤
│ Field 3  │ Field 4  │
└──────────┴──────────┘

Telas Pequenas (≤ 768px)
┌────────────┐
│ Field 1    │
├────────────┤
│ Field 2    │
├────────────┤
│ Field 3    │
├────────────┤
│ Field 4    │
└────────────┘
```

---

## ✨ Estados de Interação

### **Hover no Input**

```
┌────────────────┐
│ 123            │  ← Border: primary-light
└────────────────┘
   Border glow: suave
```

### **Focus no Input**

```
┌────────────────┐
│ 123            │  ← Border: primary-color
└────────────────┘
   Box-shadow: 0 0 0 3px rgba(139, 38, 53, 0.1)
```

### **Disabled**

```
┌────────────────┐
│ 123            │  ← Background: bg-tertiary
└────────────────┘  ← Cursor: not-allowed
   Opacity: 0.6
```

---

## 🎯 Exemplo Prático

### **Código**

```jsx
<IdFieldWithLookup
    id={idPrestador}
    onIdChange={setIdPrestador}
    getService={prestadorService.obter}
    idLabel="ID PRESTADOR *"
    nameLabel="PRESTADOR"
    placeholder="Código"
/>
```

### **Resultado Renderizado**

```html
<div class="idFieldWithLookup inGrid">
    <div class="idField">
        <label>ID PRESTADOR *</label>
        <input 
            type="number" 
            value="123"
            placeholder="Código"
            class="idInput"
        />
    </div>
    
    <div class="nameDisplay">
        <label>PRESTADOR</label>
        <div class="nameValue">
            <span class="nameText">João Silva</span>
        </div>
    </div>
</div>
```

---

## 📊 Comparativo Visual

### **ANTES (Layout Vertical)**

```
┌─────────────────────────┐
│ ID PRESTADOR *          │
│ ┌─────────────────┐     │
│ │ 123             │     │
│ └─────────────────┘     │
│                         │
│ ← Muito espaço vertical │
│ → 20-30px de gap        │
│                         │
│ PRESTADOR               │
│ ┌─────────────────┐     │
│ │ João Silva      │     │
│ └─────────────────┘     │
└─────────────────────────┘

Altura total: ~120px
```

### **DEPOIS (Layout Horizontal)**

```
┌─────────────────────────────────────┐
│ ID PRESTADOR *    │ PRESTADOR       │
│ ┌───────────┐     │ ┌───────────┐   │
│ │ 123       │     │ │ João      │   │
│ └───────────┘     │ │ Silva     │   │
│                   │ └───────────┘   │
└─────────────────────────────────────┘

Altura total: ~60px
Economia: 50% de espaço vertical
```

---

## ✅ Checklist Visual

- [x] Campos alinhados horizontalmente
- [x] Gap consistente entre campos
- [x] Labels com mesmo estilo
- [x] Inputs com mesma altura
- [x] Borda destacada no nome
- [x] Animação suave ao carregar
- [x] Responsivo em mobile
- [x] Estados de hover/focus claros
- [x] Texto legível e contrastante
- [x] Ícones e botões proporcionais

---

**Última atualização:** Março 2026  
**Versão:** 2.0 (Layout Horizontal)
