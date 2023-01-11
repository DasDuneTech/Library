//common library
import {popEle} from './lib/lib.js'


const popVideoTitles = async(e) => {

    if (e.target.className !== `title`) return

    if (e.target.children.length !== 0) return 

    let res = await fetch(`./json/${e.target.textContent}.json`)
        let data = await res.text()

        let videoInfo = JSON.parse(data)
        const {url, desc, indexes} = videoInfo

        document.getElementById(`video`).src = url

        let ele = popEle({e:`h2`, c:`desc`, t:desc, p:document.getElementById(e.target.id)})
        // let ele2 = popEle({e:`div`, c:`timeInfo`, p:document.getElementById('test')})

        indexes.map((item) => {

            ele = popEle({e:`div`, c:`timeInfo`, p:document.getElementById(e.target.id)})
            // popEle({e:`h3`, c:`time`, t:item.time, p:ele})
            ele = popEle({e:`h3`, c:`timeDesc`, t:item.desc, p:ele})
            ele.addEventListener('click', (e) =>{
                document.getElementById(`video`).currentTime = item.time
                e.stopPropagation()
             })
        

        })

        // popEle({e:`h3`, c:`time`, t:`1`, p:ele2})
        // popEle({e:`h3`, c:`timeDesc`, t:`Chapter 1`, p:ele2})
    


        // console.log(data)
};

const init = (async() => {

    let res = await fetch(`./json/videosList.json`)
    let data = await res.text()
  
    let videosList = JSON.parse(data)
    const {list} = videosList

    list.map((item) => {

        let ele = popEle({e:`h1`, c:`title`, i:item.title, t:item.title, p:document.getElementById('treeContainer')})
        ele.addEventListener('click', popVideoTitles)
    })
  })()

