const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port:PORT });
const users = [];

const checkUser = (uid) => {
    return users.find(u => {u.uid === uid})
}
const sendToAll = (id, message) => {
    users.filter(u => u.user.ID === id).forEach(e => {e.ws.send(JSON.stringify(message))});
}

server.on('connection', (ws) => {

    ws.on('close', () => {
        
    })

    ws.on('message', message => {
        const user = JSON.parse(message);
        if(!checkUser(user.uid)) users.push(
            {
                ws,
                user
            }
            
        )
        sendToAll(user.ID, user);
    })
})