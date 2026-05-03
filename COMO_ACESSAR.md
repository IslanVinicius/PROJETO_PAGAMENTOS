# 🚀 Como Acessar a Aplicação

## ⚠️ PROBLEMA RESOLVIDO

O erro `No static resource for request '/'` ocorria porque o Spring Boot não encontrava os arquivos do frontend React.

---

## ✅ SOLUÇÃO IMPLEMENTADA

### **Opção 1: Desenvolvimento (RECOMENDADO)**

Execute frontend e backend separadamente:

#### Backend (Porta 8080):
```powershell
.\mvnw.cmd spring-boot:run
```

#### Frontend (Porta 5173):
```powershell
cd frontend
npm run dev
```

**Acesse:** http://localhost:5173

---

### **Opção 2: Produção (Tudo na Porta 8080)**

Se quiser acessar tudo pela porta 8080:

#### Passo 1: Deploy do Frontend no Backend
```powershell
.\deploy-frontend.ps1
```

#### Passo 2: Reiniciar o Backend
```powershell
.\mvnw.cmd spring-boot:run
```

**Acesse:** http://localhost:8080

---

## 📁 Arquivos Criados

1. **`WebConfig.java`** - Configura o Spring para servir arquivos estáticos do React
2. **`deploy-frontend.ps1`** - Script automático para build e deploy do frontend
3. **`src/main/resources/static/`** - Pasta onde ficam os arquivos buildados do React

---

## 🔧 Estrutura de URLs

### Desenvolvimento (separado):
- Frontend: http://localhost:5173
- API Backend: http://localhost:8080/api/...

### Produção (integrado):
- Frontend: http://localhost:8080
- API Backend: http://localhost:8080/api/...

---

## 💡 Dicas

- Para **desenvolvimento**, use a Opção 1 (hot reload do Vite)
- Para **produção/testes**, use a Opção 2 (tudo integrado)
- Sempre execute `.\deploy-frontend.ps1` após modificar o frontend se estiver usando a Opção 2
