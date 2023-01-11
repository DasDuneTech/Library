//common library
import {popEle} from './lib/lib.js'


document.getElementById(`test`).addEventListener('click', async(e) =>{

    if (e.target.className !== `title`) return

    if (e.target.children.length !== 0) return 

    let res = await fetch(`./json/test.json`)
        let data = await res.text()

        let videoInfo = JSON.parse(data)
        const {url, desc, indexes} = videoInfo

        document.getElementById(`video`).src = url

        let ele = popEle({e:`h2`, c:`desc`, t:desc, p:document.getElementById('test')})
        // let ele2 = popEle({e:`div`, c:`timeInfo`, p:document.getElementById('test')})

        indexes.map((item) => {

            ele = popEle({e:`div`, c:`timeInfo`, p:document.getElementById('test')})
            popEle({e:`h3`, c:`time`, t:item.time, p:ele})
            ele = popEle({e:`h3`, c:`timeDesc`, t:item.desc, p:ele})
            ele.addEventListener('click', (e) =>{
                document.getElementById(`video`).currentTime = e.target.previousSibling.textContent
                e.stopPropagation()
             })
        

        })

        // popEle({e:`h3`, c:`time`, t:`1`, p:ele2})
        // popEle({e:`h3`, c:`timeDesc`, t:`Chapter 1`, p:ele2})
    


        // console.log(data)
});

