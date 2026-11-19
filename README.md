# Minimal AI Chat — CS 121 Capstone Project

A responsive client-side web application built with semantic HTML5, CSS3, and vanilla JavaScript that connects to LLMs via OpenRouter[cite: 1].

## Setup & Deployment
No build tools, frameworks, or backend server are required[cite: 1, 3].
1. Clone or download the repository.
2. Open `index.html` directly in a web browser (or visit the live Netlify URL).
3. Enter a valid OpenRouter API key and click **Save**[cite: 2].

## Model / Router ID
- **Router ID:** `openrouter/free`[cite: 3]
- Requests are sent via `POST` to `https://openrouter.ai/api/v1/chat/completions` with `stream: false`[cite: 3].

## `localStorage` Usage
- `openRouterKey`: Stores the visitor's API key locally in the browser so it persists across page refreshes[cite: 1, 2]. Clicking **Forget key** removes it from both `localStorage` and memory[cite: 1].
- `chatHistory`: Stores the conversation array (`role` and `content`) as a JSON string using `JSON.stringify()` and restores it with `JSON.parse()`[cite: 3].

## Completed Bonus Features (+10 Points)
1. **New Chat (+2 pts):** Clears the active conversation display and resets context without deleting the saved API key[cite: 3].
2. **Chat History (+4 pts):** Persists conversation messages in `localStorage`, sends full message history for contextual follow-ups, and provides **Restore History** and **Clear History** controls[cite: 3].
3. **File Upload (+4 pts):** Supports `.txt` attachments up to 50 KB[cite: 3]. Displays the filename, allows removal before sending, reads content via `File.text()`, and appends it to the user prompt[cite: 3].

## Known Limitations
- Free models via `openrouter/free` are subject to rate limits and occasional temporary unavailability[cite: 3].
- File attachments are restricted to plain text (`.txt`) files under 50 KB; PDFs and images are not supported[cite: 3].
- Because this is a pure frontend app, each user must supply their own API key[cite: 1].

## Checks Performed
- Sent valid questions and verified real responses from OpenRouter[cite: 3].
- Tested validation for blank questions, missing API keys, and invalid API keys[cite: 1, 3].
- Verified loading state (`Status: Thinking...`), button disabling to prevent duplicate requests, and recovery in `finally` on network/API errors[cite: 1, 3].
- Tested key persistence across browser refresh and removal via **Forget key**[cite: 2, 3].
- Tested all three bonuses (New Chat context reset, history persistence/restore/clear, and `.txt` file reading/rejection)[cite: 3].
- Checked responsive stacking and text wrapping on mobile and desktop viewports[cite: 2, 3].

## AI Usage Statement
Gemini AI was used as an interactive tutor to structure the architecture, debug DOM/Git issues, and review edge cases. Every code block was read, understood, manually integrated, and tested in the browser and live Netlify environment.