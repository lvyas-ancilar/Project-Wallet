// mnemonic-manual.js
// Manual BIP-39 mnemonic generation + validation (bit-level) for Node.js
// Uses 'bip39' package only for the official english wordlist.

const crypto = require('crypto');
const { createHash } = require('crypto');
const bip39 = require('bip39');
const wordlist = bip39.wordlists.english;

/**
 * Supported word counts: 12,15,18,21,24
 * For n words: entropy bits = (n / 3) * 32  basically 12/3 = 4 and 4 * 32  = 128 bits this should be the entropy size for 12 words
 * Example: 12 => 128 bits (16 bytes) because Node.js crypto API (crypto.randomBytes) generates bytes, not bits.
 */

function bytesForWords(numWords = 12) {
  if (![12, 15, 18, 21, 24].includes(numWords)) {
    throw new Error('Unsupported mnemonic length. Use 12,15,18,21 or 24.');
  }
  const entropyBits = (numWords / 3) * 32;
  return entropyBits / 8; // converting it into bytes as 1 byte = 8 bits 
} // Mnemonic = entropy bits + checksum bits
// The number of words decides entropy size.


/** Generate cryptographically secure entropy bytes for requested word count */
function generateEntropyBytes(numWords = 12) {
  const bytes = bytesForWords(numWords);
  return crypto.randomBytes(bytes); // generating random bytes
}
// bytesForWords() → decides how big entropy should be
//generateEntropyBytes() → produces secure random entropy bytes



// After entropy is generated
//ENTROPY → convert to bits → generate checksum → append checksum → split bits → map to words




// Convert entropy bytes into a binary bitstring
//we convert all bytes into a string of 0s and 1s.
// for that the conversion function is written here down 
/** Convert a Buffer -> binary string of length 8*bytes */
function bufferToBinaryStr(buf) {
  let bin = '';
  for (const b of buf) {
    let s = b.toString(2);
    if (s.length < 8) s = '0'.repeat(8 - s.length) + s;
    bin += s;
  }
  return bin;
}
//This gives us entropyBits, a long binary string
//This step is needed because BIP39 works with bit-level operations, not byte-level.





// now the next step wwill be of genrating the checksum bits 
// what we are doing here is sha-256 hashes the entropy (eg: 128 bits)
// then we convert the sha-256 hash into binary using our bufferToBinarystr function 
// Take only the first entropyBits / 32 bits , for 12 it is 4 bits
// Compute checksum bits: first (entropyLength/32) bits of SHA256(entropy) 
function checksumBits(entropyBuf) {
  const hash = createHash('sha256').update(entropyBuf).digest();
  const hashBin = bufferToBinaryStr(hash);
  const csLen = (entropyBuf.length * 8) / 32; // we take only first 4 bits of the SHA256 hash
  return hashBin.slice(0, csLen);
}

// now combining the entropy bitstring + checksum bitstring and converting entropic buffer into mnemonic

// Convert entropy buffer -> mnemonic (manual process) 
function entropyToMnemonic(entropyBuf, numWords = 12) {
  const entropyBits = entropyBuf.length * 8;
  const expectedEntropy = (numWords / 3) * 32; // checking 12 words = 128 bits or 24 words  = 256 bits
  if (entropyBits !== expectedEntropy) {
    throw new Error(`Entropy length ${entropyBits} not matching expected ${expectedEntropy} for ${numWords} words`);
  }

  const entropyBin = bufferToBinaryStr(entropyBuf); // with help of this function which we defined above we convert bytes into big binary string 
  const cs = checksumBits(entropyBuf); // then here with the help of checksum function we generate the checksum bits 
  const combined = entropyBin + cs; // bits length = entropyBits + csLen 132 bits entropy + checksum

  // split into 11-bit pieces , now here we will do the chunking 
  // each chunk is a unique id of word
  const chunks = [];
  for (let i = 0; i < combined.length; i += 11) {
    chunks.push(combined.slice(i, i + 11));
  } // cutting this string into groups of 11 digits



  // map each 11-bit chunk to a word
  // first here it takes 11 bit binary string 
  // then convert it into decimal using parseInt 
  const words = chunks.map((bin) => {
    // bin should always be 11 bits for valid inputs
    if (bin.length !== 11) bin = bin.padEnd(11, '0'); // safety
    const idx = parseInt(bin, 2); // whatever the number it gives , we look it into bip39 word index
    return wordlist[idx];
  });

  return words.join(' ');
}


// NOW WE WILL DO THE VALIDDATION PART 


// Convert mnemonic -> combined bitstring (words -> indices -> bits) 
function mnemonicToCombinedBits(mnemonic) {
  const words = mnemonic.trim().split(/\s+/); // splliting the words 
  // verify length is valid
  if (![12, 15, 18, 21, 24].includes(words.length)) {
    throw new Error('Mnemonic must be 12/15/18/21/24 words');
  }

  const bits = words.map((w) => {
    const idx = wordlist.indexOf(w); // here we get the index of that word in bip39
    if (idx === -1) {
      throw new Error(`Word not in BIP39 wordlist: "${w}"`);
    }
    let b = idx.toString(2); // converting it back into binary string 
    if (b.length < 11) b = '0'.repeat(11 - b.length) + b; // pad to 11 bits 
    return b; // this returns an 11 bit string 
  }).join('');

  return { combinedBits: bits, numWords: words.length }; // combined bits are the whole binary string and numwords are how many words used 
}

// now we already have the combined 132 bits but now we need to seggeregate thee entropy bits and the checksum bits 

// Convert combined bits -> { entropyBuf, checksumBits } 
function combinedBitsToEntropyAndChecksum(combinedBits, numWords) {
  const entropyBits = (numWords / 3) * 32;
  const csLen = entropyBits / 32;
  const entropyBin = combinedBits.slice(0, entropyBits); // basically the first 128 bits from 0-127
  const cs = combinedBits.slice(entropyBits, entropyBits + csLen); // the last 4 bits from 128-131

  // convert entropyBin back to Buffer
  const bytes = []; // here we convert every 8 bits into 1 byte 
  for (let i = 0; i < entropyBin.length; i += 8) {
    const byte = entropyBin.slice(i, i + 8); //we divided those 128 bits into 8-bit chunks
    bytes.push(parseInt(byte, 2)); //Each chunk was converted to a number (0–255) and pushed into an array named bytes.
  }
  return { entropyBuf: Buffer.from(bytes), checksum: cs };
  //It returns an object containing:
    //entropyBuf → the entropy bytes
    //checksum → the checksum bits extracted from the mnemonic
   // Buffer.from creates a Buffer EXACTLY identical to the original entropy that created the mnemonic.
}



// SEED 

function mnemonicToSeed(mnemonic, passphrase = "") {
  const salt = "mnemonic" + passphrase; // if passphrase is there fine otherwise no problem , passphrase makes it extra harder also called 13/25th word
  return crypto.pbkdf2Sync(
    mnemonic.normalize("NFKD"),     // password  Unicode normalization.
    salt.normalize("NFKD"),         // salt
    2048,                           // iterations
    64,                             // output length (64 bytes = 512 bits)
    "sha512"                        // HMAC-SHA512
  );
}
//What this does:
//Takes your mnemonic (12/24 words)
//Applies HMAC-SHA512
//Repeats it 2048 times
//Produces a 64-byte SEED

//NFKD standardizes the Unicode characters.
//This ensures every wallet in the world generates the SAME SEED for the SAME WORDS.



// master key now : deriving the master key and chain code from the seed 

function deriveMasterKeyFromSeed(seed) {
  // I = HMAC-SHA512(key="Bitcoin seed", data=seed)
  const I = crypto.createHmac("sha512", "Bitcoin seed")
                 .update(seed)
                 .digest(); // it produces a 64 byte output which we will divide in 2 halves

  const IL = I.slice(0, 32);  // left 32 bytes → master private key
  const IR = I.slice(32);     // right 32 bytes → master chain code

  return {
    masterPrivateKey: IL,
    masterChainCode: IR
  };
}




// Validate mnemonic: returns true if checksum matches 
function validateMnemonic(mnemonic) {
  const { combinedBits, numWords } = mnemonicToCombinedBits(mnemonic);
  const { entropyBuf, checksum } = combinedBitsToEntropyAndChecksum(combinedBits, numWords);
  const expectedCs = checksumBits(entropyBuf);
  return expectedCs === checksum;
}

// create mnemonic (entropy generation + convert) 
function createMnemonic(numWords = 12) {
  const entropyBuf = generateEntropyBytes(numWords);
  const mnemonic = entropyToMnemonic(entropyBuf, numWords);
  return { mnemonic, entropyHex: entropyBuf.toString('hex') };
}

module.exports = {
  createMnemonic,
  validateMnemonic,
  generateEntropyBytes,
  entropyToMnemonic,
  mnemonicToCombinedBits,
  combinedBitsToEntropyAndChecksum,
  checksumBits,
  bufferToBinaryStr,
  mnemonicToSeed,
  deriveMasterKeyFromSeed
};
