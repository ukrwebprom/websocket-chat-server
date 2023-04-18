const WebSocket = require('ws');
var sr = require('simple-random');
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port:PORT });
let users = [];
let killTimeout = {};
let ping = {}

console.log("Welcome to websocket chat server", PORT);

const noSuchUser = (uid) => {
    if(users.find(u => u.userID === uid) === undefined) return true;
    else return false;
}
const sendToAll = (id, message) => {
    users.filter(u => u.chatID === id).forEach(e => {e.ws.send(JSON.stringify(message))});
}
const getChatUsers = (chatID) => {
    const usersList = users.filter(u => u.chatID === chatID).map(u => {
        return {
            userID: u.userID, 
            photo: u.photo, 
            name: u.name
          }
    })
    console.log(usersList);
    return usersList;
}

const removeUser = (zombie) => {
    console.log('zombie:', zombie);
    const chat = users.find(u => u.userID === zombie).chatID;
    for( var i = 0; i < users.length; i++){ 
                                   
        if ( users[i].userID === zombie) { 
            users.splice(i, 1); 
            break;
        }
    }

    clearTimeout(killTimeout);
    clearInterval(ping);
    console.log('removed');
    
    sendToAll(chat, {message:'lm319', users:getChatUsers(chat)});
}

server.on('connection', (ws) => {
    console.log('connected');
    let currentUser = null;

    const sendPing = () => {
        ws.send(JSON.stringify({message:'ping'}));
    }
    ping = setInterval(sendPing, 5000);

    

    ws.on('message', message => {
        const data = JSON.parse(message);
        if(data.message === 'lm318') {
            if(noSuchUser(data.userID)) {
                currentUser = data.userID;
                console.log('chat id:', data.chatID);
                console.log('new user:', currentUser );
                const newUser ={
                    ws,
                    chatID:data.chatID,
                    userID:data.userID,
                    photo:data.photo,
                    name:data.name,
                }
                users.push(newUser);
                
                sendToAll(data.chatID, {message:'lm319', users:getChatUsers(data.chatID)});}
            }
        else {
            console.log("got message:", data.message);
            sendToAll(data.chatID, {message:data.message, userID:data.userID, messID:sr()});
        }

        ws.on('close', () => {
            console.log('closed');
            removeUser(data.userID);
            //killTimeout = setTimeout(removeUser, 10000, data.userID);
        })
    })
})