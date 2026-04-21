<div align="center">
<img width="2048" height="2048" alt="inkslogo" src="https://github.com/user-attachments/assets/86a4dfd3-c147-4495-8a87-9b775d6751a3" />
</div>

# Inks Blockchain

A **Inks Blockchain** é uma blockchain independente e funcional construída do zero em Go, fortemente inspirada nos princípios do Ethereum. Ela opera como uma rede descentralizada P2P, utilizando o algoritmo de consenso Proof-of-Work (PoW) para validação e segurança da rede.

## 🚀 Principais Funcionalidades

### Rede e Consenso
* **Proof-of-Work (PoW):** Utiliza mineração competitiva com ajuste dinâmico de dificuldade para manter um tempo de bloco alvo de 15 segundos.
* **Rede P2P:** Arquitetura Peer-to-Peer que permite descoberta de nós, sincronização automática e comunicação direta entre participantes.
* **Resolução de Forks (Hard Reorg):** Mecanismo robusto para resolver bifurcações na rede. Se um nó detecta uma cadeia mais longa e válida, ele descarta a cadeia local curta e adota a nova, reconstruindo o estado para manter a consistência.
* **Handshake de Conexão:** Validação rigorosa durante a conexão entre nós, verificando se o `ChainID` e o `GenesisHash` são idênticos para garantir que pertencem à mesma rede.

### Contas e Transações
* **Moeda Nativa (INKS):** Opera com uma moeda própria com suporte a 18 casas decimais para representar frações com precisão.
* **Modelo de Estado (StateDB):** Gerenciamento eficiente de saldos e Nonces por endereço, protegendo contra ataques de repetição (replay attacks).
* **Mecanismo de Gás:** Implementação de `GasLimit` e `GasPrice` para taxar transações, prevenir spam e recompensar os mineradores.
* **Assinaturas Digitais:** Todas as transações são protegidas por criptografia ECDSA, garantindo que apenas o proprietário da chave privada possa movimentar fundos.

### Gerenciamento de Carteira (Wallet)
* **Padrão Mnemônico (BIP39):** Geração de carteiras a partir de uma frase de recuperação de 12 palavras.
* **Endereçamento:** Formato compatível com o padrão Ethereum (prefixo `0x` seguido por 40 caracteres hexadecimais).
* **Persistência:** Armazenamento seguro das chaves e metadados no banco de dados local (`inks.db`).

## 📁 Estrutura do Projeto

```text
inks-blockchain/
├── cmd/
│   └── inks/           # Ponto de entrada (main.go)
├── internal/
│   ├── blockchain/     # Lógica de blocos, transações e consenso
│   ├── network/        # Protocolo P2P e servidor de rede
│   ├── wallet/         # Gerenciamento de chaves e mnemônicos
│   └── cli/            # Comandos e interface de usuário
├── pkg/
│   ├── db/             # Camada de persistência (BoltDB)
│   └── utils/          # Funções auxiliares e utilitários
├── go.mod              # Definição de módulos Go
└── go.sum              # Checksums de dependências

🛠️ Compilação
Para gerar o executável inks.exe, você deve ter o Go instalado em seu sistema:

# Baixar dependências
go mod tidy

# Compilar o binário
go build -o inks.exe ./cmd/inks
Para uma versão otimizada e reduzida:
// Ferramenta Interna.
go build -ldflags="-s -w" -o inks.exe ./cmd/inks

💻 Comandos Principais (CLI)
O programa pode ser utilizado via comandos diretos ou em modo interativo (REPL).

## Gestão do Nó
inks.exe init: Inicializa o diretório de dados, cria a carteira padrão e o genesis.json.
inks.exe start: Inicia o nó e conecta-se aos pares conhecidos.
inks.exe start --mine: Inicia o nó e ativa a mineração competitiva.
inks.exe status: Mostra o estado atual da sincronização e altura da cadeia.

## Gestão de Carteiras
inks.exe wallet create --name <nome>: Cria uma nova carteira.
inks.exe wallet balance: Consulta o saldo da carteira ativa.
inks.exe wallet list: Lista todas as carteiras locais.
inks.exe wallet import --seed "<frase>": Restaura uma carteira existente.

## Operações de Rede
inks.exe tx send --to <endereço> --amount <valor>: Envia INKS para outro usuário.
inks.exe mine: Minera um único bloco manualmente (útil para testes).
inks.exe peers: Lista os nós conectados no momento.

🧪 Teste de Sincronização (Multi-Node)
Para testar a rede P2P em uma única máquina, utilize diretórios de dados e portas diferentes:

Nó 1 (Líder):
inks.exe --datadir ./data1 --port 8081 init
inks.exe --datadir ./data1 --port 8081 start --mine

Nó 2 (Seguidor/Competidor):
inks.exe --datadir ./data2 --port 8082 init
inks.exe --datadir ./data2 --port 8082 start --mine --connect 127.0.0.1:8081
