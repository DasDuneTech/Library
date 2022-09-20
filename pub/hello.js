


    const hello = (async() =>{

        let h1 = document.getElementsByTagName('h1')[0]
        // h1.textContent = `Hello`

        let res = await fetch(`http://localhost:8080/hello`, {mode: "no-cors"});
        let info = await res.text()
        h1.textContent = info


    })() 

    // const world = (async() =>{

    //     let h1 = document.getElementsByTagName('h1')[1]
    //     // h1.textContent = `World`

    //     let res = await fetch(`http://localhost:8080/world`, {mode: "no-cors"});
    //     let info = await res.text()
    //     h1.textContent = info

    // } )()


console.log('dstop')



