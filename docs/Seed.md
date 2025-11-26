# What is SEED? THE MOTHER KEY 
1) The SEED is a big secret number derived from your mnemonic (12/24 words)
2) It is 512 bits (64 bytes)
3) it is the root of all your private keys and addresses.

-> flow : mnemonic → PBKDF2 → seed

"yard flower idea brisk gentle attract ..."  
       ↓
PBKDF2-HMAC-SHA512 (2048 rounds)
       ↓
seed = f2ab23c92dd0a9e3bb41e912...

------------------------------------------------------------------------------------

# Why do we need the seed?
Ans : Because we do NOT generate private keys directly from the 12 words

So the flow is  : Mnemonic (lets say 12 words) -> seed (512 bits) -> Master private key (bip 32) -> child keys (eth accounts) -> ethereum address 


-> This hierarchy is how a wallet can generate:

account 0
account 1
account 2
… infinite accounts

All from ONE seed.


### Seed are real cryptographic master secret , used for deriving private keys and master secret , they are for computers 

so how does things happen internally : 
1) when we enter mnemonmic to recover the wallet 
2) Internally, wallets do this:

seed = PBKDF2_HMAC_SHA512(
    password = mnemonic,
    salt = "mnemonic" + passphrase,
    iterations = 2048
)

3) this create 64 bytes (521 bits) seed , which is then used by bip32 to derive all private keys 



------------------------------------------------------------------------------------------------------

# What is PBKDF2 ? 
Ans : Password-Based Key Derivation Function 2
It’s used to turn a password (mnemonic) into a strong cryptographic key

PBKDF2 does:
    ->HMAC-SHA512 hashing
    ->Repeated 2048 times (slow down brute-force attackers)
    ->Produces 64 bytes output

crypto.pbkdf2 are offloaded to libuv's thread pool.

-> The libuv thread pool is a crucial component within the libuv library, which serves as the foundation for asynchronous I/O operations in Node.js and other event-driven systems. Its primary purpose is to handle time-consuming or blocking operations without freezing the main event loop, ensuring the application remains responsive.

-> Asynchronous Execution: When a blocking operation is initiated in Node.js, libuv dispatches it to one of the threads in its thread pool. The main event loop can then continue processing other tasks. Once the operation in the thread pool completes, it signals the event loop, which then executes the associated callback function in the main thread.

Why they are offloaded to libuv thread pool ? 
The crypto.randomBytes() or crypto.pbkdf2()  method will not complete until there is sufficient entropy available. This should normally never take longer than a few milliseconds. The only time when generating the random bytes may conceivably block for a longer period of time is right after boot, when the whole system is still low on entropy.

This API uses libuv's threadpool, 

----------------------------------------------------------------------------------------------

# Why we use hex and not raw buffer output

Buffers are objects, not strings
A seed is returned as a Node.js Buffer.

const seed = <Buffer 9f a3 4b ... >
const seed2 = <Buffer 9f a3 4b ... >

Even though the bytes inside them are identical,
they are two different objects in memory.

## Two seperate object can never be equal as their object reference will not be equal 

now to compare buffere we can use .equals() compares the bytes, not the object reference

seed.equals(seed2) literally checks:
Are the bytes identical?
In same order?
Same length?

## And why wwe use hex 
Ans : Because hex turns Buffer into a simple string : "9fa34b..." === "9fa34b..." → true
Strings compare content, not object reference.

-----------------------------------------------------------------------------------------------

Why there are two functions in bip39 github , menmonicToSeedSync and mnemonicToSeed 
// difference is synchronous and async function 