import Market from './market.js'

class MarketManager {
    constructor(resList, ladel){
        this.markets = this.initializeMarket(resList, ladel)
    }

    initializeMarket(resList, ladel){
        console.log(resList)
        let markets = {};
        for(let i = 0; i < resList.length; i++){
            markets[resList[i]]  = new Market(resList[i], ladel);
        }
        return markets
    }

    getLastPrice(res){
        return this.markets[res].lastPrice;
    }

    getHighBuy(res){
        let price = this.markets[res].highBuy;
        if(price){
            price = price.price;
        }
        return price;
    }

    getLowSell(res){
        let price = this.markets[res].lowSell;
        if(price){
            price = price.price;
        }
        return price;
    }

    post(res, type, id, price, callback){
        this.markets[res].post(type, id, price, callback);
    }
    
    cancelOrder(res, type, id){
        this.markets[res].deleteOrder(type,id);
    }
}

export default MarketManager;