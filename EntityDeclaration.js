//TODO
//MOVE ALL ENTITY DECLARATIONS TO A SEPARATE FILE,
//or refactor the entity system to be cleaner

let images = ["ball.png", "disposal.png", "trash.png", "pencil.png", "wall.png", "user.png"];
for(let i = 0; i < images.length; ++i){
    let im = document.createElement('img');
    im.src = images[i];
    images[i] = im;
}

let ActionList = {
    "Movement" : Movement,
    "Health" : Health,
    "Attack" : Attack,
    "Interaction" : Interaction,
    "Collision" : Collision,
    "Controllable" : Controllable
};

let ItemList = {
    "Ball" : {
        "color" : "red",
        "size" :11,
        "actions" : [
            "Movement",
            "Collision",
            "Interaction",
            "Health"
        ],
        "properties" : [  
        ],
        "flags" : {
            "Health": 4
        },
        "texture": images[0]
    },
    "Disposal" : {
        "color" : "silver",
        "size" : 3,
        "selected" : false,
        "actions" : [
            "Interaction",
            "Attack"
        ],
        "properties" : [  
        ],
        "flags" : {
            "Attack" : 5
        },
        "texture": images[1]
    },
    "Trash" : {
        "color" : "darkgreen",
        "size" : 2,
        "actions" : [
            "Movement",
            "Collision",
            "Interaction",
            "Health"
        ],
        "properties" : [ 
            "Destruct" 
        ],
        "flags" : {
            "Health" : 8
        },
        "texture": images[2]
    },
    "Pencil" : {
        "color" : "yellow",
        "size" : 6,
        "actions" : [
            "Movement",
            "Collision",
            "Interaction",
            "Controllable"
        ],
        "properties" : [
            "Destruct"  
        ],
        "flags" : [
            
        ],
        "texture": images[3]
    },
    "Wall" : {
        "color" : "black",
        "size" : 3,
        "actions" : [
            "Collision",
            "Interaction"
        ],
        "properties" : [  
        ],
        "flags" : {
            "Controllable": [
                "control-only",
                "fast"
            ]
        },
        "texture": images[4]
    },
    "User" : {
        "size" : 3,
        "selected" : false,
        "actions" : [
            "Movement",
            "Collision",
            "Interaction",
            "Controllable",
            "Attack",
            "Health"
        ],
        "properties" : [ 
            "Destruct"
        ],
        "flags" : {
            "Controllable": [
                "free-fall", //Movement only flag
                "fast"
            ],
            "Attack" : 10,
            "Health" : 8
        },
        "texture": images[5]
    },
}
    
var keyState=[];
var keyStates={};
function Controllable(entity){ 
    let s = 0;  
    if(entity.selected){
        if(Object.keys(entity.Item.flags).indexOf("Controllable") < 0){
            console.log("Items with the Controllable action require a Controllable flag value...");
            entity.Item.actions.splice(entity.Item.actions.indexOf("Controllable"),1);
            return;
        } 
        
        if(keyState['w'] || keyState['a'] || keyState['s'] || keyState['d']){
            if(entity.Item.flags.Controllable.indexOf("fast") > -1){
                s = .2;
            }else s = .01;
            if(keyState['w']){
                entity.dy -= s;
            }
            if(keyState['s']){
                entity.dy += s;
            }
            if(keyState['a']){
                entity.dx -= s;
            }
            if(keyState['d']){
                entity.dx += s;
            }
            if(Object.keys(entity.Item.flags).indexOf("Controllable") > -1){
                if(entity.Item.actions.indexOf("Movement") < 0){
                    entity.Item.actions.push("Movement");
                }
            }
        }else{
            if(entity.Item.actions.indexOf("Movement") > -1){
                if(Object.keys(entity.Item.flags).indexOf("Controllable") > -1){
                    if(entity.Item.flags["Controllable"].indexOf("free-fall") < 0){
                        entity.Item.actions.splice(entity.Item.actions.indexOf("Movement"),1);  
                    }                    
                }
            }
        }
    }
}

function Movement(entity){
    if(!entity.dx) entity.dx = Math.random() * (1 - -1) + -1;
    if(!entity.dy) entity.dy = Math.random() * (1 - -1) + -1;
    entity.Position.x += entity.dx;
    entity.Position.y += entity.dy;

    if(entity.Position.x > canvas.width - (entity.Item.texture.width/entity.Item.size) || entity.Position.x < 0) entity.dx *= -1;
    if(entity.Position.y > canvas.height - entity.Item.texture.height/entity.Item.size || entity.Position.y < 0) entity.dy *= -1;
}

function Collision(entity){
    let tempdx = entity.dx;
    let tempdy = entity.dy;
    for(let e = 0; e < EntityList.length; ++e){
        let ent = EntityList[e];
        if(ent != entity){
            //TODO
            if((ent.Position.x <= entity.Position.x + entity.Item.texture.width/entity.Item.size && ent.Position.x + ent.Item.texture.width/ent.Item.size >= entity.Position.x) &&
            (ent.Position.y <= entity.Position.y + entity.Item.texture.height/entity.Item.size && ent.Position.y + ent.Item.texture.height/ent.Item.size >= entity.Position.y)){
                if(entity.Item.actions.indexOf("Attack") > -1 && ent.Item.properties.indexOf("Destruct") > -1){
                    ActionList[entity.Item.actions[entity.Item.actions.indexOf("Attack")]](entity, ent);
                }else if(ent.Item.actions.indexOf("Attack") > -1 && entity.Item.properties.indexOf("Destruct") > -1){
                    ActionList[ent.Item.actions[ent.Item.actions.indexOf("Attack")]](ent, entity);
                }
                entity.dx = ent.dx;
                entity.dy = ent.dy;
                ent.dx =  tempdx;
                ent.dy =  tempdy;
                //TODO create "removed" or "dead" property
                if(!entity.dx && !entity.dy){
                    ent.dx = ent.dx;
                    ent.dy = ent.dy
                }
                if(!ent.dx && !ent.dy){
                    entity.dx = entity.dx;
                    entity.dy = entity.dy
                }
            }
        }
    }
}
function Health(entity){
    if(Object.keys(entity.Item.flags).indexOf("Health") < 0){
        console.log("Items with the Health action require a Health flag value...");
        entity.Item.actions.splice(entity.Item.actions.indexOf("Health"),1);
    }
}
function Attack(atk_entity, entity){
    if(entity) {
        EntityList.splice(EntityList.indexOf(entity), 1);
    }
    // }else{
    //     if(Object.keys(atk_entity.Item.flags).indexOf("Attack") < 0){
    //         console.log("Items with the Attack action require an Attack flag value...");
    //         entity.Item.actions.splice(entity.Item.actions.indexOf("Attack"),1);
    //     }else{
    //         //TODO add some input validation
    //         //verify valid flag values
    //         entity.Item.attack = parseInt(entity.Item.flags["Attack"].split("-")[1]);
    //     }
    // }
    
}
function Interaction(entity, x, y){
    if(x && y) entity.Position = {'x':x-(entity.Item.texture.width/entity.Item.size)/2, 'y':y-(entity.Item.texture.height/entity.Item.size)/2};
}

function Destruct(entity){
    console.log(entity);
    EntityList.splice(EntityList.indexOf(entity), 1);
}


//TODO
//Find out about better class usage
class Entity{
    Item = {};
    constructor (item){
        //allow multiple actions
        //allow 1 item type
        this.Position = {"x":0, "y":0};
        let copy = item;
        this.Item = copy;
        this.dx=0;
        this.dy=0;
        this.selected = false;
        this.color = "rgb("+Math.random()*256+","+Math.random()*256+","+Math.random()*256+")";
    }

    update(){
        for(let action = 0; action < this.Item.actions.length; ++action){
            ActionList[this.Item.actions[action]](this);
        }
    }
};