//Google sheets  

const config = require('./config.json');
const { google } = require("googleapis");

//cells objects

//update values
let valUpt =
{
    updateCells: {
        range: {
            sheetId: 2054546716,
            startRowIndex: 1,
            endRowIndex: 2,
            startColumnIndex: 0,
            endColumnIndex: 1,
        },
        fields: 'userEnteredValue',
        rows: [{
            values: [{
                userEnteredValue: {
                    // key/val set dynamically vs value type to pass
                },
            }],
        }],
    },
}

//format cells
let fCellObj =
{
    repeatCell: {
        range: {
            sheetId: 2054546716,
            startRowIndex: 1,
            endRowIndex: 2,
            startColumnIndex: 0,
            endColumnIndex: 1,
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment )',
        cell: {
            "userEnteredFormat": {
                "backgroundColor": {
                    "red": 236,
                    "green": 149,
                    "blue": 124
                },
                "horizontalAlignment": "CENTER",
                "verticalAlignment": "MIDDLE",
                "textFormat": {
                    "foregroundColor": {
                        "red": 45,
                        "green": 59,
                        "blue": 124
                    },
                    "fontSize": 12,
                    "bold": true
                }
            }
        },
    },
}

//update note
let noteUpt =
{
    updateCells: {
        range: {
            sheetId: 2054546716,
            startRowIndex: 1,
            endRowIndex: 2,
            startColumnIndex: 0,
            endColumnIndex: 1,
        },
        fields: 'note',
        rows: [{
            values: [{
                note: {
                    // key/val set dynamically vs value type to pass
                },
            }],
        }],
    },
}


const getDateTime = () => {

    let d = new Date();
    let y = d.getUTCFullYear();
    let m = d.getUTCMonth() + 1;
    let dy = d.getUTCDate();
    let h = d.getUTCHours();
    let mn = d.getUTCMinutes();

    return (`${m}-${dy}-${y} ${h}:${mn}`)
}

const color = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',

    fgBlack: '\x1b[30m',
    fgRed: '\x1b[31m',
    fgGreen: '\x1b[32m',
    fgYellow: '\x1b[33m',
    fgBlue: '\x1b[34m',
    fgMagenta: '\x1b[35m',
    fgCyan: '\x1b[36m',
    fgWhite: '\x1b[37m',

    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
};

//init sheets with auth
sheetsInfo = async (sheetsId) => {

    console.log(`${color.fgYellow}function :: sheetsInfo started...${color.reset}`)
    console.log(`${color.fgBlue}sheetsId :${color.reset} ${sheetsId}`)

    // const keyFile = "keysSheets.json";
    const keyFile = config['keysSheets'];
    // const spreadsheetId = "1ynIOtCU10aGmT4dI-Y4wlmW2IQ6ZbMJwID3-qLdwxmA";
    const spreadsheetId = sheetsId;

    //authorization
    const auth = new google.auth.GoogleAuth({
        keyFile: keyFile,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const clientSheets = await auth.getClient();

    const googleSheets = google.sheets({ version: "v4", auth: clientSheets });
    // gs = googleSheets;
    // sheetsAuth = auth;

    //Get sheets info
    sheetsData = await googleSheets.spreadsheets.get({
        spreadsheetId,
    });

    console.log(`${color.fgBlue}total sheets : ${color.reset}${sheetsData.data.sheets.length}`)

    namedRanges = sheetsData.data.namedRanges
    console.log(`${color.fgBlue}namedRanges : ${color.reset}${namedRanges.length}`)

    console.log(`${color.fgGreen}function :: sheetsInfo completed.${color.reset}`)

    return ({ gs: googleSheets, spreadsheetId: spreadsheetId, data: sheetsData, auth: auth, namedRanges: namedRanges })
}

//get sheet info
sheetInfo = async (sheetName, sheets) => {

    const { gs, spreadsheetId, data, auth } = sheets

    console.log(`${color.fgYellow}function :: sheetInfo started...${color.reset}`)
    console.log(`${color.fgBlue}sheet name :${color.reset} ${sheetName}`)

    let ssData = data.data.sheets
    let sheet = ssData.filter((ssData) => ssData.properties.title == sheetName)
    let sheetId = sheet[0].properties.sheetId;
    let row = sheet[0].properties.gridProperties.rowCount;
    let col = sheet[0].properties.gridProperties.columnCount;

    console.log(`${color.fgBlue}sheet ID:${color.reset} ${sheetId} `)
    console.log(`${color.fgBlue}rows:${color.reset} ${row} ${color.fgBlue}cols:${color.reset} ${col}`)

    const getRows = await gs.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `${sheetName}!R1C1:R${row}C${col}`,
        // range: `${sheetName}!A1:${colLetter}${row}`,
    });

    //Get all the tags from the sheet
    let rowsData = getRows.data.values

    console.log(`${color.fgGreen}function :: sheetInfo completed.${color.reset}`)
    return ({ sheetId: sheetId, rowsData: rowsData })
}

//populate named ranges
popNamedRange = async (sheets, sheet) => {

    const { gs, spreadsheetId, auth, namedRanges } = sheets
    const { sheetId, rowsData } = sheet

    console.log(`${color.fgYellow}function :: popNamedRange started...${color.reset}`)

    let nr = [];
    let nrs = [];
    let nr2s = [];

    let patt = new RegExp(/^U$|^D$/);


    // let rowsData = rowsData
    // let header = rowsData.shift();
    let tagsFlt = rowsData.filter(((tag, i) => patt.test(tag[0])))

    console.log(`${color.fgBlue}rows to set/update named range : ${color.reset}${tagsFlt.length}`)

    //named range add object template
    nrAdd = {
        "addNamedRange": {
            "namedRange": {
                "name": "Dune",
                "range": {
                    "sheetId": 2054546716,
                    "startRowIndex": 10,
                    "endRowIndex": 11,
                    "startColumnIndex": 0,
                    "endColumnIndex": 5,
                },
            }
        }
    }

    //named range update object template
    nrUpt = {
        "updateNamedRange": {
            "namedRange": {
                "name": "Dune",
                "namedRangeId": "33858809",
                "range": {
                    "sheetId": 391190716,
                    "startRowIndex": 10,
                    "endRowIndex": 11,
                    "startColumnIndex": 0,
                    "endColumnIndex": 12,
                },
            },
            "fields": "*"
        }
    }

    tagsFlt.map((tag) => {

        //Check if named range already exist if yes we need to update instead of adding a namedrange
        //If you don't the namedrange add method will produce the error : 'already exist'
        nrName = `NR_${tag[1].replace(/[-\/]/g, '_')}`;
        if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))

        if (nr.length == 0) {
            //need to do a deep object copy of th object to make sure the variables
            //do not refer to the same object 
            nr2 = JSON.parse(JSON.stringify(nrAdd));
            nr2.addNamedRange.namedRange.name = nrName;
            nr2.addNamedRange.namedRange.range.sheetId = sheetId;
            row = rowsData.indexOf(rowsData.filter((tg) => tg[1] == tag[1])[0])
            nr2.addNamedRange.namedRange.range.startRowIndex = row;
            nr2.addNamedRange.namedRange.range.endRowIndex = row + 1;
            nr2.addNamedRange.namedRange.range.startColumnIndex = 0;
            nr2.addNamedRange.namedRange.range.endColumnIndex = rowsData[0].length;
            nr2s.push(nr2)
        }

        else {
            //need to do a deep object copy of th object to make sure the variables
            //do not refer to the same object 
            nr2 = JSON.parse(JSON.stringify(nrUpt));
            nr2.updateNamedRange.namedRange.name = nrName;
            nr2.updateNamedRange.namedRange.namedRangeId = nr[0].namedRangeId;
            nr2.updateNamedRange.namedRange.range.sheetId = sheetId;
            row = rowsData.indexOf(rowsData.filter((tg) => tg[1] == tag[1])[0])
            nr2.updateNamedRange.namedRange.range.startRowIndex = row;
            nr2.updateNamedRange.namedRange.range.endRowIndex = row + 1;
            nr2.updateNamedRange.namedRange.range.startColumnIndex = 0;
            nr2.updateNamedRange.namedRange.range.endColumnIndex = rowsData[0].length;
            nr2s.push(nr2)
        }

    })

    //Wait until all the named ranges has been sent prior to send the tags to DB
    //Because DB use the named range to access the sheet tags
    try {
        await gs.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: nr2s
            },
        }
        );
        console.log(`${color.fgGreen}namedRanges populated : ${color.reset}${nr2s.length}`)
    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

    console.log(`${color.fgGreen}function :: popNamedRanges completed.${color.reset}`)

};

//populate tags from sheet 
popTagsFromSheet = async (sheet, userEmail) => {

    console.log(`${color.fgYellow}function :: popTagsFromSheet started...${color.reset}`)

    const { rowsData } = sheet

    let header = rowsData[0];
    let patt = new RegExp(/^U$|^D$/);
    let tagsFlt = rowsData.filter(((tag, i) => patt.test(tag[0])))
    let tags = [];

    // Convert to an array of tags object to be sent to DB
    try {
        // let tags = [];
        // let nrs = [];
        tagsFlt.map((tag) => {
            // nrObj = {};
            // nrName = `NR_${tag[1].replace(/[-]/g, '_')}`;
            // nrObj['name'] = nrName;
            // nrObj['row'] = sheetTags.indexOf(tag) + 1;
            // nrObj['col'] = col;
            // nrs.push(nrObj);
            tagObj = {};
            tag.map((val, i) => {
                if (header[i] == 'Update') {
                    // user = 'toto@toto.com';
                    tagObj[header[i]] = userEmail + '\n' + getDateTime();
                }
                else if (val != '') tagObj[header[i]] = val
            })
            tags.push(tagObj)
        })
        console.log(`${color.fgBlue}tags populated : ${color.reset}${Object.keys(tagObj).length}`)

    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

    console.log(`${color.fgGreen}function :: popTagsFromSheet completed.${color.reset}`)

    try {
        return tags;
    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

}

//populate tags from sheet 
popTagsFromSheet2 = async (sheets, sheet, userEmail) => {

    console.log(`${color.fgYellow}function :: popTagsFromSheet started...${color.reset}`)

    const { rowsData, sheetId } = sheet
    const { spreadsheetId } = sheets

    let sheetsName = sheets.data.data.properties.title
    let sheetsId = sheets.spreadsheetId

    sheet = sheets.data.data.sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
    let sheetName = sheet[0].properties.title;



    let header = rowsData[0];
    let patt = new RegExp(/^U$|^D$/);
    let tagsFlt = rowsData.filter(((tag, i) => patt.test(tag[0])))
    let tags = [];
    let tagRow = 0;

    // let tagRow = rowsData.filter(((tag, i) => tag.test(tag[1])))

    // Convert to an array of tags object to be sent to DB
    try {
        // let tags = [];
        // let nrs = [];

        // tagRow2 = rowsData.findIndex(tagRow)
        // nrObj = {};
        // nrName = `NR_${tag[1].replace(/[-]/g, '_')}`;
        // nrObj['name'] = nrName;
        // nrObj['row'] = sheetTags.indexOf(tag) + 1;
        // nrObj['col'] = col;
        // nrs.push(nrObj);
        tagObj = {};

        tagObj.sheetsName = sheetsName
        tagObj.sheetsId = sheetsId
        tagObj.sheetName = sheetName
        tagObj.sheetId = sheetId


        tagsFlt.map((tag) => {
            index = rowsData.map(((tag2, i) => {
                if (tag2[1] == tag[1]) tagObj.sheetRow = i
            }))


            tag.map((val, i) => {
                if (header[i] == 'Update') {
                    // user = 'toto@toto.com';
                    tagObj[header[i]] = userEmail + '\n' + getDateTime();
                }
                else if (val != '') tagObj[header[i]] = val
            })


            tags.push(tagObj)
        })
        console.log(`${color.fgBlue}tags populated : ${color.reset}${Object.keys(tagObj).length}`)

    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

    console.log(`${color.fgGreen}function :: popTagsFromSheet completed.${color.reset}`)

    try {
        return tags;
    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

}

//populate status from sheet 
popStatus = async (sheets, sheet, userEmail) => {

    console.log(`${color.fgYellow}function :: popStatus started...${color.reset}`)

    const { rowsData, sheetId } = sheet
    const { spreadsheetId } = sheets

    let sheetsName = sheets.data.data.properties.title
    let sheetsId = sheets.spreadsheetId

    sheet = sheets.data.data.sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
    let sheetName = sheet[0].properties.title;



    let header = rowsData[0];
    let patt = new RegExp(/^U$|^D$/);
    let tagsFlt = rowsData.filter(((tag, i) => patt.test(tag[0])))
    let tags = [];
    let tagRow = 0;

    // let tagRow = rowsData.filter(((tag, i) => tag.test(tag[1])))

    // Convert to an array of tags object to be sent to DB
    try {
        // let tags = [];
        // let nrs = [];

        // tagRow2 = rowsData.findIndex(tagRow)
        // nrObj = {};
        // nrName = `NR_${tag[1].replace(/[-]/g, '_')}`;
        // nrObj['name'] = nrName;
        // nrObj['row'] = sheetTags.indexOf(tag) + 1;
        // nrObj['col'] = col;
        // nrs.push(nrObj);
        tagObj = {};




        tagsFlt.map((tag) => {

            tag.map((val, i) => {
                if (header[i] == 'Update') {
                    // user = 'toto@toto.com';
                    tagObj[header[i]] = userEmail + '\n' + getDateTime();
                }
                else if (val != '') tagObj[header[i]] = val
            })

            tags.push(tagObj)
        })
        console.log(`${color.fgBlue}tags populated : ${color.reset}${Object.keys(tagObj).length}`)

    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

    console.log(`${color.fgGreen}function :: popTagsFromSheet completed.${color.reset}`)

    try {
        return tags;
    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

}

//Update <Update> first column with userEmail/Date/Time and populate header based on doc type
updateUpdate = async (sheets, sheet, tags) => {

    console.log(`${color.fgYellow}function :: updateUpdate started...${color.reset}`)

    const { gs, spreadsheetId, auth, namedRanges } = sheets
    const { sheetId } = sheet

    //batch update values object template
    let valUpt =
    {
        updateCells: {
            range: {
                sheetId: 2054546716,
                startRowIndex: 1,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 1,
            },
            fields: 'userEnteredValue',
            rows: [{
                values: [{
                    userEnteredValue: {
                        // key/val set dynamically vs value type to pass
                    },
                }],
            }],
        },
    }

    let valUpt2 = {};
    let valUpt2s = [];


    try {
        tags.map(async (tag) => {

            try {

                nrName = `NR_${tag.Name.replace(/[-\/]/g, '_')}`;
                if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))

                //strong copy of object template
                valUpt2 = JSON.parse(JSON.stringify(valUpt));
                valUpt2.updateCells.range.sheetId = sheetId;
                valUpt2.updateCells.range.startRowIndex = nr[0].range.startRowIndex;
                valUpt2.updateCells.range.endRowIndex = nr[0].range.startRowIndex + 1;
                valUpt2.updateCells.range.startColumnIndex = 0;
                valUpt2.updateCells.range.endColumnIndex = 1;
                valUpt2.updateCells.rows[0].values[0].userEnteredValue.stringValue = tag.Update;
                valUpt2s.push(valUpt2);
            }
            catch (err) {
                console.log(`${color.fgRed}${err.message}${color.reset}`)
            }
        })
    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }




    try {
        await gs.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: valUpt2s
            },
        }
        );
        console.log(`${color.fgGreen}"Update" updated : ${color.reset} ${valUpt2s.length}`)
    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

    console.log(`${color.fgGreen}function :: updateUpdate completed.${color.reset}`)
}

//Update rows from tags
updateRows = async (sheets, tagNames, urlKey, urlVal, linkName, fileName2) => {

    const { gs, spreadsheetId, auth, namedRanges, data } = sheets

    let valUpt2 = {};
    let fCellObj2 = {};
    let UptArr = [];
    let UptArr2 = [];
    let headers = { header: [] }
    let headerFlag = false;

    for (let tagName of tagNames) {

        try {

            headerFlag = false;
            //Get sheets info for the tag
            nrName = `NR_${tagName.replace(/[-\/]/g, '_')}`;
            if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))

            let sheetId = nr[0].range.sheetId;
            let sheets = data.data.sheets
            let sheet = sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
            let sheetName = sheet[0].properties.title;
            // let row = sheet[0].properties.gridProperties.rowCount;
            let col = sheet[0].properties.gridProperties.columnCount;

            //check if we have already the header to avoid to call values/get for our Google sheets API quotas
            for (const [key, val] of Object.entries(headers)) {

                if (key === sheetId.toString()) headerFlag = true;

            }

            if (!headerFlag) {

                const getRowsInfo = await gs.spreadsheets.values.get({
                    auth,
                    spreadsheetId,
                    range: `${sheetName}!R1C1:R1C${col}`,
                    // range: `${sheetName}!A1:${colLetter}${row}`,
                });

                headers[sheetId] = getRowsInfo.data.values[0]

            }

            let header = headers[sheetId];

            //strong copy of update values object
            valUpt2 = JSON.parse(JSON.stringify(valUpt));
            valUpt2.updateCells.range.sheetId = sheetId;
            valUpt2.updateCells.range.startRowIndex = nr[0].range.startRowIndex;
            valUpt2.updateCells.range.endRowIndex = nr[0].range.startRowIndex + 1;

            //Process the header and tagRow updates
            for (key of header) {
                //check if new header key/val
                if (header.indexOf(urlKey) == -1) {
                    header.push(urlKey);
                    headers[sheetId] = header;
                    keyIndex = header.indexOf(urlKey);
                    valUpt3 = JSON.parse(JSON.stringify(valUpt));
                    valUpt3.updateCells.range.sheetId = sheetId;
                    valUpt3.updateCells.range.startRowIndex = 0;
                    valUpt3.updateCells.range.endRowIndex = 1;
                    valUpt3.updateCells.range.startColumnIndex = keyIndex;
                    valUpt3.updateCells.range.endColumnIndex = keyIndex + 1;
                    valUpt3.updateCells.rows[0].values[0].userEnteredValue.stringValue = urlKey;
                    UptArr2.push(valUpt3);

                    fCellObj2 = JSON.parse(JSON.stringify(fCellObj));
                    fCellObj2.repeatCell.range.sheetId = sheetId;
                    fCellObj2.repeatCell.range.startRowIndex = 0;
                    fCellObj2.repeatCell.range.endRowIndex = 1;
                    fCellObj2.repeatCell.range.startColumnIndex = keyIndex;
                    fCellObj2.repeatCell.range.endColumnIndex = keyIndex + 1;
                    UptArr2.push(fCellObj2);

                    //append a new formatted column at the end prior to update the new header key
                    try {
                        await gs.spreadsheets.batchUpdate({
                            auth,
                            spreadsheetId,
                            requestBody: {
                                requests: [
                                    {
                                        "appendDimension": {
                                            "sheetId": sheetId,
                                            "dimension": "COLUMNS",
                                            "length": 1
                                        }
                                    }
                                ]
                            },
                        }
                        );
                        console.log(`Append column #${keyIndex} on sheet ${sheetName}`)
                    }
                    catch (err) {
                        console.log(`${color.fgRed}${err.message}${color.reset}`)
                    }

                    //update the key name (presently null)
                    try {
                        await gs.spreadsheets.batchUpdate({
                            auth,
                            spreadsheetId,
                            requestBody: {
                                requests: UptArr2
                            },
                        }
                        );
                        console.log(`New header key ${urlKey2} on sheet ${sheetName}`)
                    }
                    catch (err) {
                        console.log(`${color.fgRed}${err.message}${color.reset}`)
                    }
                }
                else keyIndex = header.indexOf(urlKey);


            }

            //update the cell with doc hyperlink
            valUpt2.updateCells.range.startColumnIndex = keyIndex;
            valUpt2.updateCells.range.endColumnIndex = keyIndex + 1;
            val2 = `=hyperlink("${urlVal}","${linkName}")`
            // val3 = val2.substring(1, 100)
            valUpt2.updateCells.rows[0].values[0].userEnteredValue.formulaValue = val2;
            UptArr.push(valUpt2);



        }

        catch (err) {
            console.log(`${color.fgRed}${err.message}${color.reset}`)
        }
    }

    try {
        await gs.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: UptArr
            },
        }
        );
        console.log(`${color.fgGreen}tags updated : ${color.reset} ${valUpt2s.length}`)
    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }


    console.log(`${color.fgGreen}function :: updateRows completed.${color.reset}`)
}

//Update header based on document type
updateHeader = async (sheets, sheet) => {

    console.log(`${color.fgYellow}function :: updateHeader started...${color.reset}`)

    const { gs, spreadsheetId, auth, namedRanges, data } = sheets
    const { rowsData } = sheet

    //batch update cells object template
    let valUpt =
    {
        updateCells: {
            range: {
                sheetId: 2054546716,
                startRowIndex: 1,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 1,
            },
            fields: 'userEnteredValue',
            rows: [{
                values: [{
                    userEnteredValue: {
                        // key/val set dynamically vs value type to pass
                    },
                }],
            }],
        },
    }

    let valUpt2 = {};
    let valUpt2s = [];

    let header = rowsData[0];

    console.log(header)

    let typeIndex = header.indexOf('Type');
    let arrTypes = []

    rowsData.map((typeData, i) => {
        if (i != 0) {
            console.log(typeData[typeIndex])
            if (arrTypes.indexOf(typeData[typeIndex]) == -1) arrTypes.push(typeData[typeIndex])
        }
    })

    console.log(arrTypes)









}

//Update sheet cell from TagLinker client 
updateCell = async (sheets, userEmail, tag, key, val) => {

    // get fresh sheets
    const { gs, spreadsheetId, auth, namedRanges, data } = sheets

    //batch update values object template
    let valUpt =
    {
        updateCells: {
            range: {
                sheetId: 2054546716,
                startRowIndex: 1,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 1,
            },
            fields: 'userEnteredValue',
            rows: [{
                values: [{
                    userEnteredValue: {
                        // key/val set dynamically vs value type to pass
                    },
                }],
            }],
        },
    }

    let valUpt2 = {};
    let valUpt2s = [];

    //batch update note object template
    let noteUpt =
    {
        updateCells: {
            range: {
                sheetId: 2054546716,
                startRowIndex: 1,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 1,
            },
            fields: 'note',
            rows: [{
                values: [{
                    note: {
                        // key/val set dynamically vs value type to pass
                    },
                }],
            }],
        },
    }

    let noteUpt2 = {};

    try {

        nrName = `NR_${tag.replace(/[-\/]/g, '_')}`;
        if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))
        let sheetId = nr[0].range.sheetId;
        let sheets = data.data.sheets
        let sheet = sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
        let sheetName = sheet[0].properties.title;
        let row = sheet[0].properties.gridProperties.rowCount;
        let col = sheet[0].properties.gridProperties.columnCount;

        //strong copy of object template
        valUpt2 = JSON.parse(JSON.stringify(valUpt));
        valUpt2.updateCells.range.sheetId = sheetId;
        valUpt2.updateCells.range.startRowIndex = nr[0].range.startRowIndex;
        valUpt2.updateCells.range.endRowIndex = nr[0].range.startRowIndex + 1;

        noteUpt2 = JSON.parse(JSON.stringify(noteUpt));
        noteUpt2.updateCells.range.sheetId = sheetId;
        noteUpt2.updateCells.range.startRowIndex = nr[0].range.startRowIndex;
        noteUpt2.updateCells.range.endRowIndex = nr[0].range.startRowIndex + 1;

        const getRowsInfo = await gs.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${sheetName}!R1C1:R${1}C${col}`,
            // range: `${sheetName}!A1:${colLetter}${row}`,
        });

        header = getRowsInfo.data.values[0]
        // rowData = getRowsInfo.data.values

        keyIndex = header.indexOf(key)

        valUpt2.updateCells.range.startColumnIndex = keyIndex;
        valUpt2.updateCells.range.endColumnIndex = keyIndex + 1;
        valUpt2.updateCells.rows[0].values[0].userEnteredValue.stringValue = val;
        valUpt2s.push(valUpt2);

        noteUpt2.updateCells.range.startColumnIndex = keyIndex;
        noteUpt2.updateCells.range.endColumnIndex = keyIndex + 1;

        let note = `[ ${getDateTime()} ]\n${userEmail}\nChange: ${val}`;


        noteUpt2.updateCells.rows[0].values[0].note = note;



        valUpt2s.push(noteUpt2);

    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }


    try {
        await gs.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: valUpt2s
            },
        }
        );
        console.log(`${color.fgGreen}"Update" updated : ${color.reset} ${valUpt2s.length}`)
    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

    console.log(`${color.fgGreen}function :: updateUpdate completed.${color.reset}`)
}

//Get Sheet info for a given tag
getSheetInfoFromTag = async (sheets, tag) => {

    // get fresh sheets
    const { namedRanges, data } = sheets

    try {

        nrName = `NR_${tag.replace(/[-\/]/g, '_')}`;
        if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))
        let sheetId = nr[0].range.sheetId;
        let sheets = data.data.sheets
        let sheet = sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
        let row = nr[0].range.endRowIndex;
        let col = sheet[0].properties.gridProperties.columnCount;
        let info = { sheetId: sheetId, range: `B${row}` }
        return info
    }
    catch (err) {
        console.log(`getSheetInfoFromTag :: ${err.message}`)
        return { sheetId: `not found`, range: `not found` }
    }
}


formatCell = async (sheets, tag, key) => {

    // get fresh sheets
    const { gs, spreadsheetId, auth, namedRanges, data } = sheets

    //batch update values object template
    let valUpt =
    {
        repeatCell: {
            range: {
                sheetId: 2054546716,
                startRowIndex: 1,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 1,
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment )',
            cell: {
                "userEnteredFormat": {
                    "backgroundColor": {
                        "red": 236,
                        "green": 149,
                        "blue": 124
                    },
                    "horizontalAlignment": "CENTER",
                    "verticalAlignment": "MIDDLE",
                    "textFormat": {
                        "foregroundColor": {
                            "red": 45,
                            "green": 59,
                            "blue": 124
                        },
                        "fontSize": 12,
                        "bold": true
                    }
                }
            },
        },
    }

    let valUpt2 = {};
    let valUpt2s = [];



    try {

        nrName = `NR_${tag.replace(/[-\/]/g, '_')}`;
        if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))
        let sheetId = nr[0].range.sheetId;
        let sheets = data.data.sheets
        let sheet = sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
        let sheetName = sheet[0].properties.title;
        let row = sheet[0].properties.gridProperties.rowCount;
        let col = sheet[0].properties.gridProperties.columnCount;

        //strong copy of object template
        valUpt2 = JSON.parse(JSON.stringify(valUpt));
        valUpt2.repeatCell.range.sheetId = sheetId;
        valUpt2.repeatCell.range.startRowIndex = nr[0].range.startRowIndex;
        valUpt2.repeatCell.range.endRowIndex = nr[0].range.startRowIndex + 1;


        const getRowsInfo = await gs.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${sheetName}!R1C1:R${1}C${col}`,
            // range: `${sheetName}!A1:${colLetter}${row}`,
        });

        header = getRowsInfo.data.values[0]
        // rowData = getRowsInfo.data.values

        keyIndex = header.indexOf(key)

        valUpt2.repeatCell.range.startColumnIndex = keyIndex;
        valUpt2.repeatCell.range.endColumnIndex = keyIndex + 1;
        // valUpt2.updateCells.rows[0].values[0].userEnteredValue.stringValue = val;
        valUpt2s.push(valUpt2);

        // valUpt2s.push(noteUpt2);

    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }


    try {
        await gs.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: valUpt2s
            },
        }
        );
        console.log(`${color.fgGreen}"Update" updated : ${color.reset} ${valUpt2s.length}`)
    }
    catch (err) {
        console.log(`${color.fgRed}${err.message}${color.reset}`)
    }

    console.log(`${color.fgGreen}function :: updateUpdate completed.${color.reset}`)
}

//typical db set value
dbSet = (tags) => {

    tags.map((tag) => {

        admin.firestore().collection('tags').doc('status').set(tag, { merge: true })
            .then(snapshot => {
                console.log(`Status ${tag.Status} pushed.`);
            })
            .catch(err => {
                console.log(`Error: ${err.Message}`)
            });
    })
}

let sheetsTester = (async () => {

    const sheets = await sheetsInfo('1DGdCvVASVgrJAfHqnLXsvpPcmHAIY1bkJhxqWlj3Mrs')
    // const sheet = await sheetInfo('Instruments', sheets)

    // await updateCell(sheets, 'taglinker@gmail.com', '2400-LIT-2101', 'IOType', 'OOP')

    const info = await getSheetInfoFromTag(sheets, '2400-LIT-2101')

    console.log(info)

    // await updateRows(sheets, ['0-TEST'], 'PDF', 'https://www.google.com/', 'PDF', '0-TEST')

    // await formatCell(sheets, '2400-LIT-2101', 'Status')

    // console.log(sheet)
    // await popNamedRange(sheets, sheet);

    // let tags = await popStatus(sheets, sheet, 'toto@toto.com');

    // let tags = await popTagsFromSheet2(sheets, sheet, 'toto@toto.com');
    // console.log(tags);
    // dbSet(tags)

    // await updateUpdate(sheets, sheet, tags);

    // urlKey = 'P&ID'
    // urlVal = 'https://firebasestorage.googleapis.com/v0/b/taglinker-admin.appspot.com/o/DSOT-DW-2400-IC-8021.html?alt=media&token=13f50298-cf04-4c92-b640-26c480eacce8'

    // tagNames = ['2400-15-PLOH-SB2I-024', '2400-15-PLOH-SB2I-025', '2400-TSHH-2120', '2400-FV-2170', '2200-PLC-01-20031-55']


    // await updateRows(sheets, tags);
    // await updateRows2(sheets, tagNames, urlKey, urlVal)

    // await updateHeader(sheets, sheet);


})()
