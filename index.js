const express = require('express');
var cors = require('cors');
const http = require('http');
const WebSocketServer = require('ws');
const port = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
var sr = require('simple-random');

const users = [];
const chats = [];
let ping = {}

const httpServer = http.createServer(app);
const server = new WebSocketServer.WebSocketServer({server: httpServer});

const getUserByHash = (hash) => users.find(u => u.Hash === hash);
const sendToAll = (chatID, message) => chats.find(c => c.id === chatID).users.forEach(u => u.ws.send(JSON.stringify({message:message})));

/* check if the chat exist and return chat users or null */
app.get('/chat', (req, res) => { 
    const chat = chats.find(c => c.id === req.query.id);
    if(chat) res.send(JSON.stringify(chat.users));
    else res.send(null);
  })

/* create a new chat and put empty array of users. return new chat object */
app.post('/chat', (req, res) =>{
    const chatID = req.body.id;
    console.log("params:", chatID);
    const chat = chats.find(c => c.id === chatID);
    if(!chat) {
        const n = chats.push({id:chatID, users:[]});
        res.send(chats[n-1]);
        console.log("chats:", chats);
    }
    else throw new Error('CHAT IS EXIST');
})

/* add user to chat */
app.post('/chat/user', (req, res) =>{
    const chatID = req.body.id;
    const Hash = req.body.hash;
    const uid = req.body.uid;
    const chat = chats.find(c => c.id === chatID);
    console.log('chat to enter:', chatID)
    if(chat) {
        chat.users.push({hash:Hash, uid:uid});
        sendToAll(chatID, 'need_upd');
        res.send(chat.users);
    }
    else throw new Error('CHAT IS NOT EXIST');
})

httpServer.listen(port, () => {console.log('listening')})

/* const sendToAll = (id, message) => {
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
} */

const removeUser = (zombieHash) => {
    
    if(typeof getUserByHash(zombieHash) !== 'undefined') {

        for( var i = 0; i < users.length; i++){ 
                                       
            if ( users[i].Hash === zombieHash) { 
                users.splice(i, 1); 
                break;
            }
        }
    }
    const chat = chats.find(c => c.users.find(u => u.hash === zombieHash));
    console.log(chat);
    
}


server.on('connection', (ws, req) => {
    const url = new URL(req.url, 'wss://tranquil-reaches-58824.herokuapp.com/');
    const Hash = url.searchParams.get('Hash');

    if(!users.find(u => u.Hash === Hash)) users.push({ws, Hash});

    const sendPing = () => {
        ws.send(JSON.stringify({message:'ping'}));
    }

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