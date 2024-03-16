const { Auth } = require('msmc');
const fs = require('fs');

const getDefaultAccount = () => {
    try {
        const data = fs.readFileSync("./userAccounts.json", 'utf-8'); // dev ./src/userAccounts.json
        const jsonObject = JSON.parse(data);
        const defaultAccount = jsonObject[0];
        return defaultAccount;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

const signIn = async () => {
    try {
        const authManager = new Auth("select_account");
        const xboxManager = await authManager.launch("electron");
        const token = await xboxManager.getMinecraft();
        const xboxSocial = await xboxManager.getSocial();
        const xboxProfile = await xboxSocial.getProfile();

        const MSession = {
            Username: token.mclc().name,
            UUID: token.mclc().uuid,
            AccessToken: token.mclc().access_token,    
            ClientToken: token.mclc().client_token,
        };

        const UserAccount = {
            GamerTag: xboxProfile.gamerTag,
            ProfilePicture: xboxProfile.profilePictureURL,
            MSession: MSession
        };

        console.log(UserAccount);
        return UserAccount;        
    } catch (error) {
        console.log('An error occurred: ', error);
    }
};



module.exports = { 
    getDefaultAccount,
    signIn
};
