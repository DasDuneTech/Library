//common library
import {popEle} from './lib/lib.js'

let videosListArr = []
let ele, ele2, ele3, eleTopic
let currentId

let serverUrl = location.origin

const topicClick = async(e) => {

    await popTitles(e)
    toggle(e)
}

const titleClick = (e) => {

    popLinks(e)
    toggle(e)
}


 //folders tree toggle function on click event
let toggle = async(e) => {
    e.target.parentElement.querySelector(".nested").classList.toggle("active")
    if (e.target.nextSibling.className.includes(`active`)) {
        currentId = e.target.id
        if (document.getElementById(`video`).src !== e.target.dataset.url) document.getElementById(`video`).src = e.target.dataset.url
    }
    e.stopPropagation()
  }

const popTitles = async(e) => {

    if (e.target.parentElement.children.length > 1) return

    //get videos info list
    let res = await fetch(`${serverUrl}/getSheetsValues?sheetName=${e.target.id}`)
    if(!res.ok) throw `Cannot read the sheet :: ${res.statusText}`
    let data = await res.json()
    data.values.shift()
    videosListArr = data.values

    eleTopic = popEle({e:`ul`, c:`nested`, p:e.target.parentElement})

    for (let row of videosListArr) {

        if (row[0] !== ``) {

            //video title code
            ele2 = popEle({e: `li`, p:eleTopic})
            ele = popEle({e: `span`, i:row[0], c:`title ${row[0]}`, t:row[0], p:ele2})
            ele.dataset.url = row[3]
            ele.addEventListener("click", (e) => titleClick(e))

            ele3 = popEle({e: `ul`, c:`nested`, p:ele2})
            popEle({e: `li`, c:`desc`, t:row[1], p:ele3})

            row.splice(0,4)
            ele.dataset.links = row

            // for (let link of row) {
         
            //     ele= popEle({e: `div`, c:`link${row.indexOf(link)+1}Box`, p:document.getElementById(`container`)})
            //     ele2 = popEle({e: `a`, p:ele})
            //     ele2.href = `${link.split(`\n`)[1]}`
            //     popEle({e: `i`, c:`${link.split(`\n`)[0]}`, p:ele2})

            // }

            console.log(row)



            //* test

            continue
        }
            // rest of the video info after title
            ele= popEle({e: `li`, i:row[2], c:`index`, t:row[1], p:ele3})
            ele.addEventListener('click', (e) =>{
                if (document.getElementById(`video`).src !== e.target.dataset.url) document.getElementById(`video`).src = e.target.parentElement.previousSibling.dataset.url
                document.getElementById(`video`).currentTime = e.target.id
                e.stopPropagation()
            })
    }
}

const popLinks = async(e) => {

    let parent = document.getElementById('container')
    while (parent.children.length > 2) {parent.removeChild(parent.children[2])}

    let linksStr =  e.target.dataset.links
    let linksArr = linksStr.split(`,`)

        for (let link of linksArr) {
    
        ele= popEle({e: `div`, c:`link${linksArr.indexOf(link)+1}Box`, p:document.getElementById(`container`)})
        ele2 = popEle({e: `a`, p:ele})
        ele2.href = `${link.split(`\n`)[1]}`
        popEle({e: `i`, c:`${link.split(`\n`)[0]}`, p:ele2})

    }
}

const init = (async() => {

    document.getElementById(`header`).addEventListener('click', (e) =>{window.open("https://docs.google.com/spreadsheets/d/1r5hSM6ZJdZmsAdKu8bRKQ3qamkq9kLAV5KVKdFW86KQ/edit#gid=0")})

    try {

        //get topics tree list (sheet name)
        let res = await fetch(`${serverUrl}/getSheetsList`)
        if(!res.ok) throw `Cannot read the sheet :: ${res.statusText}`
        let data = await res.json()

        for (let row of data.sheets) {

            ele = popEle({e: `li`, i:`Microsoft`, p:document.getElementById('treeRoot')})
            popEle({e: `span`, i:row.properties.title, c:`topic ${row.properties.title}`, t:row.properties.title, p:ele})
            ele.addEventListener("click", (e) => topicClick(e))
        }
    }
    catch(err){
    console.trace()
    console.log(err)
    }

})()



