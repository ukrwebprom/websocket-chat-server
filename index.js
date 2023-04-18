const WebSocket = require('ws');
var sr = require('simple-random');
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port:PORT });
const users = [];
let killTimeout = {};
let ping = {}
console.log("Welcome to websocket chat server", PORT);

const noSuchUser = (uid) => {
    if(users.find(u => u.uid === uid) === undefined) return true;
    else return false;
}
const sendToAll = (id, message) => {
    users.filter(u => u.chatID === id).forEach(e => {e.ws.send(JSON.stringify(message))});
}

const removeUser = (currentUser) => {
    users.map(u => u.uid !== currentUser);
    clearTimeout(killTimeout);
    clearInterval(ping);
    console.log('removed');
}

server.on('connection', (ws) => {
    console.log('connected');
    let currentUser = null;
    const sendPing = () => {
        ws.send(JSON.stringify({message:'ping'}));
    }
    ping = setInterval(sendPing, 5000);

    ws.on('close', () => {
        console.log('closed');
        killTimeout = setTimeout(removeUser, 10000, {currentUser});
    })

    ws.on('message', message => {
        const data = JSON.parse(message);
        if(data.message === 'lm318') {
            if(noSuchUser(data.userID)) {
                currentUser = data.userID;
                const newUser ={
                    ws,
                    chatID:data.ID,
                    uid:data.userID,
                    photo:data.photo,
                    name:data.name,
                }
                users.push(newUser);
                sendToAll(data.ID, {message:'lm319', currentID:data.userID, photo:data.photo, name:data.name});}
            }
        else sendToAll(data.ID, {message:data.message, currentID:data.userID, messID:sr()});
    })
})