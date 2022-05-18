const fetch = require('node-fetch');
const FormData = require('form-data');

//*Post request with JSON
const postReqJSON= async() => {

    let data = {firstName: "John", lastName: "Doe"}
    let url = `http://localhost:8080/hello`

    let res = await fetch(url, 
        {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify(data)
    });
    
    let res2  = await res.text()

    console.log(res2)

}

//*Post request with FormData
const postReqFormData= async() => {

    const formData2 = new FormData();
    formData2.append('firstName', 'John');
    formData2.append('lasttName', 'Doe');

    let url = `http://localhost:8080/hello`

    let res = await fetch(url, 
        {
        method: 'POST',
        body: formData2
    });
    
    let res2  = await res.text()

    console.log(res2)

}


// postReqJSON()

postReqFormData()