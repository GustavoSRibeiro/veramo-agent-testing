# 🎓 Sistema de Restaurante Universitário — UNIFESP

Sistema descentralizado de credenciamento e gerenciamento de créditos para o Restaurante Universitário (RU) da UNIFESP, utilizando **Identidade Descentralizada (DID)**, **Credenciais Verificáveis (VC/VP)** e **Smart Contracts** em blockchain.

## 📋 Visão Geral

O sistema implementa um fluxo completo de identidade auto-soberana (SSI) para controle de acesso ao RU:

1. A **UNIFESP** (Issuer) cadastra alunos e emite credenciais verificáveis
2. O **Aluno** (Holder) apresenta sua credencial via QR Code para acessar o RU
3. O **Terminal RU** (Verifier) verifica a credencial e debita um crédito na blockchain

```
┌──────────────────┐     Emite VC      ┌──────────────────┐
│  Portal UNIFESP  │ ────────────────► │  Carteira Aluno  │
│    (Issuer)      │                   │    (Holder)      │
│   porta 3000     │                   │   porta 3001     │
└──────────────────┘                   └────────┬─────────┘
        │                                       │
        │ Adiciona créditos                     │ Apresenta QR Code
        ▼                                       ▼
┌──────────────────┐     Verifica VP    ┌──────────────────┐
│   Blockchain     │ ◄──────────────── │  Terminal RU     │
│   (Hardhat)      │   Debita crédito  │   (Verifier)     │
│   porta 8545     │                   │   porta 3002     │
└──────────────────┘                   └──────────────────┘
```

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| [Veramo](https://veramo.io/) | Framework para DIDs e Credenciais Verificáveis (W3C) |
| [Hardhat](https://hardhat.org/) | Ambiente de desenvolvimento Ethereum / blockchain local |
| [Solidity](https://soliditylang.org/) | Smart contracts para créditos do RU |
| [Express](https://expressjs.com/) | Servidores web para os 3 agentes |
| [ethers.js](https://docs.ethers.org/) | Interação com smart contracts |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Banco de dados SQLite para dados dos alunos |
| [TypeScript](https://www.typescriptlang.org/) | Linguagem principal |
| [ngrok](https://ngrok.com/) | Túnel para acesso externo ao Terminal RU |

## 📁 Estrutura do Projeto

```
veramo-agent-testing/
├── src/
│   ├── issuer-agent/           # Agente Emissor (UNIFESP)
│   │   ├── server.ts           # Portal web da UNIFESP
│   │   ├── revoke.ts           # Script de revogação (futuro)
│   │   ├── check-revoked.ts    # Verificação de revogação (futuro)
│   │   └── veramo/setup.ts     # Configuração do agente Veramo
│   ├── holder-agent/           # Agente Portador (Aluno)
│   │   ├── server.ts           # Carteira digital do aluno
│   │   └── veramo/setup.ts     # Configuração do agente Veramo
│   ├── verifier/               # Agente Verificador (Terminal RU)
│   │   ├── server.ts           # Terminal de leitura de QR Code
│   │   └── veramo/setup.ts     # Configuração do agente Veramo
│   ├── veramo/
│   │   ├── createAgent.ts      # Fábrica de agentes Veramo
│   │   └── createIdentifier.ts # Utilitário para criar DIDs
│   ├── database.ts             # Módulo de banco de dados SQLite
│   └── utils.ts                # Utilitários (IP local, endereço do contrato, ngrok)
├── hardhat/
│   ├── contracts/
│   │   ├── CreditoRU.sol       # Smart contract de créditos do RU
│   │   └── RevocationRegistry.sol  # Registro de revogação (futuro)
│   ├── ignition/
│   │   ├── modules/
│   │   │   ├── CreditoRU.ts    # Módulo de deploy do CreditoRU
│   │   │   └── RevocationRegistry.ts  # Módulo de deploy da revogação
│   │   └── parameters.json     # Parâmetros de deploy
│   ├── scripts/
│   │   └── deploy-credito-ru.ts  # Script alternativo de deploy
│   ├── fund-issuer.ts          # Script para financiar o DID do issuer
│   └── hardhat.config.ts       # Configuração do Hardhat
├── credentials/
│   └── contract-address.json   # Endereço do contrato deployado
├── .env                        # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

## ⚙️ Pré-requisitos

- **Node.js** v18 ou superior
- **npm** (incluído com Node.js)
- **ngrok** (opcional, para acesso externo ao Terminal RU via celular)

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositório>
cd veramo-agent-testing
```

### 2. Instalar dependências

```bash
# Dependências do projeto principal
npm install

# Dependências do Hardhat
cd hardhat
npm install
cd ..
```

### 3. Configurar o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
# Rede Sepolia (para resolver DIDs na testnet)
RPC_URL=https://sepolia.infura.io/v3/<SUA_API_KEY>

# Chaves de criptografia dos agentes Veramo (gerar com: openssl rand -hex 32)
ISSUER_KMS_SECRET_KEY=<chave-hex-64-caracteres>
HOLDER_KMS_SECRET_KEY=<chave-hex-64-caracteres>

# Rede local Hardhat
HARDHAT_RPC_URL=http://127.0.0.1:8545

# Chaves Hardhat (contas de teste pré-financiadas — NÃO usar em produção)
UNIFESP_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RU_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

# Portas dos servidores
PORT_UNIFESP=3000
PORT_HOLDER=3001
PORT_RU=3002
```

### 4. Criar o DID do Issuer (primeira execução)

Na primeira vez que o sistema é executado, é necessário criar o DID da UNIFESP:

```bash
npx tsx src/veramo/createIdentifier.ts
```

> **Nota:** O DID é persistido no banco SQLite do Veramo (`database-issuer.sqlite`). Só é necessário executar este passo uma vez.

## 🏃 Executando o Sistema

### Execução Automatizada (Windows)

Execute o script `iniciar.bat` que sobe todos os serviços automaticamente:

```bash
iniciar.bat
```

### Execução Manual (passo a passo)

#### 1. Iniciar a blockchain local (Hardhat)

```bash
cd hardhat
npx hardhat node
```

#### 2. Deploy do smart contract (em outro terminal)

```bash
cd hardhat
npx hardhat ignition deploy ignition/modules/CreditoRU.ts --network localhost --parameters ignition/parameters.json
```

#### 3. Iniciar os servidores (cada um em um terminal separado)

```bash
# Portal UNIFESP (Issuer) — porta 3000
npx tsx src/issuer-agent/server.ts

# Carteira do Aluno (Holder) — porta 3001
npx tsx src/holder-agent/server.ts

# Terminal RU (Verifier) — porta 3002
npx tsx src/verifier/server.ts
```

#### 4. (Opcional) Iniciar ngrok para acesso externo

```bash
ngrok http 3002
```

## 📱 Fluxo de Uso

### 1. Cadastrar Aluno (Portal UNIFESP)

1. Acesse `http://localhost:3000`
2. Preencha: Nome, RA, Curso e Senha
3. Clique em **"Cadastrar e Emitir Credencial"**
4. O sistema automaticamente:
   - Cria um DID para o aluno (Veramo)
   - Emite uma Credencial Verificável (VC) assinada pela UNIFESP
   - Salva os dados no banco de dados SQLite

### 2. Adicionar Créditos (Portal UNIFESP)

1. Acesse `http://localhost:3000/creditos`
2. Selecione o aluno e a quantidade de créditos
3. Clique em **"Adicionar Créditos"**
4. Os créditos são registrados na blockchain (smart contract)

### 3. Acessar Carteira (Aluno)

1. O aluno acessa o link gerado no portal (ex: `http://<IP>:3001/aluno/<RA>`)
2. Digita sua senha
3. O sistema gera um QR Code com uma **Verifiable Presentation (VP)** assinada
4. O QR Code é válido por **2 minutos** e de **uso único**

### 4. Consumir Crédito (Terminal RU)

1. O atendente do RU acessa `http://localhost:3002` (ou via ngrok no celular)
2. Aponta a câmera para o QR Code do aluno
3. O sistema:
   - Busca a VP através da URL contida no QR Code
   - Verifica a assinatura criptográfica (Veramo)
   - Consulta o saldo na blockchain
   - Debita 1 crédito do aluno
4. Exibe o resultado: ✅ Acesso Liberado ou ❌ Acesso Negado

## 🔐 Segurança

- **Senhas** são armazenadas com hash bcrypt (10 rounds)
- **Sessões** são protegidas por cookies HTTP-only com expiração de 10 minutos
- **QR Codes** são de uso único e expiram em 2 minutos
- **Credenciais** são assinadas criptograficamente via JWT (ES256K)
- **Smart Contract** restringe operações a endereços autorizados

## 🔗 Smart Contract — CreditoRU

O contrato `CreditoRU.sol` gerencia os créditos dos alunos na blockchain:

| Função | Descrição |
|---|---|
| `adicionarCreditos(ra, quantidade)` | Adiciona créditos ao RA do aluno |
| `consultarSaldo(ra)` | Consulta o saldo de créditos |
| `consumirCredito(ra)` | Debita 1 crédito e registra o consumo |
| `definirAutorizado(conta, bool)` | Autoriza/desautoriza uma conta |

## 🔮 Funcionalidades Futuras

- **Revogação de Credenciais** — Registro on-chain para revogar credenciais de alunos desligados (`RevocationRegistry.sol` já implementado)

## 📚 Conceitos e Padrões

- **DID (Decentralized Identifier):** Identificador descentralizado conforme especificação W3C, usando o método `did:ethr` na rede Sepolia
- **VC (Verifiable Credential):** Credencial verificável assinada digitalmente pela UNIFESP, contendo RA, nome, curso e status de matrícula
- **VP (Verifiable Presentation):** Apresentação verificável gerada pelo aluno para provar sua identidade ao Terminal RU
- **SSI (Self-Sovereign Identity):** O aluno é o portador de sua credencial e controla quando e para quem apresentá-la
