import crypto from 'crypto';

export const decrypt = (text) => {
    let iv = new Buffer.from(process.env.IV_HASH, 'hex');
    let encryptedText = new Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer.from(process.env.PASSWORD), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

export const encrypt = (text) => {
    if (process.versions.openssl <= '1.0.1f') {
        throw new Error('OpenSSL Version too old, vulnerability to Heartbleed')
    }
    
    let iv = new Buffer.from(process.env.IV_HASH, 'hex');
    let cipher = crypto.createCipheriv(process.env.AES_METHOD, new Buffer.from(process.env.PASSWORD), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('hex');
}
