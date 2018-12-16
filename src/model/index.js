import idGen from 'short-uuid'
import recipe from './recipe.js'
import MarketManager from './marketManager.js'
import Cook from './cook'
import Farmer from './farmer'
import Farm from './farm'


class Model {
    constructor(){
        this.MarketManager = null;
        this.recipe = recipe
        this.farm = null;
        this.happyBucket = 0;
        this.inithappyness = 10;
        this.agents ={
        };
        
        this.ladel = this.ladel.bind(this);
        
        this.initialize();        

        for(let i = 0; i< 1000; i++){
            this.checkHappyness('Happyness Checker ')
            console.log(i);
            this.runRound();
            console.log(this)
        }

    }

    initialize(){
        this.MarketManager =  new MarketManager(Object.keys(recipe), this.ladel);
        this.farm = new Farm(this.recipe);
        Object.keys(this.recipe).forEach(key=>{
            let quantity = this.recipe[key].workers;
            this.agents[key] = {
                happyness: 0,
                agents:[]
            }
            if(this.recipe[key].recipe){
                for(let i = 0; i < quantity; i++){
                    this.agents[key].agents.push(new Cook(key+"-"+i, key, 0, 20, this.inithappyness, recipe, this.MarketManager,50)) 
                    this.agents[key].happyness += this.inithappyness;
                }                
            }else if(this.recipe[key].rate){
                for(let i = 0; i < quantity; i++){
                    this.agents[key].agents.push(new Farmer(key+"-"+i, key, 0, 0, this.inithappyness, this.farm, this.MarketManager,20, recipe) ) 
                    this.agents[key].happyness += this.inithappyness ;  
                }
            }else{
                console.log("ERROR: No Recipe or Rate");
            }
        })
        
        
    }

    runRound(){
        let concatinationOfAgents = [];
        Object.keys(this.agents).map(key => {
            concatinationOfAgents = concatinationOfAgents.concat(this.agents[key].agents);
        })
        let agents = this.shuffleArray(concatinationOfAgents);
        for(let i = 0; i < agents.length; i++){
            let res = agents[i].resource;
            agents[i].postSell();
            agents[i].buyCake();
            if(agents[i].farm){
                agents[i].harvest();
            }else{
                agents[i].cook();
                agents[i].postBuys();
                agents[i].cook();
            }
            if(agents[i].happyness > 0){
                agents[i].happyness--;
                this.agents[res].happyness--;
                this.happyBucket++;
            }else if(this.willChangeJobs(agents[i].happyness)){
                if(this.agents[res].agents.length > 1){
                    this.changeJob(agents[i], res);
                }
            }
           
        }
    }

    ladel(agRes){
        let {agent, res} = agRes
        let reward = Math.floor(this.happyBucket/5)
        console.log(this.happyBucket, agent)
        this.agents[res].happyness += reward;
        agent.happyness += reward;
        this.happyBucket -= reward;
    }


    willChangeJobs(happyness){
        if(happyness){
            return false;
        }
        return (Math.random() < .05);
    }

    changeJob(agent, res){
        agent.deleteAllOrders();
        let probabilities = Object.keys(this.agents).map(key =>{
            return {
                key,
                prob: this.agents[key].happyness / this.agents[key].agents.length
            }
        });
        let normhappyness = 0;
        for(let i = 0; i < probabilities.length; i++){
            normhappyness += probabilities[i].prob;
        }
        let diceRoll = Math.floor(Math.random() * normhappyness);
        let newJob;
        for(let i = 0; i < probabilities.length; i++){
            let resource = probabilities[i].key;
            if(diceRoll > probabilities[i].prob){
                diceRoll -= probabilities[i].prob;
            }else{
                newJob = resource;
                break;
            }
        }

        let id = agent.id;
        let ind;
        let agents = this.agents[res].agents
        for(let i = 0; i< agents.length; i++){
            if(agents[i].id === id){
                ind = i;
                break;
            }
        }

        // console.log('newJob stuff');
        // console.log(this.agents[res].agents[ind].id);
        // console.log('-------------');

        this.agents[res].agents.splice(ind,1);
        this.agents[newJob].happyness += this.inithappyness;
        if(this.recipe[newJob].recipe){
            this.agents[newJob].agents.push(new Cook(newJob+"-"+idGen.generate(), newJob, 0, 20, this.inithappyness, recipe, this.MarketManager,50))      
        }else if(recipe[newJob].rate){
            this.agents[newJob].agents.push(new Farmer(newJob+"-"+idGen.generate(), newJob, 0, 0, this.inithappyness, this.farm, this.MarketManager,20,recipe))  
        }else{
            console('wtf')
        }
    }

    shuffleArray(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }
    checkHappyness(input){
        let cont = true
        Object.keys(this.agents).forEach(key =>{
            let h = this.agents[key].happyness;
            let sum = 0;
            for(let i = 0; i< this.agents[key].agents.length; i++){
                sum += this.agents[key].agents[i].happyness;
            }
            if(sum !== h){
                console.log(input, key +','+h+','+sum)
                cont = false
            }
        })
        return cont
    }
}

export default Model;