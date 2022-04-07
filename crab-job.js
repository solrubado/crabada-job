require('dotenv').config();

const axios = require('axios');
const cron = require('node-cron');

const url = 'https://api.telegram.org/bot';
const apiToken = process.env.API_TOKEN;

const seenCrabs=[]

const convertDecimalToHex = (bn) => {
    var base = 16;
    var hex = BigInt(bn).toString(base);
    if (hex.length % 2) {
      hex = '0' + hex;
    }
  
    return hex;
  }


const calculateCrabs = () => {
    axios.get('https://api.crabada.com/public/crabada/selling?from_pure=6&to_breed_count=0&page=1&limit=1000&from_breed_count=0&to_pure=6&class_ids[]=3&class_ids[]=6')
    .then(({data}) => {
        console.log("is running..")
        const crabadas = data.result.data;
        const specialCrabadas = []
        const filterCrabadas = crabadas.filter(crab => 
            !seenCrabs.find(seenCrab => seenCrab.id === crab.id)
        )
        filterCrabadas.forEach(crab => {
            const adn = crab.dna;
            const hexDna = convertDecimalToHex(adn)
            const adn36 = hexDna.substring(hexDna.length - 36)
            const decAdn = adn36.match(/.{2}/g).map(adn => {
                return parseInt(adn, 16)
            })

    
            if (crab.class_name === 'PRIME'){
                // if it has more than 9 fantom subclasses
                const fantomAdn = decAdn.filter(adn => adn === 36).length;
                if( fantomAdn >= 9){
                    const foundCrab = {
                        id: crab.id,
                        searchedSubclass: 'Fantom',
                        quantity:fantomAdn
                    }
    
                    specialCrabadas.push(foundCrab)
    
                }
    
                // if it has more than 6 avalanche subclasses
                const avalancheAdn = decAdn.filter(adn => adn === 37).length;
                if(avalancheAdn >= 6){
                    const foundCrab = {
                        id: crab.id,
                        searchedSubclass: 'Avalanche',
                        quantity: avalancheAdn
                    }
    
                    specialCrabadas.push(foundCrab)
                }
            }
    
            if(crab.class_name === 'RUINED'){
                // if it has more than 9 crauldron subclasses
                const crauldronAdn = decAdn.filter(adn => adn === 83).length
                if( crauldronAdn >= 9){
                    const foundCrab = {
                        id: crab.id,
                        searchedSubclass: 'Crauldron',
                        quantity: crauldronAdn
                    }
    
                    specialCrabadas.push(foundCrab)
                }
            }
    
        });
    
        const writeMessage = () => {
            var message = "New crabadas: \n";
    
            specialCrabadas.forEach(crab => {
                message = message+` https://marketplace.crabada.com/crabada/${crab.id} \n`
            })
    
            return message;
        }
        
        if(specialCrabadas.length > 0){
            [1675701092,1687663975].forEach(chatId => {
                axios.post(`${url}${apiToken}/sendMessage`,
                {
                    chat_id: chatId,
                    text: writeMessage()
                })
                .then((notification) => { 
                    specialCrabadas.forEach(crab => seenCrabs.push(crab))
                }).catch((error) => {
                    console.log(error.message)
                });
            
            })
        }
        
    })

}

cron.schedule('* * * * *', ()=>calculateCrabs())