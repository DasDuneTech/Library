//common library
import {popEle} from './lib/lib.js'

document.getElementById(`indexIcon`).addEventListener('click', () =>{

  let ele = popEle({e:`div`, c:`videoChapter`, p:document.getElementById('treeContainer')})
  let time = popEle({e:`div`, c:`time`, p:ele})
  time.addEventListener('click', (e) =>{e.target.parentElement.remove()})
  time.textContent = Math.round(document.getElementById(`video`).currentTime).toString()
  let chapter = popEle({e:`input`, c:`chapter`, p:ele})
  chapter.value = `put chapter comment`
})

document.getElementById(`downloadIcon`).addEventListener('click', () =>{
  document.getElementById(`video`).src = document.getElementById(`videoUrl`).value
})

document.getElementById(`saveIcon`).addEventListener('click', () =>{
  let videoInfo = [...document.getElementById(`treeContainer`).children]

  let videoUrl = {url:document.getElementById(`videoUrl`).value}
  let title = videoInfo[0].value
  let videoTitle = {title: videoInfo[0].value}
  let videoDesc = {desc: videoInfo[1].value}
  videoInfo.shift()  
  videoInfo.shift()

  let chaptersArr = []
  let obj
  for (let item of videoInfo) {

    obj = {time:item.children[0].textContent, desc:item.children[1].value}
    chaptersArr.push(obj)
  }
  let chapters= {indexes:chaptersArr}
  let videoInfoObj = {...videoUrl, ...videoTitle, ...videoDesc, ...chapters}
  createFile(title, JSON.stringify(videoInfoObj)) 
})


const createFile = (title, jsonFile) => {
    var blob = new Blob([jsonFile], {
        type: "text/plain;charset=utf-8",
    });
    saveAs(blob, `${title}.json`);
  }



  let videoJSON = {
 
  title:"video title",
  desc:"video description",
  chapters: [{time:3, timeDesc: "this is about.."}]
  }