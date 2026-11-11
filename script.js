const apiKeyInput = document.getElementById('api-key');
const saveBtn = document.getElementById('save-btn');
const forgetBtn = document.getElementById('forget-btn');

// Variable to hold the key in memory
let apiKey = '';

// 1. Load the key from the browser's storage when the page opens
window.onload = () => {
    const savedKey = localStorage.getItem('openRouterKey');
    if (savedKey) {
        apiKey = savedKey;
        apiKeyInput.value = savedKey;
    }
};

// 2. Save the key when the Save button is clicked
saveBtn.addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('openRouterKey', apiKey);
        alert('API Key saved successfully!');
    }
});

// 3. Remove the key when the Forget button is clicked
forgetBtn.addEventListener('click', () => {
    apiKey = '';
    apiKeyInput.value = '';
    localStorage.removeItem('openRouterKey');
    alert('API Key removed.');
});
const questionInput = document.getElementById('user-question');
const sendBtn = document.getElementById('send-btn');
const chatHistory = document.getElementById('chat-history');
const statusText = document.getElementById('status-text');

sendBtn.addEventListener('click', async () => {
    const question = questionInput.value.trim();
    
    // 1. Validation: Don't send if missing key or question
    if (!apiKey) {
        alert("Please save your API key first!");
        return;
    }
    if (!question) {
        alert("Please type a question!");
        return;
    }

    // 2. UI Updates: Show the question and lock the button
    chatHistory.innerHTML += `<div style="margin-bottom: 10px; padding: 10px; background: #e3f2fd;"><b>You:</b> ${question}</div>`;
    questionInput.value = '';
    statusText.textContent = "Status: Thinking...";
    sendBtn.disabled = true;

    // 3. The API Request
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [{ role: "user", content: question }],
                stream: false
            })
        });

        // Check if OpenRouter rejected the key or request
        if (!response.ok) {
            throw new Error("API error. Check your key or try again.");
        }

        // 4. Read the answer and display it
        const data = await response.json();
        const answer = data.choices[0].message.content;

        chatHistory.innerHTML += `<div style="margin-bottom: 10px; padding: 10px; background: #f5f5f5; border-left: 4px solid #ccc;"><b>Assistant:</b> ${answer}</div>`;
        statusText.textContent = "Status: Ready";

    } catch (error) {
        // Handle failures cleanly
        statusText.textContent = "Status: An error message";
        alert("Something went wrong: " + error.message);
    } finally {
        // 5. Always unlock the button at the end, even if it failed
        sendBtn.disabled = false;
    }
});