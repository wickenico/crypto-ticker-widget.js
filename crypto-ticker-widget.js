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
    params = ["DOGE", "EUR", "1"]; // Default input without parameters
} else {
    params = args.widgetParameter.split(",")
    console.log(params)
}

if (params[2] == null) {
    params[2] = 1;
}

// Fetch Coinbase API json object
const url = 'https://api.coinbase.com/v2/prices/' + params[0] + '-' + params[1] + '/spot'
const req = new Request(url)
const res = await req.loadJSON()
let base = "";
let currency = "";
let amount = "";
let marketName = "";
let USDamount = "";
let coinbaseReqFailed = JSON.stringify(res).toLowerCase().includes("errors")

// Check if the api response contains an error message
if (coinbaseReqFailed == false) {
    base = res.data.base;
    currency = res.data.currency;
    amount = res.data.amount;
    marketName = "Coinbase";

    // Fetch Coinbase API json object as USD for comapre with latest course (only available in USD)
    const USDurl = 'https://api.coinbase.com/v2/prices/' + params[0] + '-USD/spot'
    const USDreq = new Request(USDurl)
    const USDres = await USDreq.loadJSON()
    if (coinbaseReqFailed == false || marketName != "") {
        USDamount = USDres.data.amount;
        USDamount = parseFloat(USDamount).toFixed(2)
    } else {
        base = params[0]
        currency = params[1]
        amount = res.errors[0].message;
    }
}

// Second try with anoher coinbase api  
if (coinbaseReqFailed == true) {

    const url2 = 'https://api.coinbase.com/v2/exchange-rates?currency=' + params[0]
    const req2 = new Request(url2)
    const res2 = await req2.loadJSON()
    coinbaseReqFailed = JSON.stringify(res2).toLowerCase().includes("errors")
    if (coinbaseReqFailed == false) {

        const string = JSON.stringify(res2.data.rates)

        const indexFIAT = string.indexOf(params[1])
        const index1 = indexFIAT + 6
        const index2 = string.indexOf('"', index1)

        base = params[0]
        currency = params[1]
        amount = parseFloat(string.substring(index1, index2)).toFixed(2)
        marketName = "Coinbase";

    } else {

        base = params[0]
        currency = params[1]
        amount = res.errors[0].message;
    }
}

// Fallback to Bitfinex if Coinbase Req failed
if (coinbaseReqFailed == true) {
    const bitfinexUrl = 'https://api-pub.bitfinex.com/v2/tickers?symbols=t' + params[0] + params[1]
    const bitfinexReq = new Request(bitfinexUrl)
    const bitfinexRes = await bitfinexReq.loadJSON()
    if (JSON.stringify(bitfinexRes) != "[]") {
        amount = (bitfinexRes[Object.keys(bitfinexRes)[0]][9]).toString()
        marketName = "Bitfinex"
    }
}

// Image fetching
let img = {};
let i = {};
// Fetch belonging image to crypto symbol
if (coinbaseReqFailed == false || marketName != "") {
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
if (coinbaseReqFailed == false || marketName != "") {
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
if (coinbaseReqFailed == false || marketName != "") {
    let replaceName = name.replaceAll(" ", "-");
    const latestUrl = 'https://api.coinpaprika.com/v1/coins/' + base.toLowerCase() + '-' + replaceName.toLowerCase() + '/ohlcv/latest/'
    const latestReq = new Request(latestUrl)
    resLatest = await latestReq.loadJSON()
    console.log(coinbaseReqFailed)
    console.log(marketName)
    if (coinbaseReqFailed == false && JSON.stringify(resLatest) != "[]" || marketName != "") {
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

    if (marketName != "") {
        let baseText = baseStack.addText(base)
        baseText.textColor = Color.white()

        if (baseText.length < 5) {
            baseText.font = Font.systemFont(18)
        } else {
            baseText.font = Font.systemFont(17)
        }
    }

    let tickerStack = baseStack.addStack();
    tickerStack.layoutHorizontally();

    console.log(marketName)

    // Stack for ticker image: if course yesterday is lower than today show red ticker
    // if course yesterday
    if (JSON.stringify(resLatest).toLowerCase().includes("errors") == false && JSON.stringify(resLatest) != "[]" &&
        coinbaseReqFailed == false || marketName != "") {
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
    if (coinbaseReqFailed == false || marketName != "") {
        rankText = imageTextStack.addText("Rank: " + rank)
    }
    rankText.textColor = Color.white()
    rankText.font = Font.systemFont(12)

    let marketText = imageTextStack.addText(marketName)
    marketText.textColor = Color.gray()
    marketText.font = Font.mediumSystemFont(9)

    w.addSpacer(8)

    // Full name of crypto token
    let staticText = w.addText(name)
    staticText.textColor = Color.white()
    staticText.font = Font.systemFont(13)
    staticText.centerAlignText()

    if (params[2] != 1) {
        w.addSpacer(2)
        let specialAmount = w.addText(params[2] + " " + base + " =")
        specialAmount.textColor = Color.gray()
        specialAmount.font = Font.mediumSystemFont(9)
        specialAmount.centerAlignText()
    }

    w.addSpacer(8)

    // Round amount to 2 decimal positions
    let amountTxt = "";
    if (coinbaseReqFailed == false || marketName != "") {
        // Cut numbers over 10 Million and show just with ending 'M'
        amount = (amount / 100) * (params[2] * 100)
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