
# Spellscord - Your Discord spell checking assistant

Spellscord is a Discord bot powered by Groq's powerful LLM, designed to pop out of nowhere and provide relevant correction to messages containing spelling mistakes.

## Features

* **Customizable System Prompt:** TODO
* **Event-Driven Architecture:** Spellscord utilizes Discord.js events to efficiently handle interactions, commands, and incoming messages.
* **Configuration Options:**  Basic configuration settings are available in `config.json`, TODO

## Prerequisites

* **Node.js:** Version 18 or later ([https://nodejs.org/](https://nodejs.org/)).
* **pnpm:**  Package manager ([https://pnpm.io/](https://pnpm.io/)).
* **Discord Bot Token:**  Obtain a bot token from the Discord Developer Portal ([https://discord.com/developers/applications](https://discord.com/developers/applications)).
* **Groq API Key:** Create an account and get your API key from Groq ([https://console.groq.com/](https://console.groq.com/)).

## Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Truiteseche/spellscord.git
   cd spellscord
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

   TODO
5. **Build and Run:**

   ```bash
   pnpm run build  # Compiles TypeScript code
   pnpm run main   # Starts the bot
   ```

## Usage

* **Invite Spellscord to your Server:**  Generate an invite link from the Discord Developer Portal for your bot.
* **Interact with Spellscord:** Once Spellscord is in your server and active in the configured categories, send messages in those channels to initiate conversations.
* **Developer Commands:** Use the `/debug` slash command for testing and troubleshooting.

## Customization

* **System Prompt:**  Edit `src/ai/AI.ts` to refine Spellscord' responses:
  * Modify the system instructions, guidelines, and database to align with your needs.
* **Commands and Events:**  Extend Spellscord's functionality by creating new commands in `src/commands` and events in `src/events`.
* **Advanced Configuration:** (Future Development) Implement more robust configuration options for role-based access control and bot management.

## Contributing

Contributions are welcome! Please open issues for bug reports or feature requests. Feel free to submit pull requests for code enhancements or bug fixes.

## License

This project is licensed under the GNU General Public License v3.0.
