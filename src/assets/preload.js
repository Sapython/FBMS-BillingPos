const { BrowserWindow } = require('electron')
const {PosPrinter} = require('electron').remote.require("electron-pos-printer");console.log("Remote:",remote)
console.log(PosPrinter)
const options = {
  preview: true, // Preview in window or print
  width: "170px", //  width of content body
  margin: "0 0 0 0", // margin of content body
  copies: 1, // Number of copies to print
  printerName: "RP3160 GOLD(U) 1", // printerName: string, check with webContent.getPrinters()
  timeOutPerLine: 200,
  pageSize: { height: 301000, width: 71000 }, // page size
};
const data = [
  {
    type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
    value: "SAMPLE HEADING",
    style: `text-align:center;`,
    css: { "font-weight": "700", "font-size": "18px" },
  },
];

window.addEventListener("DOMContentLoaded", () => {
  // document.getElementById('1234').style.background = 'red';
  console.log("Loaded preload.js");
  document.addEventListener("app-notify", (event) => {
    new Notification(event.detail.title, {
      body: event.detail.message,
    }).onclick = () => {
      console.log("Notification clicked");
    };
    PosPrinter.print(data, options)
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });
  });

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  // for (const type of ["chrome", "node", "electron"]) {
  //   replaceText(`${type}-version`, process.versions[type]);
  // }
});
