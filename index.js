const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port:PORT });
const users = [];
console.log("Welcome to websocket chat server", PORT);

const checkUser = (uid) => {
    console.log('find:', uid);
    return users.find(u => u.user.uid === uid);
}
const sendToAll = (id, message) => {
    users.filter(u => u.user.ID === id).forEach(e => {e.ws.send(JSON.stringify(message))});
}

server.on('connection', (ws) => {
    console.log('connected');

    ws.on('close', () => {
        console.log('closed');
    })

    ws.on('message', message => {
        const data = JSON.parse(message);
        console.log(data);
        if(!checkUser(data.uid)) 
            users.push(
            {
                ws,
                data
            })
    
        sendToAll(user.ID, data);
    })
})