const fs = require('fs');
const path = require('path');

const getSettings = () => {
    try {
        const appDataPath = process.env.APPDATA;
        const launcherFolder = path.join(appDataPath, 'MML');
        const settingsPath = path.join(launcherFolder, 'settings.json');

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