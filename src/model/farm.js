class Farm {
    constructor(recipe){
        this.recipe = recipe;
    }

    harvest(res){
        let harvSuccess = Math.random() < this.recipe[res].rate;
        if(harvSuccess){
            return 1;
        }else{
            return 0;
        }
    }
}

export default Farm