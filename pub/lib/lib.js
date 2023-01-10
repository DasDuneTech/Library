// * Library 

//global variables
let ele, ele2, ele3

//*functions

//populate DOM elements
export const popEle = (info) =>{

  try {

  const {e, i, c, t, p, v} = info
  
    let ele = document.createElement(e)
    if (i !== undefined) ele.id = i
    if (c !== undefined) ele.className = c
    if (t !== undefined) ele.textContent = t
    if (p !== undefined) p.appendChild(ele)
    if (v !== undefined) ele.value = v
    return ele
  }
  catch(err) {
    console.log(err.message)
    return(err.message)
  }
}




