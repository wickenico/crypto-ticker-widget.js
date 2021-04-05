const url = `https://api.coinbase.com/v2/prices/ADA-USD/spot`
const req = new Request(url)
const res = await req.loadJSON()
const base = res.data.base;
const currency = res.data.currency;
const amount = res.data.amount;
const i = new Request('https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/32/white/' + base.toLowerCase() + '.png')
const img = await i.loadImage()


let widget = createWidget(base, amount, currency, img)
if (config.runsInWidget) {
    // create and show widget
    Script.setWidget(widget)
    Script.complete()
}
else {
    widget.presentSmall()
}

function createWidget(base, amount, currency, img) {
    let w = new ListWidget()
    w.backgroundColor = new Color("#1A1A1A")

    let image = w.addImage(img)
    image.imageSize = new Size(45, 45)
    image.centerAlignImage()

    w.addSpacer(8)

    let staticText = w.addText(base + ' - ' + currency + ':')
    staticText.textColor = Color.white()
    staticText.font = Font.boldSystemFont(12)
    staticText.centerAlignText()

    w.addSpacer(8)

    let amountTxt = w.addText(amount + ' ' + currency)
    amountTxt.textColor = Color.orange()
    amountTxt.font = Font.systemFont(16)
    amountTxt.centerAlignText()

    w.addSpacer(8)

    let currentDate = new Date();
    let lastDate = w.addDate(currentDate);
    lastDate.textColor = Color.gray()
    lastDate.font = Font.mediumSystemFont(10)
    lastDate.centerAlignText();

    w.setPadding(0, 0, 0, 0)
    return w
}