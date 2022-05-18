// * Basic HTTP Post server
const express = require('express');
const app = express();

const port = 8080;

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

//* JSON parsing
app.use(express.json({ limit: '50mb' }));

//*FormData parsing ?
const multer = require('multer');
const upload = multer();

// for parsing multipart/form-data
app.use(upload.array()); 





app.post('/hello', async (req, res) => {

    try{
        const {firstName, lastName} = req.body
        res.send(`Hello ${firstName} ${lastName}`)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }

})


