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
    users.filter(u => u.chatID === id).forEach(e => {
        console.log('send');
        e.ws.send(JSON.stringify(message))});
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
    const zombieObject = users.find(u => u.userID === zombie);
    if(typeof zombieObject !== 'undefined') {
        const chat = zombieObject.chatID;
        for( var i = 0; i < users.length; i++){ 
                                       
            if ( users[i].userID === zombie) { 
                users.splice(i, 1); 
                break;
            }
        }
        console.log('removed');
        
        sendToAll(chat, {message:'lm319', users:getChatUsers(chat)});
    }
    
}

server.on('connection', (ws) => {

    const sendPing = () => {
        ws.send(JSON.stringify({message:'ping'}));
    }
    sendPing();
    ping = setInterval(sendPing, 5000);

    ws.on('close', () => {
        console.log('closed');
        removeUser(userID);
        clearInterval(ping);
    })

    ws.on('message', message => {
        const data = JSON.parse(message);
        console.log("got message:", data.message, "chatID:", chatID);
        if(data.message === 'intro') {
            const newUser ={
                ws,
                chatID:data.chatID,
                userID:data.userID,
                photo:data.photo,
                name:data.name,
            }
            users.push(newUser);
            sendToAll(data.chatID, {message:'lm319', users:getChatUsers(data.chatID)});
            
        } else sendToAll(chatID, {message:data.message, userID, messID:sr()});
    })
})