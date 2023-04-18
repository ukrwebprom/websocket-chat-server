const WebSocket = require('ws');
var sr = require('simple-random');
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port:PORT });
const users = [];
let killTimeout = {};
let ping = {}
console.log("Welcome to websocket chat server", PORT);

const noSuchUser = (uid, chatID) => {
    if(users.find(u => u.uid === uid && u.chatID === chatID) === undefined) return true;
    else return false;
}
const sendToAll = (id, message) => {
    users.filter(u => u.chatID === id).forEach(e => {e.ws.send(JSON.stringify(message))});
}

const removeUser = (currentUser) => {
    users.map(u => u.uid !== currentUser.uid && u.chatID !== currentUser.ID);
    clearTimeout(killTimeout);
    clearInterval(ping);
    console.log('removed');
}

server.on('connection', (ws) => {
    console.log('connected');
    const currentUser = {};
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
            if(noSuchUser(data.uid, data.ID)) {
                currentUser.uid = data.uid;
                currentUser.ID = data.ID;
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