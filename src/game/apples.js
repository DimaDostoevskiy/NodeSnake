const random = require('../lib/random');
const UniqId = require('uid');


module.exports = {
    apples: [],
    removeApple(id) {
        const badAppleIdx = this.apples.findIndex(apple => apple.id === id);
        this.apples.splice(badAppleIdx, 1);
    },
    generateApples(count, minCord = 0, maxCord = 3000) {
        const apples = [];
        for(let i = 0; i<count; i++){
            apples.push({
                id: UniqId.uid(5),
                radius: random.int(1, 7),
                X: random.int(minCord, maxCord),
                Y: random.int(minCord, maxCord),
                color: 'rgb(40,223,101)'
            })
        }
        this.apples = apples;
    },
}