# 🏥 Sistema de Férias GEPP · SES-DF

Sistema web para controle e gestão de férias da equipe da **Gerência de Pesquisa de Preços (GEPP)** da Secretaria de Estado de Saúde do Distrito Federal.

---

## 📋 Funcionalidades

| Página | Descrição |
|--------|-----------|
| **Dashboard** | Visão geral com métricas (equipe em férias hoje, capacidade operacional, próximas férias, aprovações pendentes) e tabela de status |
| **Calendário** | Calendário dinâmico 12 meses estilo Google Calendar, com chips de nomes nos dias, sidebar de aprovados por mês e exportação PDF |
| **Pedir Férias** | Formulário para servidores solicitarem férias com seleção de nome, período, parcela e justificativa |
| **Aprovações** | Área restrita da gerente (senha protegida) com análise de conflitos automática e parecer por solicitação |
| **Equipe** | Quadro de lotação com cargo, carga horária, prioridade de seniority e tags de categorias de pesquisa |

## ⚙️ Regras implementadas

- ✅ Máximo de **3 servidores simultâneos** em férias (1/3 da lotação)
- ✅ Alerta automático de **categorias sem cobertura** ao aprovar
- ✅ **Prioridade por seniority + filhos** exibida no painel de aprovação
- ✅ Férias **parceladas** (integral, 1ª parcela, 2ª parcela, avulsa)
- ✅ Dados persistidos via **localStorage** (nenhum servidor necessário)
- ✅ Senha de acesso à área de aprovação: `gepp2026`

---

## 🚀 Publicar no GitHub Pages (passo a passo)

### 1. Criar o repositório

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"** (botão verde ou `+`)
3. Nome sugerido: `ferias-gepp`
4. Deixe como **Public**
5. **Não** marque "Add README" (já existe um)
6. Clique em **"Create repository"**

### 2. Fazer upload dos arquivos

**Opção A – Pelo navegador (mais fácil):**

1. No repositório recém-criado, clique em **"uploading an existing file"**
2. Arraste **todos** os arquivos e pastas do projeto:
   ```
   index.html
   calendario.html
   pedido.html
   aprovacao.html
   equipe.html
   css/
     style.css
   js/
     data.js
     app.js
   README.md
   ```
3. Escreva uma mensagem de commit (ex.: `Primeiro commit`)
4. Clique em **"Commit changes"**

**Opção B – Via Git (terminal):**

```bash
cd ferias-gepp
git init
git add .
git commit -m "Sistema de Férias GEPP v2.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ferias-gepp.git
git push -u origin main
```

### 3. Ativar o GitHub Pages

1. No repositório, clique em **Settings** (engrenagem)
2. No menu lateral esquerdo, clique em **Pages**
3. Em **"Source"**, selecione **"Deploy from a branch"**
4. Branch: **`main`** · Pasta: **`/ (root)`**
5. Clique em **Save**
6. Aguarde ~1 minuto

### 4. Acessar o site

O site estará disponível em:
```
https://SEU_USUARIO.github.io/ferias-gepp/
```

> Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub.

---

## 🔐 Acesso à área de aprovação

- Navegue até **"Acesso Restrito"** na sidebar
- Senha padrão: **`gepp2026`**
- Para alterar a senha, edite a variável `SENHA_GERENCIA` em `js/data.js`

## 💾 Persistência de dados

Os dados são salvos automaticamente no **localStorage** do navegador. Isso significa:
- ✅ Os dados persistem entre sessões no mesmo navegador
- ⚠️ Dados diferentes por dispositivo/navegador (sem servidor central)
- Para um banco de dados compartilhado, seria necessário integrar um backend (Firebase, Supabase, etc.)

---

## 🏗️ Estrutura de arquivos

```
ferias-gepp/
├── index.html          # Dashboard principal
├── calendario.html     # Calendário 12 meses
├── pedido.html         # Formulário de solicitação
├── aprovacao.html      # Painel de aprovação (restrito)
├── equipe.html         # Quadro de lotação
├── css/
│   └── style.css       # Estilos (sidebar azul, cards, calendário)
├── js/
│   ├── data.js         # Dados da equipe + localStorage
│   └── app.js          # Lógica de renderização de cada página
└── README.md
```

---

*Sistema de Férias v2.0 · GEPP / SUCOMP / SES-DF*
