const express = require('express')
const http = require('http')
const WebSocketServer = require('ws')
const port = process.env.PORT || 8080
const app = express()


const httpServer = http.createServer(app);
const server = new WebSocketServer.WebSocketServer({server: httpServer});

app.get('/', (req, res) => {
    console.log(req);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.writeHead(200);
    res.setHeader("Content-Type", "application/json");
    res.send('Hello World!')
  })
httpServer.listen(port, () => {console.log('listening')})

/* const WebSocket = require('ws');
const http = require('http'); */
var sr = require('simple-random');
/* const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port:PORT }); */

let users = [];
const chats = [];
let ping = {}


/* const requestListener = (req, res) => {
    console.log(req);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.writeHead(200);
    res.setHeader("Content-Type", "application/json"); 
    res.end('Hello World from Node.js HTTP Server');
}
const httpServer = http.createServer(requestListener).listen('http//tranquil-reaches-58824.herokuapp.com/', PORT, 
    () => {console.log('hhtp server is running')}
); */
const noSuchUser = (hash) => {
    if(users.find(u => u.Hash === hash) === undefined) return true;
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
    const zombieObject = users.find(u => u.Hash === zombie);
    if(typeof zombieObject !== 'undefined') {
/*         const chat = zombieObject.chatID; */
        for( var i = 0; i < users.length; i++){ 
                                       
            if ( users[i].Hash === zombie) { 
                users.splice(i, 1); 
                break;
            }
        }
        console.log('removed');
        
/*         sendToAll(chat, {message:'lm319', users:getChatUsers(chat)}); */
    }
    
}

server.on('connection', (ws, req) => {
    const url = new URL(req.url, 'wss://tranquil-reaches-58824.herokuapp.com/');
    const Hash = url.searchParams.get('Hash');
    console.log('connected', Hash  );
    if(noSuchUser(Hash)) users.push({ws, Hash});

    const sendPing = () => {
        ws.send(JSON.stringify({message:'ping'}));
    }
    sendPing();

    ping = setInterval(sendPing, 5000);

    ws.on('close', () => {
        console.log('closed');
        removeUser(Hash);
        clearInterval(ping);
    })

    ws.on('message', message => {
        const data = JSON.parse(message);
        const mode = data.mode;
        console.log("got message:", mode);
        switch (mode) {
            case 0: //create new chat
                chats.push({id: data.data});
                console.log("new chat", chats);

        }
/*         sendToAll(chatID, {message:data.message, userID, messID:sr()}); */
    })
})