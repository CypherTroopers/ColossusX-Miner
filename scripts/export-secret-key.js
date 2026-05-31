const fs = require("fs");
const path = require("path");
const { Wallet } = require("ethers");

function isKeystoreFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  if (!fs.statSync(filePath).isFile()) return false;

  const name = path.basename(filePath);
  if (!name.startsWith("UTC--")) return false;

  try {
    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return (
      json.version === 3 &&
      json.address &&
      json.crypto &&
      json.crypto.cipher &&
      json.crypto.ciphertext &&
      json.crypto.kdf &&
      json.crypto.mac
    );
  } catch {
    return false;
  }
}

function findKeystores(startDir) {
  const results = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (
          entry.name === ".git" ||
          entry.name === "node_modules" ||
          entry.name === "build" ||
          entry.name === "vendor"
        ) {
          continue;
        }

        walk(fullPath);
        continue;
      }

      if (entry.isFile() && isKeystoreFile(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  walk(startDir);
  return results;
}

function askVisible(question) {
  return new Promise((resolve) => {
    const readline = require("readline");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askHidden(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    if (!stdin.isTTY) {
      console.error("Password input requires an interactive terminal.");
      process.exit(1);
    }

    let password = "";

    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    function onData(char) {
      if (char === "\r" || char === "\n" || char === "\u0004") {
        stdout.write("\n");
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        resolve(password);
        return;
      }

      if (char === "\u0003") {
        stdout.write("\n");
        process.exit(130);
      }

      if (char === "\u0008" || char === "\u007f") {
        password = password.slice(0, -1);
        return;
      }

      password += char;
    }

    stdin.on("data", onData);
  });
}

async function selectKeystore(files) {
  if (files.length === 1) {
    return files[0];
  }

  console.log("");
  console.log("Found keystore files:");
  console.log("");

  files.forEach((file, index) => {
    console.log(`[${index + 1}] ${file}`);
  });

  console.log("");

  while (true) {
    const answer = await askVisible("Select keystore number: ");
    const num = Number(answer);

    if (Number.isInteger(num) && num >= 1 && num <= files.length) {
      return files[num - 1];
    }

    console.log("Invalid number.");
  }
}

async function main() {
  const targetArg = process.argv[2] || ".";
  const targetPath = path.resolve(targetArg);

  if (!fs.existsSync(targetPath)) {
    console.error("Path not found:");
    console.error(targetPath);
    process.exit(1);
  }

  let keystoreFiles = [];

  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    if (!isKeystoreFile(targetPath)) {
      console.error("This file does not look like a valid keystore v3 file:");
      console.error(targetPath);
      process.exit(1);
    }

    keystoreFiles.push(targetPath);
  } else if (stat.isDirectory()) {
    keystoreFiles = findKeystores(targetPath);
  }

  if (keystoreFiles.length === 0) {
    console.error("No keystore files found.");
    console.error("");
    console.error("Examples:");
    console.error("  npm run export-secret-key");
    console.error("  npm run export-secret-key -- ./chaindbname");
    console.error("  npm run export-secret-key -- ./chaindbname/keystore/UTC--xxxx");
    process.exit(1);
  }

  const selectedKeystore = await selectKeystore(keystoreFiles);

  console.log("");
  console.log("Selected keystore:");
  console.log(selectedKeystore);

  const encryptedJson = fs.readFileSync(selectedKeystore, "utf8");
  const password = await askHidden("Keystore password: ");

  try {
    const wallet = await Wallet.fromEncryptedJson(encryptedJson, password);

    console.log("");
    console.log("========================================");
    console.log("Address:");
    console.log(wallet.address);
    console.log("");
    console.log("Secret Key / Private Key:");
    console.log(wallet.privateKey);
    console.log("========================================");
    console.log("");
    console.log("WARNING: Never share your private key with anyone.");
  } catch (err) {
    console.error("");
    console.error("Failed to decrypt keystore.");
    console.error("Wrong password or invalid keystore file.");
    process.exit(1);
  }
}

main();
