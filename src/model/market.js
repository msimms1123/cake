class Market {
    constructor(resource, ladel){
        this.resource = resource;
        this.buys = {};
        this.highBuy = null;
        this.sells = {};
        this.lowSell = null;
        this.lastPrice = null;   
        this.ladel = ladel;     
    }

    post(type, id, price, callback){
        if(type === 'buy'){
            if(this.highBuy && this.highBuy.id === id){
                this.highBuy = this.highBuy.next;
            }
            if(!this.buys[id]){
                this.buys[id] = {
                    id,
                    price,            
                    callback,             
                }
            }
            if(this.buys[id].prev){
                this.buys[id].prev.next = this.buys[id].next;
            } 
            if(this.buys[id].next){
                this.buys[id].next.prev = this.buys[id].prev;
            } 
            this.buys[id].price = price;          
            this.buys[id].next = null;
            this.buys[id].prev = null;          
            if(!this.highBuy){
                this.highBuy = this.buys[id];
            }else{
                if(price> this.highBuy.price){
                    this.buys[id].next = this.highBuy;
                    this.highBuy.prev = this.buys[id];
                    this.highBuy = this.buys[id];
                }else{
                    let previous = this.highBuy;
                    while(previous.next && previous.next.price >= price){
                        previous = previous.next;
                    }
                    this.buys[id].prev = previous;
                    this.buys[id].next = previous.next;
                    if(previous.next){
                        previous.next.prev = this.buys[id];
                    }
                    previous.next = this.buys[id];
                }
            }
            
        }else if(type === 'sell'){
            if(this.lowSell && this.lowSell.id === id){
                this.lowSell = this.lowSell.next;
            }
            if(!this.sells[id]){
                this.sells[id] = {
                    id,
                    price,            
                    callback,             
                }
            }
            if(this.sells[id].prev){
                this.sells[id].prev.next = this.sells[id].next;
            } 
            if(this.sells[id].next){
                this.sells[id].next.prev = this.sells[id].prev;
            } 
            this.sells[id].price = price;          
            this.sells[id].next = null;
            this.sells[id].prev = null;          
            if(!this.lowSell){
                this.lowSell = this.sells[id];
            }else{
                if(price < this.lowSell.price){
                    this.sells[id].next = this.lowSell;
                    this.lowSell.prev = this.sells[id];
                    this.lowSell = this.sells[id];
                }else{
                    let previous = this.lowSell;
                    while(previous.next && previous.next.price <= price){
                        previous = previous.next;
                    }
                    this.sells[id].prev = previous;
                    this.sells[id].next = previous.next;
                    if(previous.next){
                        previous.next.prev = this.sells[id];
                    }
                    previous.next = this.sells[id];
                }
            }
        }else{
            console.log('ERROR: post type:'+type)
        }
        this.checkForTrans();
    }

    checkForTrans(){
        if(this.highBuy && this.lowSell && (this.highBuy.price >= this.lowSell.price)){
            let p1 = this.highBuy.price;
            let p2 = this.lowSell.price;
            let price = (p1+p2)/2;
           // console.log(this.highBuy, this.lowSell)
            let cakeQuery = this.highBuy.callback(price, this.resource);
            this.lowSell.callback(price);
            let buyId = this.highBuy.id;
            let sellId = this.lowSell.id;
            this.highBuy = this.highBuy.next;
            this.lowSell = this.lowSell.next;
            this.buys[buyId] = null;
            this.sells[sellId] = null;
            this.lastPrice = price;
            if(cakeQuery){
                this.cakeBought(cakeQuery)
            }
        }
    }
    deleteOrder(type, id){
        console.log(id, type)
        if(type === 'buy'){
            if(this.highBuy && this.highBuy.id === id){
                this.highBuy = this.highBuy.next;
                if(this.highBuy){
                    this.highBuy.prev = null;
                }
            }else{
                if(this.buys[id]){
                    this.buys[id].prev.next = this.buys[id].next;
                    if(this.buys[id].next){
                        this.buys[id].next.prev = this.buys[id].prev;
                    }
                }
            }
            delete this.buys[id];
        }else if(type === 'sell'){
            if(this.lowSell && this.lowSell.id === id){
                this.lowSell = this.lowSell.next;
                if(this.lowSell){
                    this.lowSell.prev = null;
                }
            }else{
                if(this.sells[id]){
                    this.sells[id].prev.next = this.sells[id].next;
                    if(this.sells[id].next){
                        this.sells[id].next.prev = this.sells[id].prev;
                    }
                }
            }
            delete this.sells[id];
        }else{
            console.log('invalid delete type')
        }
    }

    cakeBought(obj){
        this.ladel({...obj});
    }
}

export default Market;