class Cook {
    constructor(id, resource, resQuant, cash, happyness, recipe, market, initSellPrice){
        this.id = id;
        this.market = market;    
        this.happyness = happyness;    
        this.resource = resource;
        this.recipe = recipe[resource].recipe;
        this.availibleCash = cash;
        this.cake = this.initCake(recipe);
        this.prudentReserve = initSellPrice;
        this.inventory = {
            [resource]: resQuant,
            cash
        }
        this.initSellPrice = initSellPrice;
        this.initInventory();
    
        this.buyCallback = this.buyCallback.bind(this);
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

    initInventory(){
        Object.keys(this.recipe).map(key => {
            this.inventory[key] = 0;
        })
    }

    buyCake(){
        this.availibleCash = this.inventory.cash;
        if(this.inventory[this.resource]){
            this.postBuy(this.cake, true);
        }
    }

    cook(){
        if(this.canCook()){
            Object.keys(this.recipe).map(key=>{
                this.inventory[key] -= this.recipe[key];                  
            })
            this.inventory[this.resource] += 1;

        }
    }
    canCook(){
        let canCook = true
        Object.keys(this.recipe).map(key=>{
            if(this.inventory[key]< this.recipe[key]){
                canCook =  false;
            }
        })
        return canCook;
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

    postBuys(){
        if(this.inventory[this.resource] < 1){
            shuffleArray(Object.keys(this.recipe)).map( key => {
                if(this.inventory[key] < this.recipe[key]){
                    this.postBuy(key);
                }
            })
        }
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

        price = price <= this.availibleCash? price : this.availibleCash;
        this.availibleCash -= price;        
       
        price = price < 0? 0 :price;
        let callBack = isCake? this.buyCakeCallback : this.buyCallback ;

        this.market.post(res, 'buy', this.id, price, callBack);        
    }

    sellCallback(price){
        this.inventory[this.resource] -= 1;
        this.inventory.cash += price
    }

    buyCallback(price, res){
        this.inventory[res]++;
        this.inventory.cash -= price;
    }
    buyCakeCallback(price, res){
        this.inventory.cash -= price;
        return {agent:this, res:this.resource};
    }

    deleteAllOrders(){

        Object.keys(this.recipe).forEach( key => {
            this.market.cancelOrder(key, 'buy', this.id)
        })
        this.market.cancelOrder(this.resource, 'sell', this.id)
        this.market.cancelOrder(this.cake, 'buy', this.id)
    }
}

function shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

export default Cook;