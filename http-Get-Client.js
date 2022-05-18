const fetch = require('node-fetch');

const hello = async() => {

    const res = await fetch(`http://localhost:8080/hello`)
    let res2 = await res.text()

    console.log(res2)

}

const hello2 = async() => {

    const res = await fetch(`http://localhost:8080/hello2/?firstName=John&lastName=Doe`)
    let res2 = await res.text()

    console.log(res2)

}

hello()

// hello2()