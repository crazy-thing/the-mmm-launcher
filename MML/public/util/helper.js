const { dialog } = require('electron');

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


module.exports = {
    parseProgress,
};