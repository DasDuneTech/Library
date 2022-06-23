//Excel functions library
const fetch = require('node-fetch');
const FormData = require('form-data');
// require('dotenv').config()
const fs = require('fs');
const { info } = require('console');

const msUrl = `https://login.microsoftonline.com/common/oauth2/v2.0`
const appClientId = `af712184-d7de-440f-ba14-c62d20ed45f5`
const perm = `offline_access%20User.Read%20Files.ReadWrite.All%20Sites.ReadWrite.All`
const appUri = `http://localhost:8080/tokenMicrosoft`

let token = ''
let tagsInfo = fs.readFileSync(`tags.txt`, 'utf8') 

let formulasObjArr = []
let partsObjArr = []
let sep = '-'
let isaPatt = new RegExp(`[a-z]{2,4}(?=${sep})`, 'i');
let addISA= ''
let filesList = []

//batch request object
const reqObj = {
    url: "/me/drive/items/4BF5108ECD128AC3!345/workbook/names/add",
    method: "POST",
    id: "1",
    body: {
        name: "TagName6",
        reference: "=Sheet1!$B$7:$K$7",
        comment: "Comment for the named item"
        },
    headers: {
        "Content-Type": "application/json"
    }
}

//delay function
delay = (time) => {return new Promise(resolve => setTimeout(resolve, time))}

const refreshToken = async(rToken, code) => {

    const formData2 = new FormData();
    formData2.append('client_id', appClientId);

    if (code) {
        formData2.append('redirect_uri', appUri);
        formData2.append('grant_type', 'authorization_code');
        formData2.append('code', rToken);
    }
    else{
        formData2.append('grant_type', 'refresh_token');
        formData2.append('refresh_token', rToken);
    }

    let url = `${msUrl}/token`

    let res = await fetch(url, 
        {
        method: 'POST',    
        body: formData2
    });
    
    let info  = await res.json()
    token = code ? info.refresh_token : info.access_token

    fs.writeFileSync('refreshToken.txt', info.refresh_token)

    return(token)

}

const getUsedRange = async(workbookId, worksheet) => {

    try {

        //Get the column values
        url = `https://graph.microsoft.com/v1.0/me/drive/items/${workbookId}/workbook/worksheets/${worksheet}/usedRange`
        
        response = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let usedRange  = await response.json()

        return usedRange
    }

    catch(err) {
        console.log(err)
        return {error:err}
    }

}

const deleteIndex = async(wbws) => {

    workbook = wbws[0]
    worksheet = wbws[1]

    all = fs.readFileSync(`tags.txt`, 'utf8') 

    regex = new RegExp(`@${workbook}[^@]*`, 'gi');
    wb = all.match(regex)
    wsCnt = wb[0].match(/~/g)

    regex = new RegExp(`~${worksheet}[^~]*`, 'gi');
    ws = wb[0].match(regex)

    if (wsCnt.length > 1) newWB = wb[0].replace(ws[0],'')
    else newWB = ''

    newIndex = all.replace(wb, newWB)
    fs.writeFileSync(`tags.txt`, newIndex) 

}

//tags index text file
const tagIndexer = async(workbook, workbookId, worksheet, tagNames, header) => {

    console.log(`Excel :: tagIndexer : ${workbook} - ${worksheet}`)

    //check for an index deletion request
    let wbwsArr = workbook.split('/')
    if (wbwsArr.length > 1) {
        deleteIndex(wbwsArr)
        return
    }
    
    let names = ``
    // let header = ``

    try {

        if (tagNames === undefined) {

            let lastrefreshToken = fs.readFileSync('refreshToken.txt', 'utf8') 
            token = await refreshToken(lastrefreshToken, false)

            url = `https://graph.microsoft.com/v1.0/me/drive/items/${workbookId}/workbook/worksheets('${worksheet}')/usedRange`
            res = await fetch(url, {headers: {Authorization: 'Bearer ' + token}});
            let usedRange  = await res.json()

            header = usedRange.values[0]
            usedRange.values.map((ur) => names += `§${ur[header.indexOf('Name')]}`)
            names += `§`

        }
        else names = tagNames

        let wb = ''
        let ws = ''
        let wbNew = ''
        let wsNew = ''

        all = fs.readFileSync(`tags.txt`, 'utf8') 

        workbook = `${workbook}¶${workbookId}`

        //check if workbook exists
        let regex = new RegExp(`@${workbook}`, 'gi');
        //get wb
        if (regex.test(all)) {
            regex = new RegExp(`@${workbook}[^@]*`, 'gi');
            wb = all.match(regex)
            }
        //create wb    
        else {
            wb += `@${workbook}`
            all += wb
        }

        //check if worksheet exists
        let wb2 = wb[0].length == 1 ? wb : wb[0] 
        regex = new RegExp(`~${worksheet}`, 'gi');
        //get ws
        if (regex.test(wb2)) {
            regex = new RegExp(`~${worksheet}[^~@]*`, 'gi');
            ws = wb2.match(regex)
            wsNew = `~${worksheet}&${names}`
            wbNew = wb2.replace(ws[0], wsNew)
            }
        //create ws    
        else {
            ws += `~${worksheet}&${names}`
            wbNew = wb + ws
            }

        let all2 = all.replace(wb2, wbNew)
        fs.writeFileSync(`tags.txt`, all2) 

        //refresh tagsInfo
        tagsInfo = fs.readFileSync(`tags.txt`, 'utf8') 

        if (header.indexOf('Cat') !== -1) {

            addISA = fs.readFileSync("ISA.txt", 'utf8');

            names.split('§').map((tagName) => {

                    newISA = isaPatt.exec(tagName);
                    if (newISA !== null) {
                        patt3 = new RegExp(`#${newISA[0]}`, `ig`);
                        if (!addISA.match(patt3)) {
                            addISA += `#${newISA}`;
                            console.log(`add a new ISA prefix : ${newISA}`);
                        }
                    }
                })

            fs.appendFileSync("ISA.txt", addISA);

        }

        //**   logic for ISA.txt */

        return(`Indexing success`)

    }

    catch(err) {

        console.log(err.stack)
        return(`Indexing failure`)

    }   
 
}

const tagInfo = async(tag) => {
  
    try {

        tag = tag.toString()

        //get tag's ref info
        let regex = new RegExp(`[^@]*${tag}[^@]*`, 'gi');
        let wb = tagsInfo.match(regex)

        //get workbook
        let wrkbook = wb[0].match(/[^~]*/)[0]
        let workbook = wrkbook.split('¶')[0]
        let workbookId = wrkbook.split('¶')[1]
    
        //get worksheet
        regex = new RegExp(`[^~]*§${tag}§[^~]*`, 'i');
        let ws = wb[0].match(regex)
        let worksheet = ws[0].match(/[^&]*/)[0]
        // console.log(ws[0])

        //get header
        // let keys = ws[0].match(/\^[^¥§]*/)
        // let header = keys[0].split(`^`)
        // header.shift()
        // header.pop()
        // console.log(keys)

        //get row index
        let rw = ws[0].match(/[^&]*$/)
        let rows = rw[0].split(`§`)
        rows.shift()
        rows.pop()
        let row = rows.indexOf(tag) 

        // if (row == -1) return (`no info found for tag : ${tag}`)
        if (row == -1) return ({workbook: -1, workbookId: -1, worksheet: -1, rows:-1, row:-1})
        else  return ({workbook: workbook, workbookId:workbookId, worksheet: worksheet, rows:rows, row:row})
    
    }
    
    catch(err) { 
        console.log(`excel::tagInfo cannot read info for tag ${tag}`)
        return ({workbook: -1, workbookId: -1, worksheet: -1, rows:-1, row:-1})
    }

}

//Microsoft limits the batch at 20 requests only.
const batch = async(reqArr) => {

    let reqs = {requests:reqArr}

    url = `https://graph.microsoft.com/v1.0/$batch`
    let res2 = await fetch(url, 
        {
        method: 'POST',    
        headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqs)
    });
    infoReq  = await res2.json()

    //check for request errors
    infoReq.responses.map((res) => { if (res.status !== 200) console.log(`batch :: requests error for id : ${res.id} code : ${res.status}`)  })

    //check for request throttling
    infoReq.responses.map((res) => { if (res.status == 429) buffer.push(reqArr2[res.id]) })

    //wait 35 mSec to give a break to MS Graph (typical retry waiting time is 30 mSec)
    await delay(35)

    return(infoReq)

}

let buffer = []
let wbwsArr =  []
let linkCol = ''
let linkName = ''

//Cache Excel worksheet when invoked
const pushwbws = async(wbwsKey, rows, workbook, workbookId, worksheet)  => {

    // console.log(`excel :: excelHandler : Get used range for tag ${workbook}-${worksheet} `)
    usedRange = await getUsedRange(workbookId, worksheet)

    //sync tags index file  if required
    let tagNamesArr = []
    let tagNames = ``
    header = usedRange.values[0]

    usedRange.values.map((ir) => { 

        tagNamesArr.push(ir[usedRange.values[0].indexOf('Name')]) 
        tagNames += `§${ir[usedRange.values[0].indexOf('Name')]}`
        
    })

    tagNames += `§`

    //strong copy of objects
    let info1 = JSON.stringify(rows)
    let info2 = JSON.stringify(tagNamesArr)

    if (info1 !== info2) {

        console.log(`workbook ${workbook}, worksheet ${worksheet} changed re-indexing..`)
        await tagIndexer(workbook, workbookId, worksheet, tagNames, header)
    
    }
    
    let obj = {}
    obj[wbwsKey] = usedRange.formulas
    wbwsArr.push(obj)

}

//Cache column formulas
const formulasBufferHandler = async(formulaInfo) => {

    let formulasObj = {}

    const {tag, part, currDocTag, linkUrl, linkCol, pdfFlag} = formulaInfo

    let link = ''

    //get tag info from buffers
    const {workbook, workbookId, worksheet, row, rows } = await tagInfo(tag)

    wbwsKey = workbook.split('.')[0] + '-' + worksheet
    index = -1
    wbwsArr.map((o, i) => { if (Object.keys(o)[0] == wbwsKey) index = i })
    wbws = wbwsArr[index]
    header = Object.values(wbws)[0][0]

    if (currDocTag && pdfFlag === undefined) link = 'Links'
    else
        if (part === undefined) link = linkCol
        else link = 'Parts'

    if (currDocTag && pdfFlag) link = 'PDF'

    // link = currDocTag ? 'Links' : linkName
    // link = part !== undefined ? 'Parts' : linkName
    
    let keyFound = header.indexOf(link) !== -1
    let colIndex = keyFound ? header.indexOf(link) : header.length 
    let col =  colIndex < 26 ? String.fromCharCode(colIndex  + 65) : `A${String.fromCharCode(colIndex %26+ 65)}`;
    let workbook2 = workbook.split('.')[0] + '-' + worksheet + '-' + link

    formulaIndex = -1
    formulaIndex2 = -1
    //check if key does not exist in buffer arrays
    formulasObjArr.map((form, i) => { if (Object.keys(form)[0] == workbook2) formulaIndex = i })
    reqFormulasArr.map((form, i) => { if (Object.keys(form)[0] == workbook2) formulaIndex2 = i })
    
    //point to right formula array for the current tag 
    if (formulaIndex >= 0) formulas = formulasObjArr[formulaIndex][workbook2]

    //create a new formula object array
    if (!keyFound)  {

        // console.log(`excel :: excelHandler : Column <${linkName}> not found, create a new column array.`)

        formulas = new Array(rows.length)
        formulasObj = {}
        formulas.fill([''],0,rows.length)
        formulas[0] = [linkCol]

        //update current buffer header list
        Object.values(wbws)[0][0].push(linkCol)



    }

    else {

        if (formulaIndex == -1 ) {

            formulas = []
            Object.values(wbws)[0].map(formula => formulas.push(formula[colIndex].toString().split('@')))

        }
        
    }

    link = part === undefined ? linkName : part

    // if (part === undefined) link = Object.values(wbws)[0][row][colIndex]
    // else link = part
    
    formulas[row] = [`=HYPERLINK("${linkUrl}", "${link}")`] 
    formulasObj[workbook2] = formulas
    formulasObj['workbookId'] = workbookId
    formulasObj['worksheet'] = worksheet
    formulasObj['col'] = col

    if (formulaIndex == -1) {
        // console.log(`updateExcel :: Create Column <${linkName}> main buffer with id <${workbook2}>.`)
        formulasObjArr.push(formulasObj)
    }
    else { formulasObjArr[formulaIndex] = formulasObj }

    if (formulaIndex2 == -1) {
        // console.log(`updateExcel :: Create Column <${linkName}> current buffer with id <${workbook2}>.`)
        console.log(`excel :: excelHandler : formulasBufferHandler : update <${Object.keys(formulasObj)[0]}> column <${formulasObj.col}> header <${Object.values(formulasObj)[0][0][0]}>`)
        reqFormulasArr.push(formulasObj)
    }
    else { reqFormulasArr[formulaIndex2] = formulasObj }

    formulasObj = {}

}

let reqFormulasArr = []

const excelHandler = async(info) => {

    let wbws = {}

    const {docTag, tags, linkOnly, onlyISA, linkUrl, pdfUrl} = info

    //get tags information
    tagsInfo = fs.readFileSync(`tags.txt`, 'utf8') 
    workbookId = ''

    usedRangeFlag = false
    let i = 0

    let formulaIndex = -1
    let reqArr = []

    let formulaInfo = {}
    let link = ''
    let currDocTag = false

    for (const tag of tags) {

        //read tag's info 
        let tagInfo2 = await tagInfo(tag)
        const {workbook, workbookId, worksheet, row, rows } = tagInfo2
        if (workbook == -1) {

            console.log(`excel :: tagsInfo : no info found for tag ${tag}`)
            continue

        }  
        let wbwsKey = workbook.split('.')[0] + '-' + worksheet

        currDocTag = false
        
        //push excel info to buffer arrays if not there already
        let index = -1
        wbwsArr.map((o, i) => { if (Object.keys(o)[0] == wbwsKey) index = i })
        if (index == -1) await pushwbws(wbwsKey, rows, workbook, workbookId, worksheet)

        //get excel info for the current tag
        wbwsArr.map((o, i) => { if (Object.keys(o)[0] == wbwsKey) index = i })
        if (index >= 0) wbws = wbwsArr[index]

        let header = Object.values(wbws)[0][0]
        let data = Object.values(wbws)[0]

        if (linkOnly) {
            //keep the linkname by splitting the formula hyperlink
            linkName = data[row][header.indexOf('Links')].match(/[^"]*/g)[6]
            //if not a formula hyperlink, no splitting required
            if (linkName === undefined) linkName = data[row][header.indexOf('Links')]
            linkCol = data[row][header.indexOf('Cat')]
            return({col:linkCol, name:linkName})
               }

        //check if it is a doc tag)
        if (header.indexOf(`Links`) !== -1) {
            
            // console.log(`${tag} is a Doc tag`)

            //if it is not the current doc tag, skip the loop
            regex = new RegExp(tag, 'i');
            // if (regex.test(docTag)) {
                if (docTag === tag) { 

                // console.log(`excel :: excelHandler : ${tag} is the current Doc tag`)
                currDocTag = true

            }
            else continue
        }

        //check if the current tag has a part number
        if (header.indexOf(`Parts`) !== -1) {

            let part = Object.values(wbws)[0][row][header.indexOf(`Parts`)]
            part = part.toString()
            regex = new RegExp(part, 'i');
            regex2 = new RegExp('HYPERLINK', 'i');

            if (regex2.test(part)) part = part.match(/[^"]*/g)[6]    

            //if tag is not a part and has no links already, then link the parts column with the part's datasheet 
            //** the link can be bad, need to be able to update it */
            // if (!regex.test(tag) && !regex2.test(part) && part !== '' && part !== undefined)  {
                if (!regex.test(tag) && part !== '' && part !== undefined)  {
                // console.log(`tag ${tag} part is ${part}`)

                //get part's info 
                let tagInfo2 = await tagInfo(part)
                const {workbook, workbookId, worksheet, keys, row, rows } = tagInfo2  

                if (workbook == -1) {
                    console.log(`no tag info for ${tag}`)
                    continue
                }

                //check if tag info already in buffer arrays
                wbwsKey = workbook.split('.')[0] + '-' + worksheet
                index = -1
                wbwsArr.map((o, i) => { if (Object.keys(o)[0] == wbwsKey) index = i })

                //set wbws info from excel to buffer
                if (index == -1) {
                    
                    await pushwbws(wbwsKey, rows, workbook, workbookId, worksheet)
                    wbwsArr.map((o, i) => { if (Object.keys(o)[0] == wbwsKey) index = i })
                }

                //get part info from buffers
                if (index >= 0) wbws = wbwsArr[index]
                header = Object.values(wbws)[0][0]
                let prtUrl = Object.values(wbws)[0][rows.indexOf(part)][header.indexOf('Data Sheet')]
                // console.log(`part ${part}  datasheet url is ${prtUrl}`)

                if (prtUrl !== '' && prtUrl !== undefined ) {

                    //keep only Url part
                    let partUrl = (prtUrl.match(/http[^,"]*/))
                    link = part
                    formulaInfo = { tag:tag, part:part, linkName:link, linkUrl:partUrl[0] } 

                    await formulasBufferHandler(formulaInfo)
                    continue
                }
                // else console.log(`excel::excelHandler: no part datasheet URL found for ${part}`)
            }
        }

        formulaInfo = { currDocTag:currDocTag, tag:tag, linkName:linkName, linkCol:linkCol, linkUrl:linkUrl } 
        await formulasBufferHandler(formulaInfo)
        //second pass for the pdf link
        if (currDocTag) {
         formulaInfo = { currDocTag:currDocTag, tag:tag, linkName:linkName, linkCol:'PDF', linkUrl:pdfUrl , pdfFlag:true} 
         await formulasBufferHandler(formulaInfo)
        }
        
    }    

    // console.log(`formulas buffering done.`)

    for (const formula of reqFormulasArr) {

        lastRow = Object.values(formula)[0].length
        workbookId = Object.values(formula)[1]
        worksheet = Object.values(formula)[2]
        col = Object.values(formula)[3]

        //strong copy of batch request object
        reqObj1 = JSON.parse(JSON.stringify(reqObj));
        reqObj1.url = `/me/drive/items/${workbookId}/workbook/worksheets/${worksheet}/range(address='${col}1:${col}${lastRow}')`
        reqObj1.method = 'PATCH'
        reqObj1.id = i.toString()
        reqObj1.body = { formulas: Object.values(formula)[0] }
        reqArr.push(reqObj1)

        i++

    }

   reqArr2 = JSON.parse(JSON.stringify(reqArr));

   if (reqArr.length == 0) {
       
    console.log(`excel:: updateExcel: nothing to update.`)
    return
}

   else {
        do  {

            buffer = reqArr.splice(20)
            await batch(reqArr)
            reqArr = buffer

        }
        while (reqArr .length != 0)
        // fs.writeFileSync(`tags.txt`, tagsInfo)  
        console.log(`excel:: updateExcel: update done.`)
        return
    }

}

//List the pdf files on OneDrive
const oneDriveFilesList = async() =>{

// let lastrefreshToken = fs.readFileSync('refreshToken.txt', 'utf8') 
// token = await refreshToken(lastrefreshToken, false)

try {

    //Get the column values
    url = `https://graph.microsoft.com/v1.0/me/drive/root/search(q='.pdf')?select=name,id,webUrl`
    
    response = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
    let reqResult = await response.json()

    filesList = reqResult.value
    
    console.log(response)

    return filesList
}

catch(err) {
    console.log(err)
    return {error:err}
}

}

//List the pdf files on OneDrive
const getFilesInfo = async(fileName) =>{

    // filesList = await  oneDriveFilesList()
    //MS Explorer returns a list even if you specified the exact filename, annoying...
    //Therefore need to find the info in the list
    let reply = {}

    for (fileObj of filesList) {

      fileName2 = fileObj.name.split('.')[0]  
      if (fileName === fileName2) 
      {
        console.log(`${fileObj}`)
        reply = fileObj
        break
      }
      else reply = {msg: 'file not found'}

    }

    return (reply)


}

const getDownloadUrl = async(fileId) =>{

    //Get the column values
    url = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}?select=id,@microsoft.graph.downloadUrl`
    
    response = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
    let reqResult = await response.json()

    //cannot refer the key @microsoft.graph.downloadUrl, get it with Object.values
    fileDnUrl = Object.values(reqResult)[1]
    
    console.log(fileDnUrl )

    return fileDnUrl

    // GET /drive/items/49E99A2BD2F2DBE1!394?select=id,@microsoft.graph.downloadUrl


}

//Get cell's fill color (used for status)
const getCellFillColor = async(workbookId, worksheet, rangeArr) =>{

    //can only be called cell by cell, a range will not return a JSON reply

    let reqArr = []

    // https://graph.microsoft.com/v1.0/me/drive/items/49E99A2BD2F2DBE1!445/workbook/worksheets/Status/range(address='$A3:$A3')/format/fill

    rangeArr.map ((range,i) => {

        //strong copy of batch request object
        reqObj1 = JSON.parse(JSON.stringify(reqObj));
        reqObj1.url = `/me/drive/items/${workbookId}/workbook/worksheets/${worksheet}/range(address='$A${i+1}:$A${i+1}')/format/fill`
        reqObj1.method = 'GET'
        reqObj1.id = i.toString()
        reqObj1.body = {}
        reqArr.push(reqObj1)

    })

    let colorObj = await batch(reqArr)

    return(colorObj.responses)
    
    console.log(colorObj)


}

//set cell, use to update a tag's status or a tag's note
const updateCell = async(colName, tag, val) =>{

let info = await tagInfo(tag)   
const {workbookId, worksheet, row} = info

let lastrefreshToken = fs.readFileSync('refreshToken.txt', 'utf8') 
token = await refreshToken(lastrefreshToken, false)

let ur = await getUsedRange(workbookId, worksheet)
let header = ur.values[0]
let colIndex = header.indexOf(colName)
let col =  colIndex < 26 ? String.fromCharCode(colIndex  + 65) : `A${String.fromCharCode(colIndex %26+ 65)}`;

let url = `https://graph.microsoft.com/v1.0/me/drive/items/${workbookId}/workbook/worksheets/${worksheet}/range(address='${col}${row+1}:${col}${row+1}')`

// let valArr = [[val]]

let info2 = {
    values: [
        [
            val
        ]
    ]
}

let res = await fetch(url, 
    {
    method: 'PATCH',    
    headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(info2)
});

if (res.ok) return(`cell updated`)
else return(`cell update failed`)

// infoReq  = await res.json()

}

module.exports = { refreshToken, tagIndexer, tagInfo, excelHandler, getUsedRange, oneDriveFilesList, getFilesInfo, getDownloadUrl, getCellFillColor, updateCell }