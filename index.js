const WebSocket = require('ws');
var sr = require('simple-random');
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port:PORT });
const users = [];
let killTimeout = {};
let ping = {}
let currentUser = null;
console.log("Welcome to websocket chat server", PORT);

const noSuchUser = (uid) => {
    if(users.find(u => u.userID === uid) === undefined) return true;
    else return false;
}
const sendToAll = (id, message) => {
    users.filter(u => u.chatID === id).forEach(e => {e.ws.send(JSON.stringify(message))});
}

const removeUser = (zombie) => {
    console.log('zombie:', zombie);
    const chat = users.find(u => u.userID === zombie).chatID;
    users.map(u => u.userID !== zombie);
    clearTimeout(killTimeout);
    clearInterval(ping);
    console.log('removed');
    const userlist = users.map(u => {
        return {
          userID: u.userID, 
          photo: u.photo, 
          name: u.name
        }
      })
    sendToAll(chat, {message:'lm319', users:userlist});
}

server.on('connection', (ws) => {
    console.log('connected');
    
    const sendPing = () => {
        ws.send(JSON.stringify({message:'ping'}));
    }
    ping = setInterval(sendPing, 5000);

    ws.on('close', () => {
        console.log('closed');
        killTimeout = setTimeout(removeUser, 10000, currentUser);
    })

    ws.on('message', message => {
        const data = JSON.parse(message);
        if(data.message === 'lm318') {
            if(noSuchUser(data.userID)) {
                currentUser = data.userID;
                console.log('new user:', currentUser );
                const newUser ={
                    ws,
                    chatID:data.ID,
                    userID:data.userID,
                    photo:data.photo,
                    name:data.name,
                }
                users.push(newUser);
                const userlist = users.map(u => {
                    return {
                      userID: u.userID, 
                      photo: u.photo, 
                      name: u.name
                    }
                  })
                sendToAll(data.ID, {message:'lm319', users:userlist});}
            }
        else sendToAll(data.ID, {message:data.message, userID:data.userID, messID:sr()});
    })
})