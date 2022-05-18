// * Basic HTTP Get server
const express = require('express');
const app = express();
const port = 8080;

app.listen(port, () => {
    console.log(`TagLinker listening at port ${port}`);
});

app.get('/hello', async (req, res) => {

    let info = req.query

    res.send(`Hello whoever you are`)

})

app.get('/hello2', async (req, res) => {

    let info = req.query

    firstName = req.query.firstName
    lastName = req.query.lastName
  
    res.send(`Hello ${firstName} ${lastName}`)

})