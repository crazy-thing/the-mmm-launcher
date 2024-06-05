const fs = require('fs');
const path = require('path');
const { getAppDataPath } = require('./helper');


const getSettings = () => {
    try {
        const appDataPath = getAppDataPath();
        const settingsPath = path.join(appDataPath, 'settings.json');

        const data = fs.readFileSync(settingsPath, 'utf-8'); 
        const allModpacks = JSON.parse(data);
        return allModpacks;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

module.exports = {
    getSettings,
}