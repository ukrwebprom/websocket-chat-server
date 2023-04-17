const WebSocket = require('ws');
var sr = require('simple-random');
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port:PORT });
const users = [];
console.log("Welcome to websocket chat server", PORT);

const noSuchUser = (uid, chatID) => {
    if(users.find(u => u.uid === uid && u.chatID === chatID) === undefined) return true;
    else return false;
}
const sendToAll = (id, message) => {
    users.filter(u => u.chatID === id).forEach(e => {e.ws.send(JSON.stringify(message))});
}

server.on('connection', (ws) => {
    console.log('connected');

    ws.on('close', () => {
        console.log('closed');
    })

    ws.on('message', message => {
        const data = JSON.parse(message);
        if(data.message === 'lm318') {
            if(noSuchUser(data.uid, data.ID)) {
                const newUser ={
                    ws,
                    chatID:data.ID,
                    uid:data.uid,
                    photo:data.photo,
                    name:data.name,
                    online:true
                }
                users.push(newUser);
                sendToAll(data.ID, {message:'lm319', uid:data.uid, photo:data.photo, name:data.name});}
            }
        else sendToAll(data.ID, {message:data.message, uid:data.uid, messID:sr()});
    })
})