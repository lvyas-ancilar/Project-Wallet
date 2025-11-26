# Backend Architecture

What IS a mnemonic?

A mnemonic is a human-readable encoding of a cryptographic seed, based on the BIP39 standard.
its not just random words , its mathematically generated , they follow some rules 

# WHY Mnemonic ? 
Mnemoic are human readable backup , they are easy to write and easy to remember , easy to type and only used for restoring the wallet , basically they are for humans 

# How to generate a mnemonic manually (conceptually)

Generating a mnemonic manually involves 4 steps:

Entropy → Add checksum → Split into chunks → Map each chunk to a word
-----------------------------------------------------------------------------------------------

STEP 1: Generate ENTROPY (pure randomness) 128 bits of pure 0 and 1s 

For a 12-word mnemonic:

You need 128 bits of entropy (128 random bits).

Entropy sizes:

Words	Entropy	Checksum	Total Bits
12	128 bits	4 bits	    132 bits
15	160 bits	5 bits	    165 bits
18	192 bits	6 bits	    198 bits
21	224 bits	7 bits	    231 bits
24	256 bits	8 bits	    264 bits

For 12 words → generate 128 bits random.

WHat is checksum and why do we need it !?
 Ans : Mnemonic must be:
validatable
error-detectable (for typos)
compatible across wallets

To do this, BIP39 adds a checksum, which is just a few bits added to the end.

This makes sure:

✔ The mnemonic is valid
✔ No mistakes were made    
✔ Same mnemonic always results in same wallet


--------------------------------------------------------------------------------

Why ONLY 4 bits of checksum for a 12-word mnemonic?
Ans : Because the checksum size is mathematically defined as : entropy_length/32 = 4 , this is defined by the bip39 standard

# We are basically hashing the entropy.

Then using a few bits of that hash as a checksum.
If anything changes → checksum doesn’t match → mnemonic INVALID.


# Mnemonic Validation Working

-> we have entropy → (raw random bits)
-> then we compute ,  checksum = first (entropy_length / 32) bits of SHA-256(entropy) => first 4 bits of sha256(entropy)
->Then you append this checksum to the entropy → get combined bits
->Those bits form the mnemonic words

# How do 132 bits become 12 human words

-> for a 12 words mnemonic 128 bits entropy + 4 bits checksum => 132 bits total
-> so we have sometthing like 01010101010 upto 132 bits 

-> we Split into 11-bit chunks
# why 11 bits ?? 
Ans : Because the BIP-39 wordlist has 2048 words. 2^11 = 2048 

->So every 11 bits is a number between: 0 → 2047

-> so now we split 132 bits into 12 groups , 132/11 
->[10100111001] [01101001011] [11100010010] ... (12 chunks)
-> each block is one word index 
# converting binary to decimal 
->10100111001  →  1321 
->01101001011  →   811
->11100010010  →  1810

-> 132 , 811 , 1810 .. something like this 

then final step :  Use these numbers as indexes in BIP-39 wordlist

# this gives us the 12 random words 
----------------------------------------------------------------------------------------


# WHAT IS MNEMONIC VALIDATION?
Validation means:

-> Convert the 12/24 words back into bits
-> Separate entropy bits and checksum bits
-> Recompute the checksum from entropy
-> Compare the two
If they match → VALID otherwise invalid 

# Why do we need validation?

Because it confirms:
1) words are real BIP39 words
2) words are in the correct order
3) no typo
4) no extra/missing word
5) checksum matches → mnemonic is genuine


# How does checksum fits into those 132 bits
Ans : 132 bits total = 11 bits × 12 words
-> bits 0-10    → word 1 , bits 11-21   → word 2
-> so the last word , it takes first 7 bits for the word and last 4 bits are checksum bits 


## How are we generating randomness at first step itself ??

crypto.randomBytes() : it does not generate randomness by itself 
It is asking your operating system (Windows / Mac / Linux) to give it real, unpredictable randomness.

Your OS collects randomness from many sources, like:

mouse movements
keyboard timings
CPU temperature noise
disk hardware noise
timing of system interrupts
network jitter
hardware RNG inside CPU
secure chip RNG (TPM/SEED RNG)

The OS keeps mixing all this entropy inside something called:CSPRNG
CSPRNG = Cryptographically Secure Pseudo Random Number Generator


### some ref 
https://soliditydeveloper.com/2019-06-23-randomness-blockchain
https://docs.openssl.org/1.1.1/man3/RAND_bytes/#description (this is for my crypto module)
https://docs.rs/rand/latest/rand/rngs/struct.ThreadRng.html (rand::thread_rng() , thread_rng())
https://docs.rs/rand/latest/rand/rngs/struct.OsRng.html