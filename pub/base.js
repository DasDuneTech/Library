const init = (async() => {

    let cors = `https://cors-anywhere.herokuapp.com/`

    // let res = await fetch(`https://library-qm2c6ml5ua-uc.a.run.app/getSheetsValues`)
    // // let res = await fetch(`http://127.0.0.1:8080/`)
    // let data = await res.json()

    // let header= data.values.shift()

    let data = [
        [
            "Name",
            "Description",
            "Link",
            "Time",
            "Note"
        ],
        [
            "Video-1",
            "Video-1 description-1",
            "Link-1"
        ],
        [
            "",
            "Video-1 description-time-1",
            "",
            4
        ],
        [
            "",
            "Video-1 description-time-2",
            "",
            6
        ],
        [
            "",
            "Video-1 description-time-3",
            "",
            8
        ],
        [
            "Video-2",
            "Video-2 description-1",
            "Link-1"
        ],
        [
            "",
            "Video-2 description-time-1",
            "",
            4
        ],
        [
            "",
            "Video-2 description-time-2",
            "",
            6
        ],
        [
            "",
            "Video-2 description-time-3",
            "",
            8
        ],
        [
            "Video-3",
            "Video-3 description-1",
            "Link-1"
        ],
        [
            "",
            "Video-3 description-time-1",
            "",
            4
        ],
        [
            "",
            "Video-3 description-time-2",
            "",
            6
        ],
        [
            "",
            "Video-3 description-time-3",
            "",
            8
        ]
    ]

    data.map((row, i) => {

        if (row[0] !== ``) console.log(`New video ${row[0]} Description ${row[1]} Link ${row[2]} `)
        else console.log(`Time ${row[3]} Description ${row[1]}`)



    })
})

// https://library-qm2c6ml5ua-uc.a.run.app/getSheetsValues

init()