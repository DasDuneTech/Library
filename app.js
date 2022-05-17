// * Basic node js REST application 
const express = require('express');
const app = express();
const port = 8080;

app.listen(port, () => {
    console.log(`TagLinker listening at port ${port}`);
});

app.get('/', async (req, res) => {

    res.send(`Hello word`)

})