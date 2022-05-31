let payload = [["C4:C4", 666],["D4:D4", 667],["E4:E4", 668]]


let payloadObj = {valueInputOption: "USER_ENTERED"}
let arrObj = []
payload.map((item) => arrObj.push({range:item[0], values:[[item[[1]]]]}))
payloadObj = {...payloadObj, ...{values:arrObj}}





console.log(obj)
