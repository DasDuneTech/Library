


let tags = `@Library.xlsx¶4BF5108ECD128AC3!4389~Sheet1&§Name§Tag1§Tag2§Tag3§Tag4§Tag5§Tag6§Tag7§Tag8§Tag9§~Sheet2&§Name§Tag11§Tag12§Tag13§Tag14§Tag15§Tag16§Tag17§Tag18§Tag19§Tag20§~Sheet3&§Name§Tag21§Tag22§Tag23§Tag24§Tag25§Tag26§Tag27§Tag28§Tag29§Tag30§@Library3.xlsx¶4BF5108ECD128AC3!4387~Sheet1&§Name§Tag301§Tag302§Tag303§Tag304§Tag305§Tag306§Tag307§Tag308§~Sheet2&§Name§Tag311§Tag312§Tag313§Tag314§Tag315§Tag316§Tag317§Tag318§~Sheet3&§Name§Tag331§Tag332§Tag333§Tag334§Tag335§Tag336§Tag337§Tag338§@Library2.xlsx¶4BF5108ECD128AC3!4388~Sheet1&§Name§Tag201§Tag202§Tag203§Tag204§Tag205§Tag206§Tag207§Tag208§~Sheet2&§Name§Tag211§Tag212§Tag213§Tag214§Tag215§Tag216§Tag217§Tag218§~Sheet3&§Name§Tag221§Tag222§Tag223§Tag224§Tag225§Tag226§Tag227§Tag228§`

let booksheetsTags = tags.match(/[^@]*/g)

booksheetsTags.forEach((bookSheetsTags) => {

    if (bookSheetsTags !== '') {
        
        let sheetsTags = bookSheetsTags.match(/[^~^&]*/g)

        for (let sheetTags of sheetsTags) {

          //skip if a null
          if (sheetTags === '') continue
          //check if a book

          if (sheetTags.split('¶').length > 1) {
            bookName = sheetTags.split('¶')[0]
            console.log(bookName)
            continue
          }

          //check if a sheet
          if (sheetTags.match(/[^§]+/g).length <= 1) {
            sheetName = sheetTags
            console.log(sheetName)
            continue
        }

          //check if tags
          if (sheetTags.match(/[§]*/g).length !== 0) {
            tags = sheetTags.match(/[^§]*/g)
            console.log(tags)
          }

        }

        // console.log(sheetsTags)


 

    }


})

console.log(`stop`)


