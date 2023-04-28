const express = require('express');
var cors = require('cors');
const http = require('http');
const WebSocketServer = require('ws');
const port = process.env.PORT || 8080;
const app = express();
app.use(cors());
var sr = require('simple-random');

let users = [];
const chats = [];
let ping = {}

const httpServer = http.createServer(app);
const server = new WebSocketServer.WebSocketServer({server: httpServer});

app.get('/chat', (req, res) => {
    const chat = chats.find(c => c.id === req.query.id);
    if(chat) res.send(chat.users);
    else throw new Error('NO SUCH CHAT');
  })

app.post('/chat', (req, res) =>{
    const chatID = req.query.id;
    const chat = chats.find(c => c.id === chatID);
    if(!chat) {
        const n = chats.push({id:chatID});
        res.send(chats[n-1]);
    }
    else throw new Error('CHAT IS EXIST');
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