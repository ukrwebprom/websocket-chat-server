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

const updateChat = (receivers) => {
    receivers.forEach(u => {
        const res = users.find(cur => cur.Hash === u.hash);
        console.log('receiver:', res);
        if(res) res.ws.send(JSON.stringify({message:'need_upd'}));
    })
}

app.get('/chat', (req, res) => {
    const chat = chats.find(c => c.id === req.query.id);
    if(chat) res.send(chat.users);
    else res.send(null);
  })

app.post('/chat', (req, res) =>{
    const chatID = req.body.id;
    console.log("params:", chatID);
    const chat = chats.find(c => c.id === chatID);
    if(!chat) {
        const n = chats.push({id:chatID, users:[]});
        res.send(chats[n-1]);
    }
    else throw new Error('CHAT IS EXIST');
})

app.put('/chat', (req, res) =>{
    const chatID = req.body.id;
    const chat = chats.find(c => c.id === chatID);
    console.log('chat to enter:', chatID)
    if(chat) {
        chat.users.push({hash: req.body.hash, uid:req.body.uid});
        updateChat(chat.users);
        res.send(chat.users);
    }
    else throw new Error('CHAT IS NOT EXIST');
})

httpServer.listen(port, () => {console.log('listening')})

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