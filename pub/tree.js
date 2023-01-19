//common library
import {popEle} from './lib/lib.js'

let ele, ele2, ele3

const root = document.querySelector(':root'); 

 //folders tree toggle function on click event
let toggle = async(e) => {

    // [...e.target.parentElement.querySelectorAll(".nested")].map( i => i.classList.toggle("active"))
    e.target.parentElement.querySelector(".nested").classList.toggle("active");
    let toggleType = `item-clicked`
    e.target.classList.toggle(toggleType)
    e.stopPropagation()
  }
  
  // Topics
  ele = popEle({e: `li`, i:`Microsoft`, p:document.getElementById('treeRoot')})
  popEle({e: `span`, c:`topic Microsoft`, t:`Microsoft`, p:ele})
  ele.addEventListener("click", (e) => toggle(e))
  // root.style.setProperty('--topicIcon', 'url("./img/Microsoft24.png")');

  ele = popEle({e: `li`, i:`Google`, p:document.getElementById('treeRoot')})
  popEle({e: `span`, c:`topic Google`, t:`Google`, p:ele})
  ele.addEventListener("click", (e) => toggle(e))
  // root.style.setProperty('--topicIcon', 'url("./img/Google24.png")');

  ele = popEle({e: `li`, i:`Amazon`, p:document.getElementById('treeRoot')})
  popEle({e: `span`, c:`topic`, t:`Amazon`, p:ele})
  ele.addEventListener("click", (e) => toggle(e))

  ele3 = document.getElementById(`Microsoft`)

  // Titles
  ele = popEle({e: `ul`, c:`nested`, p:ele3})
  ele2 = popEle({e: `li`, p:ele})
  popEle({e: `span`, c:`title OneDrive`, t:`OneDrive`, p:ele2})
  ele2.addEventListener("click", (e) => toggle(e))

  ele = popEle({e: `ul`, c:`nested`, p:ele2})
  ele2 = popEle({e: `li`, c:`desc`, t:`Description`,p:ele})
  ele2 = popEle({e: `li`, c:`index`, t:`Chapter-1`,p:ele})
  ele2 = popEle({e: `li`, c:`index`, t:`Chapter-2`,p:ele})
  // ele2.addEventListener("click", (e) => toggle(e))


  ele3 = document.getElementById(`Google`)

  // Titles
  ele = popEle({e: `ul`, c:`nested`, p:ele3})
  ele2 = popEle({e: `li`, p:ele})
  popEle({e: `span`, c:`title OneDrive`, t:`OneDrive`, p:ele2})
  ele2.addEventListener("click", (e) => toggle(e))

  ele = popEle({e: `ul`, c:`nested`, p:ele2})
  ele2 = popEle({e: `li`, c:`desc`, t:`Description`,p:ele})
  ele2 = popEle({e: `li`, c:`index`, t:`Chapter-1`,p:ele})
  ele2 = popEle({e: `li`, c:`index`, t:`Chapter-2`,p:ele})
  // ele2.addEventListener("click", (e) => toggle(e))


  
  ele3 = document.getElementById(`Amazon`)

  // Titles
  ele = popEle({e: `ul`, c:`nested`, p:ele3})
  ele2 = popEle({e: `li`, p:ele})
  popEle({e: `span`, c:`title OneDrive`, t:`OneDrive`, p:ele2})
  ele2.addEventListener("click", (e) => toggle(e))

  ele = popEle({e: `ul`, c:`nested`, p:ele2})
  ele2 = popEle({e: `li`, c:`desc`, t:`Description`,p:ele})
  ele2 = popEle({e: `li`, c:`index`, t:`Chapter-1`,p:ele})
  ele2 = popEle({e: `li`, c:`index`, t:`Chapter-2`,p:ele})
  // ele2.addEventListener("click", (e) => toggle(e))


  let popInfo = (e) => {

    if (e.target.parentElement.children.length > 1) 
      {
        toggle(e)
        return
      }

    ele = popEle({e: `ul`, c:`nested`, p:e.target.parentElement})

    ele2 = popEle({e: `li`, p:ele})
    popEle({e: `span`, c:`item`, t:`OneDrive`, p:ele2})
    ele2.addEventListener("click", (e) => toggle(e))

    ele = popEle({e: `ul`, c:`nested`, p:ele2})
    
    ele2 = popEle({e: `li`, t:`chapter-1`, p:ele})
    ele2.addEventListener("click", (e) => alert(`goto index 1`))
    ele2 = popEle({e: `li`, t:`chapter-2`, p:ele})
    ele2.addEventListener("click", (e) => alert(`goto index 2`))

    // ele2 = popEle({e: `li`, p:ele})
    // popEle({e: `span`, c:`item`, t:`Registration`, p:ele2})
    // ele.addEventListener("click", (e) => toggle(e))

    toggle(e)



  }





