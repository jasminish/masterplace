/**
*
* Script-Name: example_get_status
*/

var blockchain = require('mastercard-blockchain');
var MasterCardAPI = blockchain.MasterCardAPI;
var config = require('./config.json');

var consumerKey = config.CONSUMER_KEY;   // You should copy this from "My Keys" on your project page e.g. UTfbhDCSeNYvJpLL5l028sWL9it739PYh6LU5lZja15xcRpY!fd209e6c579dc9d7be52da93d35ae6b6c167c174690b72fa
var keyStorePath = config.KEYSTORE_PATH; // e.g. /Users/yourname/project/sandbox.p12 | C:\Users\yourname\project\sandbox.p12
var keyAlias = config.KEY_ALIAS;   // For production: change this to the key alias you chose when you created your production key
var keyPassword = config.KEY_PASSWORD;   // For production: change this to the key alias you chose when you created your production key
var appID = "TM25";

// You only need to do initialize MasterCardAPI once
//

var authentication = new MasterCardAPI.OAuth(consumerKey, keyStorePath, keyAlias, keyPassword);
MasterCardAPI.init({
  sandbox: true,
  debug: true,
  authentication: authentication
});

var methods = {}

methods.requestData = function() {
  var requestData = {};
  blockchain.Status.query(requestData
    , function (error, data) {
      if (error) {
        console.error("HttpStatus: "+error.getHttpStatus());
        console.error("Message: "+error.getMessage());
        console.error("ReasonCode: "+error.getReasonCode());
        console.error("Source: "+error.getSource());
        console.error(error);

      }
      else {
        console.log('Applications:')
        console.log(data);
        console.log(data.applications);     //Output-->MA99
        console.log(data.current.ref);     //Output-->3ee7d7608368f4133da7c45d7d5f0518d89d540891849b35cfe5ec08e298755d
        console.log(data.current.slot);     //Output-->1503661406
        console.log(data.genesis.ref);     //Output-->92510aeb361b62e982cfabafc56d5b666f29107fb0c5309030b883f702916e80
        console.log(data.genesis.slot);     //Output-->1503599076
        console.log(data.network);     //Output-->1513115205
        console.log(data.version);     //Output-->0.5.0
      }
    });
  }

  methods.readBlock = function (blockHash) {
    var requestData = {};
    blockchain.Block.read('1508632641', requestData
    , function (error, data) {
      if (error) {
        console.error("HttpStatus: "+error.getHttpStatus());
        console.error("Message: "+error.getMessage());
        console.error("ReasonCode: "+error.getReasonCode());
        console.error("Source: "+error.getSource());
        console.error(error);

      }
      else {
        console.log(data.authority);     //Output-->PkvgjbWm7FuWrFaRCyX8HToHtLwJZqzTNi2qYz7tPRiXkogZ59DXR11rbJ7fvrUNx8ogHzSQXSFt2eVnGi5ipHrJ
        console.log(data.nonce);     //Output-->18016650688634213912
        console.log(data.partitions);
        console.log(data.partitions[0].application);     //Output-->1160851504
        console.log(data.partitions[0].entries[0]);     //Output-->50cbc906b2d5e4e795b9aa79ad35e7b9989839a0a0fc95b2ecd063529db365fd
        console.log(data.partitions[0].entry_count);     //Output-->1
        console.log(data.partitions[0].merkle_root);     //Output-->50cbc906b2d5e4e795b9aa79ad35e7b9989839a0a0fc95b2ecd063529db365fd
        console.log(data.previous_block);     //Output-->72af7cf7953f59ef2d2bda2de0028793abd6124c5efdd18a4eddccb5edbeaace
        console.log(data.signature);     //Output-->iKx1CJLjCuUynDdZbxdqEuaJvhyMmUigSdsChHVQWiovi2WcC3Lv5REWtwRo8C6N1FNik32V3umBHzEi6VLVsoMNKjiN7nAfV5
        console.log(data.slot);     //Output-->1503574734
        console.log(data.version);     //Output-->1
      }
    });
  }

methods.requestData();
  // methods.readBlock('cb28c18dab7fcf92f19e18f557a584e751991f4bc79121bd9a03c6c6826727aa');
