# Capri AI — CS 121 Capstone Project

A Cyberpunk-inspired, client-side AI chat web application built with semantic HTML5, modern CSS3 (Dark & Light themes), and vanilla JavaScript. It connects directly to Large Language Models via OpenRouter without requiring a backend server.

## Setup & Deployment
No build tools, frameworks, or server-side setup are required:
1. Clone or download the repository.
2. Open `index.html` in a browser or visit the live Netlify deployment.
3. Click **Set API Key** (top right) or **Capri Config** (bottom left) to enter and save your OpenRouter API key.

## Model / Router ID
- **Router ID:** `openrouter/free`
- Requests are sent via `POST` to `https://openrouter.ai/api/v1/chat/completions` with `stream: false`.

## `localStorage` Usage
- `openRouterKey`: Stores the visitor's API key locally in the browser so it persists across reloads. Clicking **Forget key** removes it from both `localStorage` and active memory.
- `capriConversations` & `chatHistory`: Stores saved conversation threads (`id`, `title`, and `messages` array) using `JSON.stringify()` and `JSON.parse()` so past chats remain accessible in the sidebar.
- `capriTheme`: Saves the user's preferred color mode (`dark` or `light`).
- `capriCustomAvatar`: Optionally stores a custom avatar image uploaded by the user.

## Completed Bonus Features (+10 Points)
1. **New Chat (+2 pts):** Clears the active conversation context and starts a fresh thread without deleting the saved API key.
2. **Chat History (+4 pts):** Persists multiple conversations in the left sidebar via `localStorage`, sends full conversation context for follow-up questions, and provides **Restore** and **Clear History** controls.
3. **File Upload (+4 pts):** Supports `.txt` file attachments up to 50 KB. Displays a removable file chip, validates file type and size, reads content via `File.text()`, and appends it to the user's prompt.

## Additional UI & Formatting Features
- **Safe Markdown Renderer:** Formats assistant responses into clean headings, bold/italic text, lists, inline code badges, and fenced code blocks with a one-click **Copy** button.
- **Responsive Sidebar & Theme Switcher:** Collapsible conversation sidebar for mobile/desktop viewports and instant Dark/Light mode toggle.

## Known Limitations
- Free models routed through `openrouter/free` are subject to provider rate limits and occasional temporary unavailability.
- File attachments are restricted to plain text (`.txt`) files under 50 KB; binary files such as PDFs or images are rejected.
- Because this is a pure frontend application, each visitor must supply their own OpenRouter API key.

## Checks Performed
- Tested real multi-turn conversations and verified contextual memory across follow-up prompts.
- Tested input validation for empty prompts, missing API keys, and invalid API keys.
- Verified loading states (`Status: Thinking...`), Send button disabling during requests, and error recovery in `finally`.
- Tested API key persistence across page refreshes and deletion via **Forget key**.
- Verified all three bonus features (New Chat reset, sidebar history persistence/restore/clear, and `.txt` file attachment/validation).
- Tested responsive layout and keyboard focus visibility across mobile and desktop screen sizes.

## AI Usage Statement
Gemini AI was used as an interactive learning assistant to structure the application architecture, debug Git/DOM issues, and refine edge-case handling. Every feature was manually integrated, inspected, and tested locally and on Netlify.