## How does metamask generates those mnemonics (fron any server or from our local os) ? 
Ans : MetaMask ALWAYS generates your mnemonic LOCALLY, inside your device, using YOUR OS’s random number generator, NOT MetaMask servers.
MetaMask is a NON-CUSTODIAL wallet
Meaning:
It never sends your seed phrase to servers
It never generates your keys remotely
It never knows your private key
It never backs up your secrets

Everything is generated and stored locally in your browser/device.
references : https://github.com/MetaMask/eth-hd-keyring/blob/main/index.js -
https://github.com/bitcoinjs/bip39#examples -
https://github.com/MetaMask/metamask-extension/blob/main/package.json


## Does MetaMask store our private key, public key, and mnemonic ?
## Where does my mnemonic gets store ??

Ans : MetaMask stores your mnemonic phrase encrypted inside your browser’s local storage encrypted with our password
and they are stored encrypted 
Everything stays inside your machine. Nothing gets nowhere , not to any server 

### To view this 
1) extension -> dev tools -> application -> local storage -> keyring controller -> inside it vault (encrypted json string)
2) 2nd way ->dev tools -> extension storage -> metaMask storage


## How does os generates the randomness ??
Ans : The OS does NOT use one source of randomness.
It collects randomness from DOZENS of unpredictable hardware + system events.

This is called the KERNEL ENTROPY POOL

In mac , in dev folder there are random abd urandom 
These are the exact devices macOS uses for cryptographic randomness.


/dev/urandom — macOS Secure CSPRNG
This is the random device that:

Web browsers use (crypto.getRandomValues)
Node.js uses (crypto.randomBytes)
Rust uses (OsRng)
Go uses (crypto/rand)
OpenSSL uses
MetaMask uses internally
Your wallet uses when generating mnemonic
Your blockchain node uses for RANDAO randomness

macOS’s /dev/urandom is cryptographically secure and backed by the kernel’s ChaCha20 CSPRNG

macOS kernel collects entropy from:

Interrupt timings -> the microsecond-level timing between your key presses.
Disk I/O timing -> SSDs and HDDs have microscopic unpredictable delays during read/write.
CPU jitter
Device events
Hardware RNG (Intel RDRAND, Apple Silicon TRNG)
Network noise
System timers -> Thread scheduling, OS events, context switches — all produce tiny unpredictable differences.

Raw entropy is messy so OS applies strong transformations like -> SHA-256 , SHA-512 , ChaCha20 , AES-CTR , HMAC

This makes randomness: uniform unpredictable secure


## What is a CSPRNG? ?
Ans : Cryptographically Secured Psuedo Random Generator
A CSPRNG is a machine that creates random numbers

## What is ChaCha20?
Ans : A super-fast secure modern random-number-making machine used by your OS and apps.
this is what /dev/urandom uses
ChaCha20 is a modern cryptographic algorithm that generates extremely secure, unpredictable randomness used to create your wallet’s private keys and mnemonics.


## HOW does ChaCha20 actually create randomness?
Ans : ChaCha20 does NOT create randomness by itself.
OS gives ChaCha20 some starting randomness (seed).
ChaCha20 stretches that little randomness into a HUGE river of secure random bytes.

### ChaCha20 works using only 3 simple operations: ARX
-> ADD 
-> ROTATE
-> XOR

## what happens when i call crypto.randomBytes() ??
Ans : 1) OS keeps an entropy pool : KERNEL ENTROPY POOL 
2) Kernel feeds the entropy into a CSPRNG (ChaCha20) 
3) chacha20 does DRBG (deterministic random bit generator) mixes rotates xor's adds 

4) when we call crypto.randomBytes(16) ->Node.js calls into OpenSSL, and OpenSSL calls the OS RNG.

-> NOTHING is coming from Node itself.
-> NOTHING is coming from MetaMask.
-> NOTHING is coming from internet.

Everything is local OS randomness.

