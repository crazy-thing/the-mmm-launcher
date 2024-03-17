const { app, BrowserWindow, ipcMain, shell} = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const { signIn, getDefaultAccount } = require('./loginHandler');

const iconPath = path.join(__dirname, 'logo.ico');
function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 1400,
        minHeight: 800,
        autoHideMenuBar: true,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });


    win.loadURL(`file://${path.join(__dirname, 'index.html')}`);


    console.log(__dirname);
    backendProc = spawn(path.join(__dirname, "\\backend\\TheMMMLauncherCLI.exe"));

    backendProc.stdout.on('data', (data) => {
        console.log(`C# Backend Process: ${data}`);
        const dataString = data.toString();
        switch (true) {

            case dataString.startsWith("Progress"):
                try {
                    const progress = parseProgress(data);
                    if (progress !== null) {
                        win.webContents.send('update-progress', progress);
                    } else {
                        console.log("No progress change detected");
                    }
                } catch (error) {
                    console.log(error);
                }
                break;

            case dataString.startsWith("Install-Complete"):
                win.webContents.send("install-complete");
                break;

            case dataString.startsWith("uninstall-complete"):
                win.webContents.send("uninstall-complete");

            case dataString.startsWith("installed-versions"):
                try {
                    const verString = dataString.split(' ').slice(1).join(' ');
                    var installedVersions = JSON.parse(verString);
                    win.webContents.send("installed-versions", installedVersions);          
                } catch (error) {
                    console.log(error);
                }
                break;

            case dataString.startsWith("game-launched"):
                win.webContents.send("game-launched");
                break;
            
            
            default:
                break;
        }
    
    })

    backendProc.on('error', (err) => {
        console.error('Failed to start C# backend', err);
    });
}

const parseProgress = (data) => {
    const progressMatch = data.toString().match(/Progress: (\d+)%/);
    if (progressMatch && progressMatch.length === 2) {
        const progress = parseInt(progressMatch[1]);
        if (!isNaN(progress)) {
            return progress;
        }
    }
    return null;
}

app.on('ready', createWindow);

// get-installed-versions
ipcMain.on('get-installed-versions', (event, arg) => {
    backendProc.stdin.write('get-installed-versions \n');
});

// launch-game <versionModel>
ipcMain.on('launch-game', (event, arg) => {
    backendProc.stdin.write(`launch-game ${JSON.stringify(arg)} \n`);
});

// download-version <versionId> <modpackModel>
ipcMain.on('download-version', (event, arg) => {
    backendProc.stdin.write(`download-version ${arg[0]} ${arg[1]} \n`);
});

// delete-version <versionModel> 
ipcMain.on('delete-version', (event, arg) => {
    backendProc.stdin.write(`delete-version ${JSON.stringify(arg)} \n`);
});

// get-default-account
ipcMain.on('get-default-account', (event, arg) => {
    const defaultAccount = getDefaultAccount();
    console.log("IPC IS WORKING", defaultAccount);
    if (defaultAccount != null) {
        event.reply('default-account-reply', defaultAccount);
    }
});

// sign-in <userAccountModel>
ipcMain.on('sign-in', async (event, arg) => {
   var UserAccountInfo = await signIn();
   console.log(UserAccountInfo);
   if (UserAccountInfo) {
    await backendProc.stdin.write(`sign-in ${JSON.stringify(UserAccountInfo)} \n`);
    event.reply('sign-in-reply', UserAccountInfo);
   } else {
    event.reply('sign-in-failed', "Sign-in failed");
   } 
});

// sign-out <gamerTag>
ipcMain.on('sign-out', async (event, arg) => {
    backendProc.stdin.write(`sign-out ${arg} \n`);
});