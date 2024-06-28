const fs = require('fs');
const path = require('path');
const os = require('node:os');
const { getAppDataPath } = require('./helper');

const getInstalledVersions = () => {
    try {
        const appData = getAppDataPath();
        const modpacksPath = path.join(appData, 'modpacks.json');

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