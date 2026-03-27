<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CodeEditor from "./CodeEditor.svelte";

  const { Story } = defineMeta({
    title: "Forms/CodeEditor",
    component: CodeEditor,
    tags: ["autodocs"],
  });

  const tsCode = `interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  gasPrice: number;
}

async function getTransactions(address: string): Promise<Transaction[]> {
  const response = await fetch(\`/api/txs/\${address}\`);
  const data = await response.json();
  // Filter pending transactions
  return data.filter((tx: Transaction) => tx.value > 0);
}`;

  const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Vault {
    mapping(address => uint256) public balances;
    uint256 public totalDeposits;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
}`;

  const jsonCode = `{
  "name": "cyberdyne-protocol",
  "version": "2.0.0",
  "networks": {
    "mainnet": {
      "chainId": 1,
      "rpcUrl": "https://eth.cyberdyne.io",
      "contracts": {
        "vault": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD12",
        "token": "0x1234567890abcdef1234567890abcdef12345678"
      }
    }
  }
}`;
</script>

<Story name="TypeScript">
  <CodeEditor label="TypeScript" language="typescript" value={tsCode} />
</Story>

<Story name="Solidity">
  <CodeEditor label="Smart Contract" language="solidity" value={solidityCode} />
</Story>

<Story name="JSON">
  <CodeEditor label="Configuration" language="json" value={jsonCode} />
</Story>

<Story name="Readonly">
  <CodeEditor label="Deployed Contract" language="solidity" value={solidityCode} readonly={true} />
</Story>
