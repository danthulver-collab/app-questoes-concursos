# 📚 DOCUMENTAÇÃO - PADRÃO QCONCURSOS

## 🎯 Visão Geral

O sistema foi atualizado para seguir rigorosamente o padrão técnico e estrutural do QConcursos. Todas as questões agora são compatíveis com sistemas de banco de questões e parsers automáticos.

---

## 📋 Estrutura Fixa das Questões

Toda questão segue obrigatoriamente a estrutura:

```
ENUNCIADO → ALTERNATIVAS → GABARITO → COMENTÁRIO
```

### Campos Separados

| Campo | Limite Recomendado | Descrição |
|-------|-------------------|-----------|
| **Enunciado** | ~900 caracteres | Objetivo, técnico, impessoal |
| **Alternativas** | 4 opções (A-D) | Extensão similar, linguagem técnica |
| **Gabarito** | Apenas letra | Sem explicações |
| **Comentário** | ~1200 caracteres | Texto corrido, técnico, analítico |
| **Contexto** | Sem limite | Textos de lei, jurisprudência, casos |

---

## 🔤 Tipos de Questão Suportados

### 1. Múltipla Escolha (Padrão)
```
Assinale a alternativa correta:

A) Alternativa A
B) Alternativa B
C) Alternativa C
D) Alternativa D

Gabarito: A

Comentário: Explicação técnica...
```

### 2. Certo ou Errado (CESPE/CEBRASPE)
```
Julgue o item a seguir.

O princípio da legalidade estabelece que a administração pública só pode fazer o que a lei autoriza.

Gabarito: CERTO

Comentário: A assertiva está correta porque...
```

### 3. Verdadeiro/Falso com Assertivas
```
Analise as assertivas e marque a sequência correta:

I. Primeira afirmativa...
II. Segunda afirmativa...
III. Terceira afirmativa...

A) V-V-F
B) V-F-V
C) F-V-V
D) F-F-V

Gabarito: B

Comentário: A sequência correta é V-F-V porque...
```

**⚠️ IMPORTANTE:** Nas questões V/F, NÃO usar marcações `( ) V ou F` no corpo do texto. O julgamento deve aparecer APENAS nas alternativas.

### 4. Assertivas Numeradas
```
Considerando o tema X, analise as afirmativas:

I. Primeira afirmativa...
II. Segunda afirmativa...
III. Terceira afirmativa...

Está correto o que se afirma em:

A) I e II, apenas
B) II e III, apenas
C) I e III, apenas
D) I, II e III

Gabarito: C

Comentário: As afirmativas I e III estão corretas porque...
```

### 5. Julgamento de Itens
```
Julgue os itens a seguir:

I. Primeiro item a ser julgado...
II. Segundo item a ser julgado...

A quantidade de itens corretos é:

A) 0
B) 1
C) 2
D) Todos estão incorretos

Gabarito: B

Comentário: Apenas o item I está correto porque...
```

---

## ⛔ Regras de Qualidade

### Proibições no Enunciado e Alternativas

| ❌ Proibido | ✅ Alternativa |
|------------|---------------|
| "sempre" | "em regra", "geralmente" |
| "nunca" | "raramente", "em exceção" |
| "apenas" | "principalmente", "em especial" |
| "somente" | "preferencialmente" |
| "exclusivamente" | "de modo geral" |
| "todo" | "a maioria", "em geral" |
| "nenhum" | "poucos", "raramente" |

### Regras do Comentário

1. ✅ Texto corrido, técnico e analítico
2. ✅ Explica o fundamento da alternativa correta
3. ✅ Esclarece indiretamente o erro das demais
4. ❌ NÃO pode conter letras de alternativas (A, B, C, D)
5. ❌ NÃO pode repetir trechos do enunciado
6. ❌ NÃO é numerado

---

## 🛠️ Arquivos Criados/Modificados

### Novos Arquivos

1. **`ATUALIZAR-SISTEMA-QUESTOES-QCONCURSOS.sql`**
   - SQL para atualizar tabelas no Supabase
   - Aumenta limites de campos
   - Adiciona colunas para tipos de questão

2. **`src/web/lib/parser-questoes-qconcursos.ts`**
   - Parser universal padrão QConcursos
   - Detecta tipo automaticamente
   - Valida qualidade das questões
   - Formata para exportação

3. **`src/web/components/importar-questoes-qconcursos.tsx`**
   - Componente de importação atualizado
   - Suporta todos os tipos de questão
   - Preview antes de importar
   - Validação em tempo real

### Arquivos Modificados

4. **`src/web/pages/elaborar-pacote.tsx`**
   - Usa novo componente de importação

---

## 💾 Como Executar o SQL

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo de `ATUALIZAR-SISTEMA-QUESTOES-QCONCURSOS.sql`
4. Execute
5. Verifique se os campos foram atualizados

---

## 📥 Como Importar Questões

### Passo a Passo

1. Acesse a página de elaboração do pacote
2. Clique em **"📥 Importar Questões"**
3. Configure os metadados (matéria, banca, ano, etc.)
4. Cole as questões no formato correto
5. Clique em **"👁️ Preview & Validar"**
6. Revise os avisos de validação
7. Clique em **"✅ Importar"**

### Formato de Entrada

```
1. Enunciado da primeira questão...

A) Alternativa A
B) Alternativa B
C) Alternativa C
D) Alternativa D

Gabarito: A

Comentário: Explicação da resposta correta...

2. Enunciado da segunda questão...

A) Alternativa A
B) Alternativa B
C) Alternativa C
D) Alternativa D

Gabarito: C

Comentário: Explicação da resposta correta...
```

---

## 🔍 Validações Automáticas

O sistema valida automaticamente:

| Validação | Resultado |
|-----------|-----------|
| Enunciado muito curto | ❌ Erro |
| Enunciado > 900 chars | ⚠️ Aviso |
| Menos de 4 alternativas | ❌ Erro |
| Alternativas desiguais | ⚠️ Aviso |
| Termos absolutos | ⚠️ Aviso |
| Comentário ausente | ⚠️ Aviso |
| Comentário > 1200 chars | ⚠️ Aviso |
| Gabarito inválido | ❌ Erro |

---

## 🎯 Princípios do QConcursos

> O QConcursos não é especial pelo código, mas porque:
> 
> 1. **Limita tamanho de campos** - Força objetividade
> 2. **Separa rigidamente campos** - Pergunta ≠ Alternativas ≠ Comentário
> 3. **Nunca mistura conteúdo** - Cada campo é independente
> 4. **Obriga resposta única** - Uma e apenas uma alternativa correta

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verifique se o SQL foi executado corretamente
2. Confira o formato das questões
3. Revise os avisos de validação
4. Consulte esta documentação

---

**Versão:** 2.0 - Padrão QConcursos  
**Data:** Janeiro/2026
