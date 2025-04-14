// Set up API information
const API_KEY = 'AIzaSyCb1nLFsDCrxsFTGcLFLRvyCmBb6nr9Kso';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY;

// Get elements from the page
const storyBox = document.getElementById('chat-container');
const promptInput = document.getElementById('user-input');
const storyButton = document.getElementById('send-button');
const genreDropdown = document.getElementById('genre-select');
const lengthDropdown = document.getElementById('length-select');

// Add click event to button
storyButton.addEventListener('click', makeStory);

// Add enter key event to input box
promptInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        makeStory();
    }
});

// Show welcome message when page loads
window.onload = function() {
    showBotMessage("Welcome to the Story Generator! Type an idea and I'll create a story for you!");
};

// Main function to create a story
async function makeStory() {
    const idea = promptInput.value.trim();

    if (idea === '') {
        alert("Please enter a story idea first!");
        return;
    }

    // 🚫 Block known bad patterns (SQL, code, HTML, etc.)
    const forbiddenPatterns = [
        /SELECT|INSERT|DELETE|UPDATE|FROM|WHERE|DROP/i,
        /<[^>]+>/,
        /function\s*\(|=>|console\.log|let\s+|const\s+|var\s+/i,
        /#include|System\.out\.println|public\s+class/i,
        /<script\b[^>]*>(.*?)<\/script>/i
    ];
    if (forbiddenPatterns.some(pattern => pattern.test(idea))) {
        showBotMessage("⚠️ Your input looks like code or instructions. Please enter a *story idea*, not code or SQL.");
        return;
    }

    const genericInputs = [
        "hello", "hi", "how are you", "what’s up", "hey", "ok", "good morning", "good evening"
    ];
    const lowered = idea.toLowerCase();
    if (genericInputs.includes(lowered) || lowered.split(" ").length < 4) {
        showBotMessage("❌ That doesn't sound like a story idea. Please try something like: *A lonely astronaut finds a talking rock on Mars*.");
        return;
    }

    const genre = genreDropdown.value;
    const length = lengthDropdown.value;

    showUserMessage("Create a " + genre + " story about: " + idea);
    promptInput.value = '';

    const loadingMessage = showBotMessage("Working on your story... please wait!");

    try {
        const story = await getStoryFromAI(idea, genre, length);
        storyBox.removeChild(loadingMessage);
        showBotMessage(story);
    } catch (error) {
        storyBox.removeChild(loadingMessage);
        showBotMessage("Sorry, I couldn't create your story. Try again!");
        console.error("Error:", error);
    }
}


// Function to get story from AI
async function getStoryFromAI(idea, genre, length) {
    // Set story length
    let wordCount = "300";
    if (length === "medium") {
        wordCount = "600";
    } else if (length === "long") {
        wordCount = "1000";
    }
    
    // Create prompt for AI
    const prompt = "Write a " + genre + " story based on this idea: \"" + idea + "\". Make it about " + wordCount + 
        " words. Include a beginning, middle, and end.";
    
    // Prepare data for API
    const data = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };
    
    // Send request to AI
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    // Check if request worked
    if (!response.ok) {
        throw new Error("API request failed");
    }
    
    // Get and return the story
    const responseData = await response.json();
    return responseData.candidates[0].content.parts[0].text;
}

// Function to show user message
function showUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = message;
    storyBox.appendChild(messageDiv);
    storyBox.scrollTop = storyBox.scrollHeight;
    return messageDiv;
}

// Function to show bot message
function showBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.textContent = message;
    storyBox.appendChild(messageDiv);
    storyBox.scrollTop = storyBox.scrollHeight;
    return messageDiv;
}
