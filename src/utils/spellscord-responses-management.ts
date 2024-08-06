
import { loadTranslations } from "./localization";
import { localization, endDisclaimer } from "../../config.json";

// import localized no mistakes sequence + explanation & message body delimiter
let noMistakesSequence: string = "";
let explanationDelimiter: string = "";
let messageBodyDelimiter: string = "";
loadTranslations(localization).then((translation) => {
    if (translation?.noMistakesSequence) {
        noMistakesSequence = translation.noMistakesSequence;
    }
    if (translation?.explanationDelimiter) {
        explanationDelimiter = translation.explanationDelimiter;
    }
    if (translation?.messageBodyDelimiter) {
        messageBodyDelimiter = translation.messageBodyDelimiter;
    }
});

export function isNoMistakesSequence(response: string): boolean {
    const parsedResponse = parseResponse(response);
    return response.trim() === noMistakesSequence.trim() || parsedResponse[0]?.trim() === noMistakesSequence.trim();
}

function clearString(str: string) {
    const UNNECESSARY_CHAR = [" ", "\n", "\r", ".", "!", "?", "…", ",", ";", ":", "'", "/", "-"];
    let output = str.toLowerCase();
    // remove all unnecessary char form the text
    for (let char of UNNECESSARY_CHAR) {
        output = output.replaceAll(char, "");
    }

    return output;
}

export function isThereAnyRelevantCorrection(userInput: string, response: string): boolean {
    return clearString(userInput) !== clearString(parseResponse(response)[0] ?? "");
}

export function containsTheExactUserInput(userInput: string, response: string): boolean {
    // often struggle with short messages and repeat it before saying "No mistakes"
    return response.includes(userInput);
}

export function containsNoMistakesSequence(response: string): boolean {
    return response.includes(noMistakesSequence);
}

export function parseResponse(response: string): Array<string> {
    let parsedResponse = response.split(explanationDelimiter);
    let explanations = "";
    if (parsedResponse.length > 1) {
        explanations = parsedResponse.pop()?.trim() ?? "";
    } else {
        // often struggle with short message and write everything inline
        parsedResponse = response.split(explanationDelimiter.trim());
        if (parsedResponse.length > 1) {
            explanations = parsedResponse.pop()?.trim() ?? "";
        }
    }
    const messageBody = parsedResponse.join(explanationDelimiter).trim();
    
    return [messageBody, explanations];
}

export function beautifyResponse(response: string): string {
    // const parsedResponse = parseResponse(response);
    // const explanations = parsedResponse[1];
    // const messageBody = parsedResponse[0];

    // const output = (messageBody ? messageBodyDelimiter + "```" + messageBody + "```\n" : "") + (explanations ? explanationDelimiter + explanations : "") + (endDisclaimer ? "\n-# " + endDisclaimer : "");
    const output = (response ? messageBodyDelimiter + "```" + response + "```\n" : "")
    return output;
}
