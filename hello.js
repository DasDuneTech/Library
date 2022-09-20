// * Basic HTTP server
const express = require('express');
const app = express();
// const cors = require('cors');
// app.use(cors({
//     origin: "*",
//     credentials: true,
// }));

const port = 8080;

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

// JSON parsing
app.use(express.json({ limit: '50mb' }));

app.get('/hello', async (req, res) => {
    
    let hello = `Hello`
    res.send(hello) 
    
    })

app.get('/world', async (req, res) => {

    let world = `World`
    res.send(world) 

})












