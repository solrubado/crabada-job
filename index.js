// Dependencies
require('dotenv').config()
const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const port = 80;
const url = 'https://api.telegram.org/bot';
const apiToken = process.env.API_TOKEN;

// Configurations
app.use(bodyParser.json());

// Endpoints
app.post('/', (req, res) => {
     console.log(req.body);
     const name = req.body.message.from.first_name
     const chat_id = req.body.message.chat.id
     axios.post(`${url}${apiToken}/sendMessage`,
               {
                    chat_id: chat_id,
                    text: `hello ${name}`
               })
               .then((response) => { 
                   console.log(response)
                    res.status(200).send(response);
               }).catch((error) => {
                    res.send(error);
               });
});


// Listening
app.listen(port, () => {
     console.log(`Listening on port ${port}`);
});
