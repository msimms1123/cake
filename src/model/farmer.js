class Farmer {
    constructor(id, resource, resQuant, cash, happyness, farm, market, initSellPrice, recipe){
        this.id = id;
        this.cake = this.initCake(recipe);
        this.resource = resource;
        this.market = market;
        this.farm = farm;
        this.happyness = happyness;
        this.initSellPrice = initSellPrice;
        this.inventory = {
            cash,
            [resource]: resQuant
        }

        this.sellCallback = this.sellCallback.bind(this);
        this.buyCakeCallback = this.buyCakeCallback.bind(this);
    }

    initCake(recipe){
        let cake = null
        Object.keys(recipe).map(key => {
            if(recipe[key].isCake){
                cake = key
            }
        })
        return cake;
    }

    harvest(){
        let collected = this.farm.harvest(this.resource);
        this.inventory[this.resource] += collected;
    }

    postSell(){
        if(!this.inventory[this.resource]){
            return false;
        }

        let lowSell = this.market.getLowSell(this.resource);        
        let last = this.market.getLastPrice(this.resource);

        let price;

        if(lowSell || lowSell === 0){            
            price = lowSell - 1    
        }else if(last || last === 0){            
            price = last + 1
        }else{
            price = this.initSellPrice
        }

        price = price < 0? 0 :price;
        this.market.post(this.resource, 'sell', this.id, price, this.sellCallback)
    }

    sellCallback(price){
        this.inventory[this.resource] -= 1;
        this.inventory.cash += price
    }

    deleteAllOrders(){
        this.market.cancelOrder(this.resource, 'sell', this.id)
        this.market.cancelOrder(this.cake, 'buy', this.id)
    }

    buyCake(){
        this.postBuy(this.cake, true);
    }

    postBuy(res, isCake){
        let highBuy = this.market.getHighBuy(res);
        let last = this.market.getLastPrice(res);
        let lowSell = this.market.getLowSell(res);

        let price;

        if(highBuy || highBuy === 0){
            price = highBuy + 1;
        }else if(last || last === 0){
            price = last - 1;
        }else{            
            price = 0;
        }

        if(!lowSell && !last){
            price = 0;
        }

        price = price <= this.inventory.cash? price : this.inventory.cash;
        price = price < 0? 0 : price;
        
        let callBack =  this.buyCakeCallback;

        this.market.post(res, 'buy', this.id, price, callBack);        
    }

    buyCakeCallback(price,res){
        console.log('price:', price)
        this.inventory.cash -= price;
        return {agent:this, res:this.resource};
    }

}

export default Farmer