
export async function loadTranslations(language: string) {
    try {
        // Dynamically import the translation file based on the selected language
        const translationsModule = await import(`../locales/${language}/translation`);
        return translationsModule.default;
    } catch (error) {
        console.error(`Failed to load translations for language ${language}:`, error);
        return {};
    }
}
