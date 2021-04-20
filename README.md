# crypto-ticker-widget.js
A Scriptable widget that shows the current crypto course in fiat currency based on coinbase

 ![GitHub last commit](https://img.shields.io/github/last-commit/wickenico/crypto-ticker-widget.js) ![GitHub commit activity](https://img.shields.io/github/commit-activity/y/wickenico/crypto-ticker-widget.js)
 ![Visits Badge](https://badges.pufler.dev/visits/wickenico/crypto-ticker-widget.js)

![cryptoTickerWidget](img/cryptoTickerWidget.jpg)

 <p>
   <a href="#description">Setup</a> • 
   <a href="#setup">Setup</a> •
   <a href="#usage">Usage</a> •
   <a href="#links">Links</a> •
   <a href="#contribution">Contribution</a> •
   <a href="#todo">TODO</a> •
 </p>

## Description

## Setup

1. (if not done yet) Download the scriptable app form [AppStore](https://apps.apple.com/de/app/scriptable/id1405459188)
 2. In Scriptable create a new script
 3. Copy the code from script file [crypto-ticker-widget.js](https://github.com/wickenico/crypto-ticker-widget.js/blob/main/crypto-ticker-widget.js)
 4. Create a new widget on homescreen and select this script in scriptable

 ## Usage
- Parameters separated with ",": 
  - Symbol of crypto currency
  - symbol of fiat currency
  - amount of crypto to calculate
- Example: DOGE,USD,300 (small and big letters possible)
- The third parameter is set to 1 if it is not passed
- If there's no picture of the selected available it will be filled with a placeholder image

![cryptotickerWidgetSettings](img/cryptoTickerWidgetSettings.jpg) <br>

![cryptotickerWidgetADA](img/cryptoTickerWidgetDOGE.jpg)
## Links
Coinbase API: https://developers.coinbase.com/api/v2#get-spot-price <br>
Coinpaprika API: https://api.coinpaprika.com/#tag/Tools/paths/~1search/get <br>

## Contribution

If you have any ideas for extensions or changes just let me know.

## TODO

- DONE: Errorhandling for missing json objects
- DONE: Add up and down symbols
- DONE: Fallback to Bitfinex course
- DONE: New Parameter for a specific amount
- Update images and description
