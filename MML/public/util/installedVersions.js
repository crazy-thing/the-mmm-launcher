const fs = require('fs');
const path = require('path');

const getInstalledVersions = () => {
    try {
        const appDataPath = process.env.APPDATA;
        const launcherFolder = path.join(appDataPath, 'MML');
        const modpacksPath = path.join(launcherFolder, 'modpacks.json');

        const data = fs.readFileSync(modpacksPath, 'utf-8'); 
        const allModpacks = JSON.parse(data);
        return allModpacks;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

module.exports = {
    getInstalledVersions,
}