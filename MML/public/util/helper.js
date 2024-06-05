const { dialog, app } = require('electron');
const os = require('node:os');
const path = require('node:path');

const parseProgress = (data) => {
    const progressMatch = data.toString().match(/Progress: (\d+)%/);
    if (progressMatch && progressMatch.length === 2) {
        const progress = parseInt(progressMatch[1]);
        if (!isNaN(progress)) {
            return progress;
        }
    }
    return null;
};

const getAppDataPath = () => {
    const platform = os.platform();
    let appDataPath;

    switch(platform) {
        case "win32":
            appDataPath = process.env.APPDATA;
            break;
        case "darwin": 
            appDataPath = path.join(os.homedir(), "Library", "Application Support");
            break;
        case "linux":
            appDataPath = path.join(os.homedir(), ".config");
            break;
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }

    return path.join(appDataPath, "MML");
}


module.exports = {
    parseProgress,
    getAppDataPath
};