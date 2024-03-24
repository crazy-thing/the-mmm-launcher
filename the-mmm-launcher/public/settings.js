const fs = require('fs');
const path = require('path');

const getSettings = () => {
    try {
        const appDataPath = process.env.APPDATA;
        const launcherFolder = path.join(appDataPath, 'The MMM Launcher');
        const settingsPath = path.join(launcherFolder, 'settings.json');

        const data = fs.readFileSync(settingsPath, 'utf-8'); // dev ./src/settings.json
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