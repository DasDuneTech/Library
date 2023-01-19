//common library
import {popEle} from './lib/lib.js'

// let serverUrl = `https://library-qm2c6ml5ua-uc.a.run.app`
// let serverUrl = `http://localhost:8080`
let videosListArr = []
let ele, ele2, ele3
let currentId

let serverUrl = location.origin

const topicClick = async(e) => {
    toggle(e)
    popTitles(e)
}

 //folders tree toggle function on click event
let toggle = async(e) => {
    [...e.target.parentElement.querySelectorAll(".nested")].map( i => i.classList.toggle("active"))
    if (e.target.nextSibling.className.includes(`active`)) {
        currentId = e.target.id
        if (document.getElementById(`video`).src !== e.target.dataset.url) document.getElementById(`video`).src = e.target.dataset.url
    }
    console.log(`stop`)
    // let toggleType = `item-clicked`
    // e.target.classList.toggle(toggleType)
  }

const popTitles = async(e) => {

    if (e.target.parentElement.children.length > 1) return

    //get videos info list
    let res = await fetch(`${serverUrl}/getSheetsValues?sheetName=${e.target.id}`)
    if(!res.ok) throw `Cannot read the sheet :: ${res.statusText}`
    let data = await res.json()
    data.values.shift()
    videosListArr = data.values

    for (let row of videosListArr) {

        if (row[0] !== ``) {

            //video title
            ele3 = popEle({e:`ul`, i:`tree`, c:`nested`, p:e.target.parentElement})
            ele2 = popEle({e: `li`, p:ele3})
            ele = popEle({e: `span`, i:row[0], c:`title`, t:row[0], p:ele2})
            ele.dataset.url = row[3]
            ele.setAttribute(`url`, row[3])
            ele.addEventListener("click", (e) => toggle(e))

            ele2 = popEle({e: `ul`, c:`nested`, p:ele.parentElement})
            ele2 = popEle({e: `li`, p:ele2})
            ele = popEle({e: `span`, i:`root`, c:`desc`, t:row[1], p:ele2})

            continue
        }
            ele2 = popEle({e: `ul`, c:`nested`, p:ele.parentElement})
            ele2 = popEle({e: `li`, p:ele2})
            ele = popEle({e: `span`, i:row[2], c:`index`, t:row[1], p:ele2})
            ele.addEventListener('click', (e) =>{
                if (document.getElementById(`video`).src !== e.target.dataset.url) document.getElementById(`video`).src = document.getElementById(currentId).dataset.url
                document.getElementById(`video`).currentTime = e.target.id
                e.stopPropagation()
            })
    }
}


const popVideoTitles = async(e) => {

    if (e.target.className !== `title`) return
    if (e.target.children.length !== 0) {
        
        if (document.getElementById(`video`).src !== e.target.dataset.url) document.getElementById(`video`).src = e.target.dataset.url
        return 
    }

    let title = e.target.textContent

    let isTitleExists = false
    let videoDescDone = false

    for (let row of videosListArr) {

        if (row[0] === title || isTitleExists) 
        {
          isTitleExists = true

            //process video desc only once
            if (row[0] !==`` && !videoDescDone) 
                {
                    document.getElementById(`video`).src = row[3]
                    popEle({e:`h2`, c:`desc`, t:row[1], p:e.target})
                    videoDescDone = true
                    continue
                }

            //process all the chapters
            if (row[0] !== ``) return
            // let ele = popEle({e:`div`, c:`timeInfo`, p:e.target})
            // popEle({e:`h3`, c:`time`, t:item.time, p:ele})
            let ele = popEle({e:`h3`, i:row[2], c:`timeDesc`, t:row[1], p:e.target})
            ele.addEventListener('click', (e) =>{
                if (document.getElementById(`video`).src !== e.target.dataset.url) document.getElementById(`video`).src = e.target.parentElement.dataset.url
                document.getElementById(`video`).currentTime = e.target.id
                e.stopPropagation()
             })
        }
    }



    // let res = await fetch(`./json/${e.target.textContent}.json`)
    //     let data = await res.text()

    //     let videoInfo = JSON.parse(data)
    //     const {url, desc, indexes} = videoInfo

    //     document.getElementById(`video`).src = url

    //     let ele = popEle({e:`h2`, c:`desc`, t:desc, p:document.getElementById(e.target.id)})
    //     // let ele2 = popEle({e:`div`, c:`timeInfo`, p:document.getElementById('test')})

    //     indexes.map((item) => {

    //         ele = popEle({e:`div`, c:`timeInfo`, p:document.getElementById(e.target.id)})
    //         // popEle({e:`h3`, c:`time`, t:item.time, p:ele})
    //         ele = popEle({e:`h3`, c:`timeDesc`, t:item.desc, p:ele})
    //         ele.addEventListener('click', (e) =>{
    //             document.getElementById(`video`).currentTime = item.time
    //             e.stopPropagation()
    //          })
        

    //     })

        // popEle({e:`h3`, c:`time`, t:`1`, p:ele2})
        // popEle({e:`h3`, c:`timeDesc`, t:`Chapter 1`, p:ele2})
    


        // console.log(data)
};

const init = (async() => {

    try {

        //get topics tree list (sheet name)
        let res = await fetch(`${serverUrl}/getSheetsList`)
        if(!res.ok) throw `Cannot read the sheet :: ${res.statusText}`
        let data = await res.json()

        for (let row of data.sheets) {

            //library topics
            ele = popEle({e:`ul`, i:`tree`, p:document.getElementById('treeRoot')})
            ele2 = popEle({e: `li`, p:ele})
            ele = popEle({e: `span`, i:row.properties.title, c:`topic`, t:row.properties.title, p:ele2})
            ele.addEventListener("click", (e) => topicClick(e))
        }
    }
    catch(err){
    console.trace()
    console.log(err)
    }

    })()



