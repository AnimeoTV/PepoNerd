
# Pepo Nerd - Your Discord spell checking assistant

Pepo Nerd is a Discord bot powered by Groq's powerful LLM, designed to pop out of nowhere and provide relevant correction to messages containing spelling mistakes.

## Features

* **Relevant correction when you need it:** Pops out of nowhere when a spelling / grammar mistake is detected so as to provide relevant corrections. It won't interfere if there's no significant mistake
* **Mistake explanations:** Provides "Text Diff" and explanations for mistakes so you don't make the same mistake twice
* **Configuration Options:**  You can manage in which channels and for which roles Pepo Nerd looks for mistakes. Basic configuration settings are available in `config.json`
* **Mute the bot:** With the /stfu command, mute the bot for you so that it no longer analyzes your messages
* **Killer features:** Bully Pepo Nerd as he's delightfully cringe, and display the "Top bulliers" ladder to see who's the best bullier

## Prerequisites

* **Node.js:** Version 18 or later ([https://nodejs.org/](https://nodejs.org/)).
* **pnpm:**  Package manager ([https://pnpm.io/](https://pnpm.io/)).
* **Discord Bot Token:**  Obtain a bot token from the Discord Developer Portal ([https://discord.com/developers/applications](https://discord.com/developers/applications)).
* **Groq API Key:** Create an account and get your API key from Groq ([https://console.groq.com/](https://console.groq.com/)).

## Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/AnimeoTV/PepoNerd.git
   cd PepoNerd
   ```

2. **Install Dependencies:**

   ```bash
   pnpm install 
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the following:

   ```plaintext
   GUILD_ID        =
   CLIENT_ID       =
   GROQ_API_KEY    =
   DISCORD_TOKEN   =
   ```

4. **Configuration:**
   Adjust settings in `config.json`:

   * `localization`: The langage that the bot uses. (You can add your own translations)
   * `channelCategories`: Channel 'categories' of the guild where the bot will be active
   * `channelsToIgnore`: Channels to ignore in those categories
   * `consideredRoles`: The bot will react only to users with those roles
   * and some other useful options you can tweak (check out `config.json`)

5. **Build and Run:**

   ```bash
   pnpm run build  # Compiles TypeScript code
   pnpm run dev    # Watch for code edits, compiles and run in realtime
   pnpm run main   # Starts the bot for prod
   ```

## Usage

* **Invite Pepo Nerd to your Server:**  Generate an invite link from the Discord Developer Portal for your bot.
* **Interact with Pepo Nerd:** Once Pepo Nerd is in your server and active in the configured categories, send messages in those channels to initiate conversations.
* **Developer Commands:** Use the `/debug` slash command for testing and troubleshooting.

## Customization

* **System Prompt:**  Edit `src/locales/<localization>/translation.ts` to refine Pepo Nerd' responses:
  * Modify the system context, guidelines, and few-shots to align with your needs.
* **Configure Pepo Nerd's behavior:**  Edit `config.json` and adapt Pepo Nerd's behavior and rules of engagement to your needs.
* **Commands and Events:**  Extend Pepo Nerd's functionality by creating new commands in `src/commands` and events in `src/events`.

## Contributing

Contributions are welcome! Please open issues for bug reports or feature requests. Feel free to submit pull requests for code enhancements or bug fixes.

## License

This project is licensed under the GNU General Public License v3.0.
