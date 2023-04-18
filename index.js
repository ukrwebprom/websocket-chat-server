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

server.on('connection', (ws, req) => {
    const url = new URL(req.url, 'wss://tranquil-reaches-58824.herokuapp.com/');
    const chatID = url.searchParams.get('chatID');
    const userID = url.searchParams.get('userID');
    const photo = url.searchParams.get('photo');
    const name = url.searchParams.get('name');
    if(noSuchUser(userID)) {
        const newUser ={
            ws,
            chatID,
            userID,
            photo,
            name,
        }
        users.push(newUser);
        sendToAll(chatID, {message:'lm319', users:getChatUsers(chatID)});
    }

    console.log('connected', chatID, userID  );

    const sendPing = () => {
        ws.send(JSON.stringify({message:'ping'}));
    }
    ping = setInterval(sendPing, 5000);

    ws.on('close', () => {
        console.log('closed');
        removeUser(data.userID);
        //killTimeout = setTimeout(removeUser, 10000, data.userID);
    })

    ws.on('message', message => {
        const data = JSON.parse(message);
        console.log("got message:", data.message);
        sendToAll(chatID, {message:data.message, userID, messID:sr()});
    })
})