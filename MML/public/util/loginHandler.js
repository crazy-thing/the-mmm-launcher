const { Auth } = require('msmc');
const fs = require('fs');
const path = require('path');

const getDefaultAccount = () => {
    try {
        const appDataPath = process.env.APPDATA;
        const launcherFolder = path.join(appDataPath, 'MML');
        const userAccountsPath = path.join(launcherFolder, 'userAccounts.json');

        const data = fs.readFileSync(userAccountsPath, 'utf-8'); 
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
