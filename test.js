
let clientCloud = `Microsoft`

//Microsoft Functions library
const {accessToken, getFilesList, getFileInfo, getFileId, downloadFile, getBookInfo, getSheetValues, update, batch, tagIndexer, taginfo } = require(`./${clientCloud}-Lib`)

let tags = 
[
    [`Tag1`, `Header1`, `=HYPERLINK("https://dasdunetech.com/","DasDuneTech")`],
    [`Tag5`, `Header1`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag16`, `Header2`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag29`, `Header3`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag203`, `Header4`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag217`, `Header5`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag226`, `Header6`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag305`, `Header7`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag313`, `Header8`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag336`, `Header4`, `=HYPERLINK("https://dasdunetech.com/","DDT")`]
]






const main = async() => {

  accessToken()

  info = await batch(tags)

}

main()
