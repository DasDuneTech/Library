// * Library 

//global variables
let ele, ele2, ele3

//*functions

//populate DOM elements
const popEle = (info) =>{

    try {
  
    const {e, i, c, t, p} = info
    
      let ele = document.createElement(e)
      if (i !== undefined) ele.id = i
      if (c !== undefined) ele.className = c
      if (t !== undefined) ele.textContent = t
      p.appendChild(ele)
      return ele
    }
    catch(err) {
      console.log(err.message)
      return(err.message)
    }
  }

//Add folders in tree when tree parent is clicked (toggle event)
const popFolder = async(elem) =>{

    let items = await getFilesList({folderId:elem.id})
    console.log(items)
  
    //add a parent sibling by default even if no folder will be find
    ele2 = popEle({e: `ul`, c:`nested`, p:elem.parentElement})
  
    //clear books list 
    // while (booksList.firstChild) booksList.removeChild(booksList.lastChild);
  
    // items.map(async(item) =>{
    for (let item of items) {
  
      if (isFolder(item)) {
  
        ele = popEle({e: `li`, p:ele2})
        ele3 = popEle({e: `span`, i:`${item.id}`, c:`folder`, t:`${item.name}`, p:ele})
        ele3.addEventListener("click", (e) => toggleFolders(e))
  
      }
  
      if (isBook(item)) {
        ele = popEle({e: `li`, p:ele2})
        ele3 = popEle({e: `span`, i:`${item.id}`, c:`sheets`, t:`${item.name}`, p:ele})
        ele3.addEventListener("click", (e) => toggleBook(e))
      }
    }
  }

//toggle folders tree
let toggleFolders = async(e) => {
  if (e.target.nextElementSibling === null) await popFolder(e.target)
  toggle(e)
}

const init = (async() =>{

    //folders tree root level 
    ele = popEle({e:`ul`, i:`tree`, p:document.getElementById('foldersTree')})
    ele2 = popEle({e: `li`, p:ele})
    let foldersRoot = popEle({e: `span`, i:`Library`, c:`folders`, t: `root`, p:ele2})
    foldersRoot.addEventListener("click", (e) => toggleFolders(e))
    await popFolder(foldersRoot)  
    toggle({target: foldersRoot})

})()


