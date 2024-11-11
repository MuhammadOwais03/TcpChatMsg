const ws = new WebSocket('ws://localhost:8080');

const chat = document.getElementById('chat');
const usernameInput = document.getElementById('usernameInput');
const recipientInput = document.getElementById('recipientInput');
const messageInput = document.getElementById('messageInput');
const registerBtn = document.getElementById('registerBtn');
const sendBtn = document.getElementById('sendBtn');
const startVideoBtn = document.getElementById('startVideoBtn');
const videoContainer = document.getElementById('videoContainer');

let username = '';

// Register the user
registerBtn.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        ws.send(JSON.stringify({ type: 'register', username }));
        usernameInput.disabled = true;
        registerBtn.disabled = true;
        addMessage(`You are registered as ${username}`);
    }
});

// Send a text message to the specified recipient
sendBtn.addEventListener('click', () => {
    const recipient = recipientInput.value.trim();
    const message = messageInput.value.trim();

    if (recipient && message) {
        ws.send(JSON.stringify({ type: 'message', to: recipient, message }));
        addMessage(`You (to ${recipient}): ${message}`);
        messageInput.value = '';
    }
});

// Start video call
startVideoBtn.addEventListener('click', () => {
    const recipient = recipientInput.value.trim();
    
    if (recipient) {
        const message = {
            type: 'video-start',
            from: username,  // sender's username
            to: recipient,   // recipient's username
            message: 'User is starting a video call!'
        };
        
        // Send the message to the server
        ws.send(JSON.stringify(message));
        addMessage(`You (to ${recipient}): Starting video call...`);
    }
});

// Handle incoming messages
ws.onmessage = async (event) => {
    try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
            addMessage(`${data.from}: ${data.message}`);
        } else if (data.type === 'video-start') {
            // Display video call start notification
            addMessage(`${data.from} is starting a video call!`);
            // Optionally, prompt the user to accept or decline the call
            startVideoCall();
        } else if (data.type === 'status' || data.type === 'error') {
            addMessage(`System: ${data.message}`);
        }
    } catch (error) {
        console.error('Failed to parse message:', error);
    }
};

// Display messages in the chat box
function addMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    chat.appendChild(messageElement);
    chat.scrollTop = chat.scrollHeight;
}

// Handle video call functionality
async function startVideoCall() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // Create a video element for the local user
        const localVideo = document.createElement('video');
        localVideo.srcObject = stream;
        localVideo.autoplay = true;
        localVideo.muted = true;
        videoContainer.appendChild(localVideo);

        // Add logic for sending/receiving video streams here
        // (e.g., using WebRTC or WebSocket with UDP for video data)

        console.log('Video call started!');
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
}
