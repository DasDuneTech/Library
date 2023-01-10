  //common library
    import {popEle} from './lib/lib.js'
 
 
 //folders tree toggle function on click event
let toggle = async(e) => {
    [...e.target.parentElement.querySelectorAll(".nested")].map( i => i.classList.toggle("active"))
    let toggleType = `item-clicked`
    e.target.classList.toggle(toggleType)
  }
  
  let ele = popEle({e:`ul`, i:`tree`, p:document.getElementById('treeRoot')})
  let ele2 = popEle({e: `li`, p:ele})
  ele = popEle({e: `span`, i:`item1`, c:`item`, t:`item 1`, p:ele2})
  ele.addEventListener("click", (e) => toggle(e))

  ele = popEle({e:`ul`, i:`tree`, p:document.getElementById('treeRoot')})
  ele2 = popEle({e: `li`, p:ele})
  ele = popEle({e: `span`, i:`item1`, c:`item`, t:`item 2`, p:ele2})
  ele.addEventListener("click", (e) => toggle(e))

  ele2 = popEle({e: `ul`, c:`nested`, p:ele.parentElement})
  ele2 = popEle({e: `li`, p:ele2})
  ele = popEle({e: `span`, i:`root`, c:`item`, t:`item 2-1`, p:ele2})
  ele.addEventListener("click", (e) => toggle(e))