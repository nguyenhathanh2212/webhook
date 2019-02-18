// 'use strict';

// // Imports dependencies and set up http server
// const
//   express = require('express'),
//   bodyParser = require('body-parser'),
//   app = express().use(bodyParser.json()); // creates express http server
// const request = require('request');
const PAGE_ACCESS_TOKEN = 'EAAJbJx9SGZA8BAJMXa9e4drcjX1b6LOQkpzftnVYvWtirzyC63ThxPJQqgZCCIbN1h2sG8hioS3x3HgY6jqaAVHxTztkfwARyMTST4BZBdFlSpZA8yzXveHeyh0VTDyh1wfZAmiSMtJx1GOZBdEcTr6ZBy5TdIePjzeLGD9j6OxZAjHguSIdyFv3';
// // Sets server port and logs message on success
// app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

// app.get('/', (req, res) => {
//   res.send("Server running");
// });

// // Creates the endpoint for our webhook 
// app.post('/webhook', (req, res) => {  
 
//   let body = req.body;

//   // Checks this is an event from a page subscription
//   if (body.object === 'page') {

//     // Iterates over each entry - there may be multiple if batched
//     body.entry.forEach(function(entry) {

// 	  // Gets the body of the webhook event
// 	  let webhook_event = entry.messaging[0];
// 	  console.log(webhook_event);


// 	  // Get the sender PSID
// 	  let sender_psid = webhook_event.sender.id;
// 	  console.log('Sender PSID: ' + sender_psid);
// 	  res.send(sender_psid);

// 	  // Check if the event is a message or postback and
// 	  // pass the event to the appropriate handler function
// 	  if (webhook_event.message) {
// 	    handleMessage(sender_psid, webhook_event.message);        
// 	  } else if (webhook_event.postback) {
// 	    handlePostback(sender_psid, webhook_event.postback);
// 	  }
	  
// 	});

//     // Returns a '200 OK' response to all requests
//     res.status(200).send('EVENT_RECEIVED');
//   } else {
//     // Returns a '404 Not Found' if event is not from a page subscription
//     res.sendStatus(404);
//   }

// });

// // Adds support for GET requests to our webhook
// app.get('/webhook', (req, res) => {

//   // Your verify token. Should be a random string.
//   let VERIFY_TOKEN = "thanh123"
    
//   // Parse the query params
//   let mode = req.query['hub.mode'];
//   let token = req.query['hub.verify_token'];
//   let challenge = req.query['hub.challenge'];
    
//   // Checks if a token and mode is in the query string of the request
//   if (mode && token) {
  
//     // Checks the mode and token sent is correct
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
//       // Responds with the challenge token from the request
//       console.log('WEBHOOK_VERIFIED');
//       res.status(200).send(challenge);
    
//     } else {
//       // Responds with '403 Forbidden' if verify tokens do not match
//       res.sendStatus(403);      
//     }
//   }
// });

// function handleMessage(sender_psid, received_message) {

//   let response;

//   // Check if the message contains text
//   if (received_message.text) {    

//     // Create the payload for a basic text message
//     response = {
//       "text": `You sent the message: "${received_message.text}". Now send me an image!`
//     }
//   }  
  
//   // Sends the response message
//   callSendAPI(sender_psid, response);    
// }

// function callSendAPI(sender_psid, response) {
//   // Construct the message body
//   let request_body = {
//     "recipient": {
//       "id": sender_psid
//     },
//     "message": response
//   }

//   // Send the HTTP request to the Messenger Platform
//   request({
//     "uri": "https://graph.facebook.com/v2.6/me/messages",
//     "qs": { "access_token": PAGE_ACCESS_TOKEN },
//     "method": "POST",
//     "json": request_body
//   }, (err, res, body) => {
//     if (!err) {
//       console.log('message sent!')
//     } else {
//       console.error("Unable to send message:" + err);
//     }
//   }); 
// }

// # SimpleServer
// A simple chat bot server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
var request = require("request");

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});

// Đây là đoạn code để tạo Webhook
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'thanh123') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// Xử lý khi có người nhắn tin cho bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        // If user send text
        if (message.message.text) {
          var text = message.message.text;
          console.log(text); // In tin nhắn người dùng
          sendMessage(senderId, "Tui là bot đây: " + text);
        }
      }
    }
  }

  res.status(200).send("OK");
});


// Gửi thông tin tới REST API để trả lời
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: PAGE_ACCESS_TOKEN,
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});