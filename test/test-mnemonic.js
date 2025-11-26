const mm = require('../services/mnemonic-manual');

console.log("=== 1) GENERATE NEW MNEMONIC ===");
const { mnemonic, entropyHex } = mm.createMnemonic(12);
console.log("Mnemonic:", mnemonic);
console.log("Entropy (hex):", entropyHex);


console.log("\n=== 2) VALIDATE GENERATED MNEMONIC ===");
console.log("Is valid?", mm.validateMnemonic(mnemonic));


console.log("\n=== 3) MODIFY MNEMONIC (SHOULD FAIL VALIDATION) ===");
const words = mnemonic.split(" ");
words[0] = (words[0] === "abandon") ? "ability" : "abandon";  // flip word for testing
const wrong = words.join(" ");
console.log("Modified Mnemonic:", wrong);
console.log("Is modified mnemonic valid?", mm.validateMnemonic(wrong));


console.log("\n=== 4) DERIVE SEED FROM MNEMONIC ===");
const seed = mm.mnemonicToSeed(mnemonic);
console.log("Seed (hex):", seed.toString("hex"));
console.log("Seed length:", seed.length, "bytes"); // should be 64


console.log("\n=== 5) SEED SHOULD BE STABLE (SAME MNEMONIC → SAME SEED) ===");
const seed2 = mm.mnemonicToSeed(mnemonic);
console.log("Seed matches?", seed.toString("hex") === seed2.toString("hex"));


console.log("\n=== 6) MASTER KEY DERIVATION ===");
const seed3 = mm.mnemonicToSeed(mnemonic);
const master = mm.deriveMasterKeyFromSeed(seed3);

console.log("Master Private Key (hex):", master.masterPrivateKey.toString("hex"));
console.log("Master Chain Code (hex):", master.masterChainCode.toString("hex"));
console.log("Master Private Key length:", master.masterPrivateKey.length);
console.log("Master Chain Code length:", master.masterChainCode.length);



// To check the raw seed

// const seed = mm.mnemonicToSeed(mnemonic);
// console.log("Seed (raw):", seed); 
// console.log("Seed length:", seed.length, "bytes");

// console.log("\n=== Seed Consistency Test WITHOUT HEX ===");
// const seed2 = mm.mnemonicToSeed(mnemonic);
// console.log("seed === seed2 ?", seed === seed2);          // always FALSE
// console.log("seed equals seed2 ?", seed.equals(seed2));   // TRUE
