export const config = {
    FBInit: {
      apiKey: "AIzaSyBNNeqHgaHZPk6bmiCvHGkaaDqlpuuB9VY",
      authDomain: "taglinker-server.firebaseapp.com",
      projectId: "taglinker-server",
      storageBucket: "taglinker-server.appspot.com",
      messagingSenderId: "1000586769793",
      appId: "1:1000586769793:web:836b9645d784c9b6dce480",
      measurementId: "G-GX0TBXFMQ6"
      },
    // sockServer: 'https://ddtsocketserver.herokuapp.com/',
    sockServer: 'http://localhost:3000',
    // tlClient: 'https://taglinker-client.web.app/',
    tlClient: './pub/',
    // tlServer: 'https://taglinker-onde3cvjbq-uc.a.run.app/',
    tlServer: 'http://localhost:8080',
    urlSheetsPrefix: `https://docs.google.com/spreadsheets/d/`,
    clientCloud:"Microsoft"
}

// console.log(config.FBInit);
// console.log(config.sockServer);
// console.log(config.webURL);