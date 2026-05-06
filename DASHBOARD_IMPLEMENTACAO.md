# Dashboard Profissional - Guia de Implementação

## 📋 Resumo

Dashboard empresarial completo transformado com visualização de dados profissional, integração com backend Spring Boot e arquitetura moderna em React.

---

## 🚀 Instalação de Dependências

As seguintes dependências foram instaladas:

```bash
npm install recharts @tanstack/react-query
```

- **recharts**: Biblioteca de gráficos para React
- **@tanstack/react-query**: Gerenciamento de estado e cache para requisições assíncronas

---

## 🏗️ Arquitetura Frontend

### Estrutura de Componentes

```
frontend/src/components/MainPage/
├── Dashboard.jsx (container principal)
└── Dashboard/
    ├── KpiCard.jsx
    ├── KpiCard.module.css
    ├── GraficoEvolucao.jsx
    ├── GraficoEvolucao.module.css
    ├── GraficoPrestadores.jsx
    ├── GraficoPrestadores.module.css
    ├── GraficoStatus.jsx
    ├── GraficoStatus.module.css
    ├── TabelaOrcamentos.jsx
    └── TabelaOrcamentos.module.css
```

### Serviços

```
frontend/src/services/
└── dashboardService.js (atualizado com novos endpoints)
```

---

## 🔌 Integração com Backend

### Endpoints Spring Boot Criados/Atualizados

#### 1. **POST /api/dashboard/resumo**
Retorna KPIs consolidados do dashboard.

**Request Body:**
```json
{
  "dataInicio": "2024-01-01",
  "dataFim": "2024-12-31"
}
```

**Response:**
```json
{
  "totalOrcamentos": 150,
  "valorTotal": 450000.50,
  "ticketMedio": 3000.00,
  "taxaAprovacao": 75.5
}
```

#### 2. **POST /api/dashboard/evolucao**
Retorna dados de evolução temporal para gráfico de linha.

**Response:**
```json
[
  {
    "data": "2024-01-15",
    "valor": 15000.00,
    "quantidade": 5
  },
  {
    "data": "2024-01-16",
    "valor": 22000.00,
    "quantidade": 8
  }
]
```

#### 3. **POST /api/dashboard/prestadores**
Retorna ranking de prestadores por valor total.

**Response:**
```json
[
  {
    "prestadorId": 1,
    "nome": "Empresa ABC Ltda",
    "valorTotal": 85000.00,
    "quantidade": 25
  },
  {
    "prestadorId": 2,
    "nome": "Serviços XYZ",
    "valorTotal": 62000.00,
    "quantidade": 18
  }
]
```

#### 4. **POST /api/dashboard/status**
Retorna distribuição por status (aprovado, pendente, rejeitado).

**Response:**
```json
[
  {
    "status": "APROVADO",
    "quantidade": 100,
    "percentual": 66.67
  },
  {
    "status": "PENDENTE",
    "quantidade": 35,
    "percentual": 23.33
  },
  {
    "status": "REJEITADO",
    "quantidade": 15,
    "percentual": 10.00
  }
]
```

#### 5. **POST /api/dashboard/ultimos?limite=10**
Retorna últimos orçamentos com detalhes.

**Response:**
```json
[
  {
    "orcamentoId": 123,
    "prestador": "Empresa ABC Ltda",
    "valor": 5000.00,
    "status": "APROVADO",
    "data": "15/01/2024"
  }
]
```

---

## 🎨 Componentes Criados

### 1. KpiCard
Componente reutilizável para exibição de indicadores chave.

**Props:**
- `title`: Título do KPI
- `value`: Valor formatado
- `icon`: Ícone (lucide-react)
- `variation`: Variação percentual (opcional)
- `color`: Cor do card (blue, green, purple, orange)

**Exemplo:**
```jsx
<KpiCard
    title="Total de Orçamentos"
    value={150}
    icon={<FileText size={24} />}
    color="blue"
/>
```

### 2. GraficoEvolucao
Gráfico de linha mostrando evolução temporal de orçamentos.

**Props:**
- `data`: Array de dados [{data, valor, quantidade}]
- `loading`: Estado de loading

**Features:**
- Tooltip personalizado
- Formatação automática de datas
- Eixo Y com formatação inteligente (K, M)
- Skeleton loading

### 3. GraficoPrestadores
Gráfico de barras horizontal com ranking de prestadores.

**Props:**
- `data`: Array de dados [{prestadorId, nome, valorTotal, quantidade}]
- `loading`: Estado de loading

**Features:**
- Top 10 prestadores
- Ordenação automática por valor
- Nomes truncados para melhor visualização
- Layout vertical responsivo

### 4. GraficoStatus
Gráfico de pizza mostrando distribuição por status.

**Props:**
- `data`: Array de dados [{status, quantidade, percentual}]
- `loading`: Estado de loading

**Features:**
- Cores semânticas (verde=aprovado, amarelo=pendente, vermelho=rejeitado)
- Legenda interativa
- Percentuais calculados automaticamente

### 5. TabelaOrcamentos
Tabela profissional dos últimos orçamentos.

**Props:**
- `data`: Array de dados [{orcamentoId, prestador, valor, status, data}]
- `loading`: Estado de loading

**Features:**
- Ordenação por coluna (clique no header)
- Badges coloridos por status
- Formatação de moeda brasileira
- Hover effects
- Responsiva

---

## ⚙️ Configuração do React Query

### App.jsx
```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Resto da aplicação */}
    </QueryClientProvider>
  );
}
```

### Uso nos Componentes
```jsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
    queryKey: ['dashboardResumo', filtrosAplicados],
    queryFn: () => dashboardService.obterResumo(filtrosAplicados),
    staleTime: 5 * 60 * 1000,
    retry: 2
});
```

**Benefícios:**
- Cache automático
- Evita múltiplas requisições
- Refetch inteligente
- Loading states gerenciados
- Retry automático em caso de erro

---

## 🎯 Melhorias Implementadas

### 1. KPIs Aprimorados
- ✅ Total de Orçamentos
- ✅ Valor Total
- ✅ Ticket Médio
- ✅ **NOVO:** Taxa de Aprovação (%)

### 2. Gráficos Profissionais
- ✅ Gráfico de Evolução (LineChart)
- ✅ Ranking de Prestadores (BarChart)
- ✅ Distribuição por Status (PieChart)

### 3. Tabela Avançada
- ✅ Ordenação por coluna
- ✅ Badges coloridos por status
- ✅ Layout responsivo
- ✅ Hover effects

### 4. Filtros Globais
- ✅ Data inicial e final
- ✅ Aplicação manual (sem debounce automático)
- ✅ Removido uso de setTimeout

### 5. Loading e UX
- ✅ Loading individual por gráfico
- ✅ Skeleton loading (não trava tela inteira)
- ✅ Estados vazios tratados
- ✅ Mensagens de erro claras

### 6. Estilo Moderno
- ✅ Cards com gradiente e sombras
- ✅ Espaçamento consistente
- ✅ Cores semânticas
- ✅ Transições suaves
- ✅ Totalmente responsivo

---

## 📊 Boas Práticas Aplicadas

### React
- ✅ Componentização (separação de responsabilidades)
- ✅ Hooks personalizados (useCallback, useMemo)
- ✅ Props bem definidas com JSDoc
- ✅ Código limpo e comentado

### Performance
- ✅ React Query para cache
- ✅ useMemo para cálculos pesados
- ✅ useCallback para funções estáveis
- ✅ Evitar re-renders desnecessários

### CSS
- ✅ CSS Modules (escopo local)
- ✅ Variáveis CSS consistentes
- ✅ Design responsivo
- ✅ Animações suaves

---

## 🔧 Backend - Alterações Realizadas

### Arquivos Modificados

1. **OrcamentoRepository.java**
   - Adicionadas queries para evolução, prestadores, status e últimos orçamentos

2. **DashboardService.java**
   - Novos métodos: getEvolucao(), getPrestadores(), getStatus(), getUltimosOrcamentos()
   - Cálculo de taxa de aprovação

3. **DashboardDTO.java**
   - Adicionado campo `taxaAprovacao`

4. **DashboardController.java**
   - Novos endpoints: /resumo, /evolucao, /prestadores, /status, /ultimos

### Queries SQL Adicionadas

Todas as queries usam native SQL para PostgreSQL com:
- DATE_TRUNC para agrupamento temporal
- COALESCE para tratar valores nulos
- JOINs eficientes
- Ordenação e limitação apropriadas

---

## 🚦 Como Executar

### 1. Backend (Spring Boot)
```bash
cd PROJETO_PAGAMENTOS
./mvnw spring-boot:run
```

### 2. Frontend (React)
```bash
cd frontend
npm run dev
```

### 3. Acessar
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

---

## 📝 Exemplos de Uso

### Filtrar por Período
```javascript
// No Dashboard, preencha os campos de data e clique em "Aplicar Filtros"
const filtros = {
    dataInicio: '2024-01-01',
    dataFim: '2024-12-31'
};
```

### Reutilizar Componentes
```jsx
// Em qualquer lugar da aplicação
import KpiCard from './components/MainPage/Dashboard/KpiCard';
import { DollarSign } from 'lucide-react';

<KpiCard
    title="Receita do Mês"
    value="R$ 50.000,00"
    icon={<DollarSign size={24} />}
    color="green"
/>
```

---

## 🐛 Troubleshooting

### Problema: Gráficos não aparecem
**Solução:** Verifique se o backend está retornando dados corretamente via DevTools > Network

### Problema: Loading infinito
**Solução:** Verifique console por erros de CORS ou autenticação

### Problema: Dados desatualizados
**Solução:** React Query faz cache por 5 minutos. Para forçar refresh, recarregue a página.

---

## 📈 Próximos Passos (Opcional)

1. **Exportar dados para Excel/PDF**
2. **Adicionar mais filtros (empresa, prestador)**
3. **Gráficos comparativos (mês anterior)**
4. **Notificações em tempo real**
5. **Dark mode**

---

## ✅ Checklist Final

- [x] Instalar dependências (recharts, react-query)
- [x] Criar componentes modulares
- [x] Implementar serviços de API
- [x] Configurar React Query
- [x] Criar endpoints backend
- [x] Estilizar com CSS Modules
- [x] Testar integração
- [x] Documentar implementação
- [x] Código pronto para produção

---

## 👨‍💻 Autor

Implementado seguindo melhores práticas de desenvolvimento frontend moderno com React, focando em:
- Performance
- Manutenibilidade
- Escalabilidade
- Experiência do usuário

**Data:** Maio 2026  
**Versão:** 1.0.0
