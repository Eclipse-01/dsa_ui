// SHA256算法实现
class SHA256 {
    private static K: number[] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    private static HASH_INIT: number[] = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    private static rightRotate(n: number, x: number): number {
        return (x >>> n) | (x << (32 - n));
    }

    public static hash(message: string): string {
        const utf8Encode = new TextEncoder();
        const messageArray = utf8Encode.encode(message);
        
        // 预处理
        const bitLength = messageArray.length * 8;
        const paddingLength = (512 + 448 - (bitLength + 1) % 512) % 512;
        const paddedLength = messageArray.length + Math.ceil(paddingLength / 8) + 8;
        const paddedMessage = new Uint8Array(paddedLength);
        
        // 复制原始消息
        paddedMessage.set(messageArray);
        
        // 添加填充
        paddedMessage[messageArray.length] = 0x80;
        
        // 添加消息长度
        const view = new DataView(paddedMessage.buffer);
        view.setBigUint64(paddedLength - 8, BigInt(bitLength), false);
        
        // 初始化哈希值
        let h0 = this.HASH_INIT[0];
        let h1 = this.HASH_INIT[1];
        let h2 = this.HASH_INIT[2];
        let h3 = this.HASH_INIT[3];
        let h4 = this.HASH_INIT[4];
        let h5 = this.HASH_INIT[5];
        let h6 = this.HASH_INIT[6];
        let h7 = this.HASH_INIT[7];
        
        // 处理每个512位块
        for(let i = 0; i < paddedMessage.length; i += 64) {
            const w = new Array(64);
            
            // 复制块到w数组
            for(let j = 0; j < 16; j++) {
                w[j] = view.getUint32(i + j * 4, false);
            }
            
            // 扩展w数组
            for(let j = 16; j < 64; j++) {
                const s0 = this.rightRotate(7, w[j-15]) ^ this.rightRotate(18, w[j-15]) ^ (w[j-15] >>> 3);
                const s1 = this.rightRotate(17, w[j-2]) ^ this.rightRotate(19, w[j-2]) ^ (w[j-2] >>> 10);
                w[j] = (w[j-16] + s0 + w[j-7] + s1) >>> 0;
            }
            
            let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
            
            // 压缩函数主循环
            for(let j = 0; j < 64; j++) {
                const S1 = this.rightRotate(6, e) ^ this.rightRotate(11, e) ^ this.rightRotate(25, e);
                const ch = (e & f) ^ (~e & g);
                const temp1 = (h + S1 + ch + this.K[j] + w[j]) >>> 0;
                const S0 = this.rightRotate(2, a) ^ this.rightRotate(13, a) ^ this.rightRotate(22, a);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const temp2 = (S0 + maj) >>> 0;
                
                h = g;
                g = f;
                f = e;
                e = (d + temp1) >>> 0;
                d = c;
                c = b;
                b = a;
                a = (temp1 + temp2) >>> 0;
            }
            
            // 更新哈希值
            h0 = (h0 + a) >>> 0;
            h1 = (h1 + b) >>> 0;
            h2 = (h2 + c) >>> 0;
            h3 = (h3 + d) >>> 0;
            h4 = (h4 + e) >>> 0;
            h5 = (h5 + f) >>> 0;
            h6 = (h6 + g) >>> 0;
            h7 = (h7 + h) >>> 0;
        }
        
        // 转换为十六进制字符串
        return [h0, h1, h2, h3, h4, h5, h6, h7]
            .map(h => h.toString(16).padStart(8, '0'))
            .join('');
    }
}

export const sha256 = (message: string): string => {
    return SHA256.hash(message);
};
