
import { loadTranslations } from "./localization";
import { localization, endDisclaimer } from "../../config.json";

// import localized no mistakes sequence + explanation & message body delimiter
let noMistakesSequences: string = "";
let startMessageSequences: string = "";
let explanationDelimiters: string = "";
let messageBodyDelimiter: string = "";
loadTranslations(localization).then((translation) => {
    if (translation?.noMistakesSequences) {
        noMistakesSequences = translation.noMistakesSequences;
    }
    if (translation?.startMessageSequences) {
        startMessageSequences = translation.startMessageSequences;
    }
    if (translation?.explanationDelimiters) {
        explanationDelimiters = translation.explanationDelimiters;
    }
    if (translation?.messageBodyDelimiter) {
        messageBodyDelimiter = translation.messageBodyDelimiter;
    }
});

export function isNoMistakesSequence(response: string): boolean {
    const parsedResponse = parseResponse(response);
    for (let noMistakesSequence of noMistakesSequences) {
        if (response.trim() === noMistakesSequence.trim() || (parsedResponse[1] && parsedResponse[1]?.trim().toLowerCase().includes(noMistakesSequence.trim().toLowerCase()))) {
            return true;
        }
    }

    return false;
}
export function trimStartMessageSequence(response: string): string {
    for (let startMessageSequence of startMessageSequences) {
        if (response.startsWith(startMessageSequence)) {
            return response.slice(startMessageSequence.length);
        }
    }
    return response;
}

function clearString(str: string) {
    const UNNECESSARY_CHAR = [
        " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "　",
        "\n", "\r", ".", "!", "?", "…", ",", ";", ":", "'", "/", "\\",
        "-", "—", "–", "\"", "«", "»", "“", "”", "‘", "’"];
    let output = str.toLowerCase().trim();
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

export function containsnoMistakesSequences(response: string): boolean {
    return response.includes(noMistakesSequences);
}

export function parseResponse(response: string): Array<string> {
    let explanations = "";
    let messageBody = "";
    for (let explanationDelimiter of explanationDelimiters) {
        let parsedResponse = response.split(explanationDelimiter);
        if (parsedResponse.length > 1) {
            explanations = parsedResponse.pop()?.trim() ?? "";
            messageBody = parsedResponse.join(explanationDelimiter).trim();
            break;
        }
        messageBody = response;
    }

    return [messageBody, explanations];
}

export function beautifyResponse(response: string): string {
    // const parsedResponse = parseResponse(response);
    // const explanations = parsedResponse[1];
    // const messageBody = parsedResponse[0];

    // const output = (messageBody ? messageBodyDelimiter + "```" + messageBody + "```\n" : "") + (explanations ? explanationDelimiter + explanations : "") + (endDisclaimer ? "\n-# " + endDisclaimer : "");
    const output = (response ? messageBodyDelimiter + "```" + response + "```" : "")
    return output;
}

