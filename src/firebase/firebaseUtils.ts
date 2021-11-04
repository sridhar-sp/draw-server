import randomBytes from 'randombytes';

export class AutoId {

    // Alphanumeric characters
    private static ALLOWED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    static newId(): string {

        const charsLength = AutoId.ALLOWED_CHARS.length

        // The largest byte value that is a multiple of `char.length`.
        const maxMultiple = Math.floor(256 / charsLength) * charsLength;

        let autoId = '';
        const targetLength = 20;
        while (autoId.length < targetLength) {
            const bytes = randomBytes(40);

            for (let i = 0; i < bytes.length; ++i) {
                // Only accept values that are [0, maxMultiple), this ensures they can
                // be evenly mapped to indices of `chars` via a modulo operation.
                if (autoId.length < targetLength && bytes[i] < maxMultiple) {
                    autoId += AutoId.ALLOWED_CHARS.charAt(bytes[i] % charsLength);
                }
            }
        }

        return autoId;
    }
}
