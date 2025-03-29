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
    // Get the user's idea
    const idea = promptInput.value;
    
    // Check if user typed something
    if (idea === '') {
        alert("Please enter a story idea first!");
        return;
    }
    
    // Get the genre and length
    const genre = genreDropdown.value;
    const length = lengthDropdown.value;
    
    // Show user's request
    showUserMessage("Create a " + genre + " story about: " + idea);
    
    // Clear input field
    promptInput.value = '';
    
    // Show loading message
    const loadingMessage = showBotMessage("Working on your story... please wait!");
    
    try {
        // Get story from AI
        const story = await getStoryFromAI(idea, genre, length);
        
        // Remove loading message
        storyBox.removeChild(loadingMessage);
        
        // Show the story
        showBotMessage(story);
    } catch (error) {
        // Remove loading message
        storyBox.removeChild(loadingMessage);
        
        // Show error
        showBotMessage("Sorry, I couldn't create your story. Try again!");
        console.log("Error:", error);
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
