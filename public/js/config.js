function getCurrentConfig(){
    return {
        //Please put name and session id joined by _ for example Shreya_Pandit
        "name": "Test_User",
        "sessionID": "Session_2",
        "snippetLength": 8000,
        "date": Date.now()
    };
}


module.exports = getCurrentConfig();
