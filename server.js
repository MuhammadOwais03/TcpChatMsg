const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const users = {};  // To track connected users by their usernames

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Handle video-start message
            if (data.type === 'video-start') {
                const recipientSocket = users[data.to];
                if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
                    // Notify recipient about video call
                    recipientSocket.send(JSON.stringify({
                        type: 'video-start',
                        from: data.from,
                        message: `${data.from} is starting a video call!`
                    }));
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Recipient not available for video call!' }));
                }
            }
            // Handle text message
            else if (data.type === 'message') {
                const recipientSocket = users[data.to];
                if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
                    recipientSocket.send(JSON.stringify({
                        type: 'message',
                        from: ws.username,
                        message: data.message,
                    }));
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Recipient not available!' }));
                }
            }
            // Handle registration
            else if (data.type === 'register') {
                users[data.username] = ws;
                ws.username = data.username;
                ws.send(JSON.stringify({ type: 'status', message: 'Registered successfully!' }));
            }
        } catch (error) {
            console.error('Error handling message:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format!' }));
        }
    });

    ws.on('close', () => {
        if (ws.username) {
            delete users[ws.username];
            console.log(`User disconnected: ${ws.username}`);
        }
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
