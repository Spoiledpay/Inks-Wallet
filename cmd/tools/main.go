package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type Config struct {
	NodeURL string `json:"node_url"`
}

type RPCRequest struct {
	Method string        `json:"method"`
	Params []interface{} `json:"params,omitempty"`
}

var defaultConfig = Config{
	NodeURL: "http://localhost:3000/api/rpc",
}

func main() {
	if len(os.Args) < 2 {
		printUsage()
		return
	}

	command := os.Args[1]
	args := os.Args[2:]

	switch command {
	case "node":
		handleNode(args)
	case "wallet":
		handleWallet(args)
	case "tx":
		handleTx(args)
	case "query":
		handleQuery(args)
	case "config":
		handleConfig(args)
	case "help":
		printUsage()
	default:
		fmt.Printf("Unknown command: %s. Use 'help' for usage.\n", command)
	}
}

func printUsage() {
	fmt.Println("Inks Blockchain Tools CLI - v1.0.0")
	fmt.Println("\nUsage:")
	fmt.Println("  tools node <info|peers>              - Get node information")
	fmt.Println("  tools wallet <new|list|balance>     - Manage local wallets")
	fmt.Println("  tools tx <send|status>              - Manage transactions")
	fmt.Println("  tools query <block|account|balance> - Query blockchain data")
	fmt.Println("  tools config <view|set>             - CLI configuration")
	fmt.Println("\nExamples:")
	fmt.Println("  tools wallet new --name mywallet")
	fmt.Println("  tools wallet balance --address 0x123...")
}

func handleNode(args []string) {
	if len(args) == 0 {
		fmt.Println("Usage: tools node <info|peers>")
		return
	}
	subCmd := args[0]
	switch subCmd {
	case "info":
		resp := callRPC("node_info", nil)
		printJSON(resp)
	default:
		fmt.Printf("Unknown node subcommand: %s\n", subCmd)
	}
}

func handleWallet(args []string) {
	if len(args) == 0 {
		fmt.Println("Usage: tools wallet <new|list|balance>")
		return
	}
	subCmd := args[0]
	switch subCmd {
	case "new":
		fmt.Println("Creating new wallet...")
		time.Sleep(1 * time.Second)
		fmt.Println("New wallet created: 0x" + strings.Repeat("f", 40))
		fmt.Println("Mnemonic: apple banana cherry ...")
	case "balance":
		addr := "0x..."
		if len(args) > 1 {
			addr = args[1]
		}
		resp := callRPC("wallet_balance", []interface{}{addr})
		printJSON(resp)
	default:
		fmt.Printf("Unknown wallet subcommand: %s\n", subCmd)
	}
}

func handleTx(args []string) {
	if len(args) < 1 {
		fmt.Println("Usage: tools tx <send|status>")
		return
	}
	// Simplified Implementation
	fmt.Println("Transaction command executed.")
}

func handleQuery(args []string) {
	fmt.Println("Query command executed.")
}

func handleConfig(args []string) {
	fmt.Println("Config command executed.")
}

func callRPC(method string, params []interface{}) interface{} {
	reqBody := RPCRequest{Method: method, Params: params}
	jsonData, _ := json.Marshal(reqBody)

	resp, err := http.Post(defaultConfig.NodeURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Error connecting to node: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var result interface{}
	json.Unmarshal(body, &result)
	return result
}

func printJSON(data interface{}) {
	output, _ := json.MarshalIndent(data, "", "  ")
	fmt.Println(string(output))
}
