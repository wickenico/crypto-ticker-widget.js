/* --------------------------------------------------------------
Script: crypto-ticker-widget
Author: Nico Wickersheim
Version: 1.0.0

Description:
Displays the current course of a cryptoin any fiat currency based on 
the data of coinbase API.

Changelog:

1.0.0: Initialization
-------------------------------------------------------------- */

let params = null;
// Parameter takeover from input
if (args.widgetParameter == null) {
    params = ["BTC", "USD"]; // Default input without parameters
} else {
    params = args.widgetParameter.split(",")
    console.log(params)
}

// Fetch Coinbase API json object
const url = 'https://api.coinbase.com/v2/prices/' + params[0] + '-' + params[1] + '/spot'
const req = new Request(url)
const res = await req.loadJSON()
let base = "";
let currency = "";
let amount = "";
// Check if the api response contains an error message
if (JSON.stringify(res).toLowerCase().includes("errors") == false) {
    base = res.data.base;
    currency = res.data.currency;
    amount = res.data.amount;
} else {
    amount = res.errors[0].message;
}

let USDamount = "";
// Fetch Coinbase API json object as USD for comapre with latest (onyl available in USD)
const USDurl = 'https://api.coinbase.com/v2/prices/' + params[0] + '-USD/spot'
const USDreq = new Request(USDurl)
const USDres = await USDreq.loadJSON()
if (JSON.stringify(res).toLowerCase().includes("errors") == false) {
    USDamount = USDres.data.amount;
    USDamount = parseFloat(USDamount).toFixed(2)
}

// Image fetching
let img = {};
let i = {};
// Fetch belonging image to crypto symbol
if (JSON.stringify(res).toLowerCase().includes("errors") == false) {
    i = new Request('https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/128/white/' + base.toLowerCase() + '.png')
}
try {
    img = await i.loadImage()
} catch (e) {
    // Fetch default independent image
    i = new Request('https://image.flaticon.com/icons/png/512/107/107587.png')
    img = await i.loadImage()
}

// Fetch further information to crpyto from Coinpaprika
let name = "";
let rank = "";
if (JSON.stringify(res).toLowerCase().includes("errors") == false) {
    const nameUrl = 'https://api.coinpaprika.com/v1/search?q=' + base.toLowerCase() + '&c=currencies&limit=1'
    const nameReq = new Request(nameUrl)
    const resName = await nameReq.loadJSON()
    name = resName.currencies[0].name;
    rank = resName.currencies[0].rank;
}
let upticker = SFSymbol.named("chevron.up");
let downticker = SFSymbol.named("chevron.down");
let latest = "";
let resLatest = "";
if (JSON.stringify(res).toLowerCase().includes("errors") == false) {
    let replaceName = name.replaceAll(" ", "-");
    const latestUrl = 'https://api.coinpaprika.com/v1/coins/' + base.toLowerCase() + '-' + replaceName.toLowerCase() + '/ohlcv/latest/'
    const latestReq = new Request(latestUrl)
    resLatest = await latestReq.loadJSON()
    if (JSON.stringify(resLatest).toLowerCase().includes("errors") == false && JSON.stringify(resLatest) != "[]") {
        latest = resLatest[0].close;
        latest = parseFloat(latest).toFixed(2);
    }
}

let widget = createWidget(base, amount, currency, img, name, rank)
if (config.runsInWidget) {
    // create and show widget
    Script.setWidget(widget)
    Script.complete()
}
else {
    widget.presentSmall()
}

function createWidget(base, amount, currency, img, name, rank) {
    let w = new ListWidget()
    w.backgroundColor = new Color("#1A1A1A")

    // Place image on the left top
    let imageStack = w.addStack();
    imageStack.setPadding(8, 25, 0, 10);
    imageStack.layoutHorizontally();
    imageStack.centerAlignContent();
    let image = imageStack.addImage(img)
    image.imageSize = new Size(45, 45)
    image.centerAlignImage()
    imageStack.addSpacer(12);

    let imageTextStack = imageStack.addStack();
    imageTextStack.layoutVertically();
    imageTextStack.addSpacer(0);

    // Symbol of crypto token
    let baseStack = imageTextStack.addStack()
    baseStack.layoutHorizontally();

    let baseText = baseStack.addText(base)
    baseText.textColor = Color.white()
    baseText.font = Font.systemFont(18)

    let tickerStack = baseStack.addStack();
    tickerStack.layoutHorizontally();

    // Stack for ticker image: if course yesterday is lower than today show red ticker
    // if course yesterday
    if (JSON.stringify(resLatest).toLowerCase().includes("errors") == false && JSON.stringify(resLatest) != "[]" &&
        JSON.stringify(res).toLowerCase().includes("errors") == false) {
        let ticker = null;
        if (USDamount < latest) {
            ticker = tickerStack.addImage(downticker.image);
            ticker.tintColor = Color.red();
        } else {
            ticker = tickerStack.addImage(upticker.image);
            ticker.tintColor = Color.green();
        }

        ticker.imageSize = new Size(12, 12)
    }

    // Rank of crypto token
    let rankText = "";
    if (JSON.stringify(res).toLowerCase().includes("errors") == false) {
        rankText = imageTextStack.addText("Rank: " + rank)
    }
    rankText.textColor = Color.white()
    rankText.font = Font.systemFont(12)

    w.addSpacer(8)

    // Full name of crypto token
    let staticText = w.addText(name)
    staticText.textColor = Color.white()
    staticText.font = Font.systemFont(13)
    staticText.centerAlignText()

    w.addSpacer(8)

    // Round amount to 2 decimal positions
    let amountTxt = "";
    if (JSON.stringify(res).toLowerCase().includes("errors") == false) {
        // Cut numbers over 10 Million and show just with ending 'M'
        if (parseFloat(amount) >= 10000000) {
            amount = (parseFloat(amount) / 1000000).toFixed(2).replace(/\.0$/, '');
            amount += "M";
        } else {
            amount = parseFloat(amount).toFixed(2);
        }
        amountTxt = w.addText(amount + ' ' + currency)

        amountTxt.textColor = Color.orange()

    } else {
        amountTxt = w.addText(amount); // Write error message in case as amount
        amountTxt.textColor = Color.red()
    }
    amountTxt.centerAlignText()
    amountTxt.font = Font.systemFont(16)

    w.addSpacer(8)

    // Bottom date text 
    let currentDate = new Date();
    let lastDate = w.addDate(currentDate);
    lastDate.textColor = Color.gray()
    lastDate.font = Font.mediumSystemFont(10)
    lastDate.centerAlignText();

    w.setPadding(0, 0, 0, 0)
    return w
}