// * Basic HTTP Post server
const express = require('express');
const app = express();
const port = 8080;

app.listen(port, () => {
    console.log(`TagLinker listening at port ${port}`);
});

app.post('/hello', async (req, res) => {

    let info = req.body

    let firstName = info.firstName
    let lastName = info.lastName

    res.send(`Hello ${firstName} ${lastName}`)

})
