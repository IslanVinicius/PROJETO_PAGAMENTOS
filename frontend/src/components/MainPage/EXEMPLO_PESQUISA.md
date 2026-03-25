# Exemplo de Implementação da Pesquisa Genérica

Este documento mostra como implementar a barra de pesquisa genérica em qualquer formulário.

## Passo 1: Importar os componentes e hook

```jsx
import { BarraPesquisa, ResultadosPesquisa } from '../common';
import { usePesquisa } from '../../hooks/usePesquisa';
```

## Passo 2: Configurar os campos de pesquisa

```jsx
function SeuFormulario() {
    const [dados, setDados] = useState([]);
    
    // Defina quais campos podem ser pesquisados
    const camposPesquisa = [
        { campo: 'nome', label: 'Nome' },
        { campo: 'email', label: 'E-mail' },
        { campo: 'cpf', label: 'CPF' },
        { campo: 'id', label: 'ID' }
    ];
```

## Passo 3: Usar o hook de pesquisa

```jsx
    const {
        termoPesquisa,
        setTermoPesquisa,
        campoSelecionado,
        setCampoSelecionado,
        resultados,
        mostrarResultados,
        handlePesquisar,
        handleLimparPesquisa,
        handleSelecionarResultado
    } = usePesquisa(dados, camposPesquisa);
```

## Passo 4: Adicionar os componentes no JSX

```jsx
    return (
        <div className={styles.container}>
            {/* Barra de Pesquisa */}
            <BarraPesquisa
                termo={termoPesquisa}
                onTermoChange={setTermoPesquisa}
                campoSelecionado={campoSelecionado}
                onCampoChange={setCampoSelecionado}
                campos={camposPesquisa}
                onPesquisar={handlePesquisar}
                onLimpar={handleLimparPesquisa}
                desabilitado={loading || modo !== 'visualizacao'}
            />

            {/* Resultados da Pesquisa */}
            <ResultadosPesquisa
                resultados={resultados}
                mostrar={mostrarResultados && modo === 'visualizacao'}
                onSelecionar={(item) => {
                    const index = dados.findIndex(d => d.id === item.id);
                    selecionarItem(item, index);
                    handleSelecionarResultado(item);
                }}
                colunas={[
                    { campo: 'id', label: 'ID' },
                    { campo: 'nome', label: 'Nome' },
                    { campo: 'email', label: 'E-mail' },
                    { campo: 'dataCadastro', label: 'Data', format: 'data' },
                    { campo: 'valor', label: 'Valor', format: 'moeda' }
                ]}
            />
            
            {/* Resto do formulário... */}
        </div>
    );
}
```

## Configurações de Colunas

As colunas do ResultadosPesquisa suportam formatação automática:

- **Sem format**: exibe o valor como está
- **format: 'data'**: formata como data brasileira (DD/MM/AAAA)
- **format: 'moeda'**: formata como valor monetário (R$)

## Exemplo Completo - EmpresaCadastro

```jsx
import React, { useState, useEffect } from 'react';
import { BarraPesquisa, ResultadosPesquisa } from '../common';
import { usePesquisa } from '../../hooks/usePesquisa';
import styles from './EmpresaCadastro-novo.module.css';

function EmpresaCadastro() {
    const [empresas, setEmpresas] = useState([]);
    const [modo, setModo] = useState('visualizacao');
    const [loading, setLoading] = useState(false);
    
    // Campos disponíveis para pesquisa
    const camposPesquisa = [
        { campo: 'nome', label: 'Nome Fantasia' },
        { campo: 'razao', label: 'Razão Social' },
        { campo: 'cnpj', label: 'CNPJ' },
        { campo: 'id', label: 'ID' }
    ];
    
    // Hook de pesquisa
    const {
        termoPesquisa,
        setTermoPesquisa,
        campoSelecionado,
        setCampoSelecionado,
        resultados,
        mostrarResultados,
        handlePesquisar,
        handleLimparPesquisa,
        handleSelecionarResultado
    } = usePesquisa(empresas, camposPesquisa);
    
    // ... resto do código
    
    return (
        <div className={styles.container}>
            <BarraPesquisa
                termo={termoPesquisa}
                onTermoChange={setTermoPesquisa}
                campoSelecionado={campoSelecionado}
                onCampoChange={setCampoSelecionado}
                campos={camposPesquisa}
                onPesquisar={handlePesquisar}
                onLimpar={handleLimparPesquisa}
                desabilitado={loading || modo !== 'visualizacao'}
            />
            
            <ResultadosPesquisa
                resultados={resultados}
                mostrar={mostrarResultados && modo === 'visualizacao'}
                onSelecionar={(empresa) => {
                    const index = empresas.findIndex(e => e.id === empresa.id);
                    selecionarEmpresa(empresa, index);
                    handleSelecionarResultado(empresa);
                }}
                colunas={[
                    { campo: 'id', label: 'ID' },
                    { campo: 'nome', label: 'Nome' },
                    { campo: 'cnpj', label: 'CNPJ' },
                    { campo: 'razao', label: 'Razão Social' }
                ]}
            />
            
            {/* Formulário */}
        </div>
    );
}
```

## Benefícios

1. **Consistência**: Todos os formulários têm a mesma interface de pesquisa
2. **Flexibilidade**: O usuário escolhe por qual campo pesquisar
3. **Reutilização**: Código não duplicado entre formulários
4. **Manutenção**: Alterações centralizadas nos componentes comuns
