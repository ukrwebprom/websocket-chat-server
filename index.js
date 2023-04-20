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

server.on('connection', (ws, req) => {
    const url = new URL(req.url, 'wss://tranquil-reaches-58824.herokuapp.com/');
    const chatID = url.searchParams.get('chatID');
    const userID = url.searchParams.get('userID');
    const photo = url.searchParams.get('photo');
    const name = url.searchParams.get('name');
    console.log('connected', chatID, userID  );
    if(noSuchUser(userID)) {
        const newUser ={
            ws,
            chatID,
            userID,
            photo,
            name,
        }
        users.push(newUser);
        
    } else {
        users.find(u => u.userID === userID).ws = ws;
    }
    const newUser ={
        ws,
        chatID,
        userID,
        photo,
        name,
    }

    sendToAll(chatID, {message:'lm319', users:getChatUsers(chatID)});

    const sendPing = () => {
        ws.send(JSON.stringify({message:'ping'}));
    }
    sendPing();
    ping = setInterval(sendPing, 5000);

    ws.on('close', () => {
        console.log('closed');
        removeUser(userID);
        clearInterval(ping);
        //killTimeout = setTimeout(removeUser, 10000, data.userID);
    })

    ws.on('message', message => {
        const data = JSON.parse(message);
        console.log("got message:", data.message, "chatID:", chatID);
        sendToAll(chatID, {message:data.message, userID, messID:sr()});
    })
})