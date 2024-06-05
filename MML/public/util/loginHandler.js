const { Auth, tokenUtils } = require('msmc');
const fs = require('fs');
const path = require('path');
const { getAppDataPath } = require('./helper');

const readDataFromFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data from file:', error);
        return null;
    }
};

const writeDataToFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing data to file:', error);
    }
};

const getDefaultAccount = async () => {
    try {
        const appDataPath = getAppDataPath();
        const userAccountsPath = path.join(appDataPath, 'userAccounts.json');
        const jsonObject = readDataFromFile(userAccountsPath);
        const defaultAccount = jsonObject ? jsonObject[0] : null;

        return defaultAccount;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

const signIn = async () => {
    try {
        const authManager = new Auth("select_account");
        const appDataPath = getAppDataPath();
        const tokenPath = path.join(appDataPath, 'token.json');
        const userAccountsPath = path.join(appDataPath, 'userAccounts.json');


        let MSession;
        let UserAccount;
        let success;

        if (fs.existsSync(userAccountsPath)) {
            const oldToken = readDataFromFile(tokenPath);
            const newToken = tokenUtils.fromToken(authManager, oldToken);

            const result = await newToken.refresh(false);
            // should refresh when token expires
                        
            MSession = {
                Username: result.mclc().name,
                UUID: result.mclc().uuid,
                AccessToken: result.mclc().access_token,    
                ClientToken: result.mclc().client_token,
            };


            const defaultAcc = await getDefaultAccount();


            try {
                await fs.promises.unlink(userAccountsPath);
            } catch (error) {
                console.error(error);
            }

            UserAccount = {
                GamerTag: defaultAcc.GamerTag,
                ProfilePicture: defaultAcc.ProfilePicture,
                MSession: MSession
            };


        } else {

            const xboxManager = await authManager.launch("electron");
            const token = await xboxManager.getMinecraft();
            const xboxSocial = await xboxManager.getSocial();
            const xboxProfile = await xboxSocial.getProfile();


            const savedToken = token.getToken();
            writeDataToFile(tokenPath, savedToken)
    
            MSession = {
                Username: token.mclc().name,
                UUID: token.mclc().uuid,
                AccessToken: token.mclc().access_token,    
                ClientToken: token.mclc().client_token,
            };

            UserAccount = {
                GamerTag: xboxProfile.gamerTag,
                ProfilePicture: xboxProfile.profilePictureURL,
                MSession: MSession
            };

            try {
                await fs.promises.unlink(userAccountsPath);
            } catch (error) {
                console.error(error);
            }
        }

        return UserAccount;        
    } catch (error) {
        console.log('An error occurred: ', error);
    }
};

module.exports = { 
    getDefaultAccount,
    signIn
};