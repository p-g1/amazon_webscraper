const path = require('path')
const dotenv = require('dotenv')
require('dotenv').config();
// Load config
dotenv.config({ path: './config/config.env' })

//exports the keys
module.exports = {
    url : process.env.URL, 
    price : process.env.PRICE, 
    sendUser : process.env.SEND_USER, 
    sendPass : process.env.SEND_PASS, 
    receiver : process.env.RECEIVER, 
}