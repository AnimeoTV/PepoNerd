
/**
 * This function splits long texts into smaller chunks.
 * @param text The input long text
 * @param maxLength The max length of a chunk
 * @returns An array of smaller strings
 */
export function splitTextIntoChunks(text: string, maxLength: number = 2000): string[] {
    const chunks: string[] = [];
    const BREAKABLE_CHARACTERS = [["\n", "\r\n"], [".", "!", "?"], [","], [" "], ["/", "-", "_", ")", "]", "\""]]; // the order counts as priority order
    const MINIMAL_FILLING = 2/3; // if the message is too long, this ensures that each chunk will not be smaller than this proportion of maxLength
    let currentIndex = 0;

    while (currentIndex < text.length) {
        let nextIndex = currentIndex + maxLength - 1;

        if (nextIndex >= text.length) {
            chunks.push(text.substring(currentIndex));
            break;
        }

        // Ensure the chunk ends with a breakable character
        for (let i = 0; i < BREAKABLE_CHARACTERS.length; i++) {
            while (nextIndex > currentIndex + MINIMAL_FILLING*maxLength && !BREAKABLE_CHARACTERS[i]!.includes(text[nextIndex]!)) {
                nextIndex--;
            }
            if (nextIndex === currentIndex) {
                nextIndex = currentIndex + maxLength - 1;
            } else {
                break;
            }
        }

        // If no space found, cut at maxLength (word will be cut)
        if (nextIndex === currentIndex) {
            nextIndex = currentIndex + maxLength - 1;
        }

        chunks.push(text.substring(currentIndex, nextIndex+1).trim());
        currentIndex = nextIndex+1; // move past the space
    }

    return chunks;
}


export function stripCodeBlocksBacksticks(text: string): string {
    console.log("text.length", text.length)
    text = text.trim();
    const CODE_BLOCK_DELIMITER = "```";
    const idx = text.indexOf(CODE_BLOCK_DELIMITER);
    if (idx < 0) {
        return text;
    }

    text = text.slice(idx + CODE_BLOCK_DELIMITER.length, text.length-CODE_BLOCK_DELIMITER.length);
    console.log("output.length", text.length)
    return text;
}
