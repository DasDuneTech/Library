const fetch = require('node-fetch');

const postReq= async() => {

    let info = {firstName: `John`, lastName: `Doe`}
    let url = `http://localhost:8080/post`

    let res = await fetch(url, 
        {
        method: 'POST',    
        body: JSON.stringify(info)
    });
    let res2  = await res.json()

    console.log(res2)

}

postInfo()