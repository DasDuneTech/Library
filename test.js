
let info = []
let ssIndex

let tags = 
[
    [`Library1`, `Sheet1!B4:B4`, 1],
    [`Library1`, `Sheet2!B3:B3`, 2],
    [`Library1`, `Sheet3!B6:B6`, 3],
    [`Library2`, `Sheet2!B8:B8`, 4],
    [`Library2`, `Sheet3!B2:B2`, 5],
    [`Library3`, `Sheet1!B7:B7`, 6],
    [`Library3`, `Sheet3!B3:B3`, 7],
]

tags.map((item) => {

    info.map((ss, i) => {if (ss[0]===item[0]) ssIndex = i})
    if (info.filter((ss) => {return ss[0]===item[0]}).length === 0) info.push([item[0], [[item[1], item[2]]]])
    else info[ssIndex][1].push([item[1], item[2]])
})

console.log(`done`)


