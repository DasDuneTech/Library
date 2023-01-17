//common library
import {popEle} from './lib/lib.js'

// let serverUrl = `https://library-qm2c6ml5ua-uc.a.run.app`
let serverUrl = `http://localhost:8080`
let arrPrefix, arrSuffix = []
let indexStart
let videosListArr = []

//check if video title already exists, if yes, fill the chapters tree with its info
document.getElementById(`videoTitle`).addEventListener('change', async() =>{ 

  let title = document.getElementById(`videoTitle`).value
  let isTitleExists = false
  let videoDescDone = false
  
  for (let row of videosListArr) {

    //check if video info exists 
    if (row[0] === title || isTitleExists) 
    {
      isTitleExists = true
    
      //process video desc only once
      if (row[0] !==`` && !videoDescDone) 
        {

          let parent = document.getElementById('treeContainer')
          while (parent.childNodes[2]) {parent.removeChild(parent.childNodes[2])}

          document.getElementById(`videoUrl`).value = row[3]
          document.getElementById(`video`).src = document.getElementById(`videoUrl`).value
          popEle({e:`input`, c:`videoDesc`, v:row[1], p:document.getElementById('treeContainer')})
          videoDescDone = true
          indexStart = videosListArr.indexOf(row)
          arrPrefix = videosListArr.slice(0, indexStart)
          arrSuffix=[]
          continue
        }

        //process all the chapters
        if (row[0] !==``) {
          arrSuffix =videosListArr.slice(videosListArr.indexOf(row))
          return
        }
        let ele = popEle({e:`div`, c:`videoChapter`, p:document.getElementById('treeContainer')})
        let time = popEle({e:`div`, c:`time`, t:row[2], p:ele})
        time.addEventListener('click', (e) =>{e.target.parentElement.remove()})
        popEle({e:`input`, c:`chapter`, v: row[1], p:ele})  
    }
  }
})

// index chapters
document.getElementById(`indexIcon`).addEventListener('click', () =>{

  let ele = popEle({e:`div`, c:`videoChapter`, p:document.getElementById('treeContainer')})
  let time = popEle({e:`div`, c:`time`, p:ele})
  time.addEventListener('click', (e) =>{e.target.parentElement.remove()})
  time.textContent = Math.round(document.getElementById(`video`).currentTime).toString()
  popEle({e:`input`, c:`chapter`, v:`put chapter comment`, p:ele})
})

// download video
document.getElementById(`downloadIcon`).addEventListener('click', () =>{
  document.getElementById(`video`).src = document.getElementById(`videoUrl`).value
})

//save video info
document.getElementById(`saveIcon`).addEventListener('click', async() =>{
  let videoInfoEle = [...document.getElementById(`treeContainer`).children]

  let videoRowInfo = []
  let videoInfo = []

  //Push header info
  videoRowInfo.push(videoInfoEle[0].value)
  videoRowInfo.push(videoInfoEle[1].value)
  videoRowInfo.push(``)
  videoRowInfo.push(document.getElementById(`videoUrl`).value)
  videoInfo.push(videoRowInfo)

  //Get rid of title and desc
  videoInfoEle.shift()  
  videoInfoEle.shift()

  //Push chapters info
  for (let item of videoInfoEle) {

    videoRowInfo = []
    videoRowInfo.push(``)
    videoRowInfo.push(item.children[1].value)
    videoRowInfo.push(parseInt(item.children[0].textContent))
    videoRowInfo.push(``)
    videoInfo.push(videoRowInfo)
  }

  let videoInfoAll = [...arrPrefix, ...videoInfo, ...arrSuffix] 

  //clear sheet before rewriting in case the new range is less than the current range
  let info = {range:`A2:D${videosListArr.length + 100}`} 
  let idToken = `whocare`
  try {
    let res = await fetch(`${serverUrl}/clear`, 
    { method: `POST`,
      headers: {'Content-Type': `application/json`},
      body:JSON.stringify(info)})
    if(!res.ok) throw `Cannot clear the sheet :: ${res.statusText}`
    
    //set new video info
    info = {range:`A2:D${videoInfoAll.length + 1}`, values:videoInfoAll} 

    //update sheet
    res = await fetch(`${serverUrl}/update`, 
    { method: `POST`,
      headers: {'Content-Type': `application/json`},
      body:JSON.stringify(info)})
    if(!res.ok) throw `Cannot update the sheet :: ${res.statusText}`
  }
  catch(err){
    console.trace()
    console.log(err)
  }
})

const init = (async() => {

  try {
    //get videos info list
    let res = await fetch(`${serverUrl}/getSheetsValues`)
    if(!res.ok) throw `Cannot read the sheet :: ${res.statusText}`
    let data = await res.json()
    data.values.shift()
    videosListArr =data.values
    
    //starts with full list array if title not found
    arrPrefix = videosListArr
  }
  catch(err){
    console.trace()
    console.log(err)
  }
})() 



