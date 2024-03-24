const { app, BrowserWindow, ipcMain, shell, dialog, Tray, Menu} = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const { signIn, getDefaultAccount } = require('./loginHandler');
const { getInstalledVersions } = require('./installedVersions');
const { getSettings } = require('./settings');

let win;
let tray;

const iconPath = path.join(__dirname, 'logo.ico');
function createWindow() {
    win = new BrowserWindow({
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


    win.loadURL("http://127.0.0.1:3000");

    // release    win.loadURL(`file://${path.join(__dirname, 'index.html')}`);
    // dev win.loadURL("http://127.0.0.1:3000");

    console.log(__dirname);
    backendProc = spawn('dotnet', ['run', '--project', path.join(process.cwd(), '../TheMMMLauncherCLI/TheMMMLauncherCLI.csproj')]);
    
    // release    spawn(path.join(__dirname, "\\backend\\TheMMMLauncherCLI.exe"));
    // dev spawn  spawn('dotnet', ['run', '--project', path.join(process.cwd(), '../TheMMMLauncherCLI/TheMMMLauncherCLI.csproj')]);

    backendProc.stdout.on('data', (data) => {
        console.log(`C# Backend Process: ${data}`);
        const dataString = data.toString();
        switch (true) {

            case dataString.includes("Progress"):
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
            case dataString.includes("version-selected"):
                win.webContents.send("version-selected");
                break;
            case dataString.startsWith("uninstall-complete"):
                win.webContents.send("uninstall-complete");
            case dataString.includes("settings-loaded"):
                var settings = getSettings();
                win.webContents.send('settings', settings);
            case dataString.startsWith("installed-versions"):
                try {
                    /*
                    const verString = dataString.split(' ').slice(1).join(' ');
                    console.log(`verStr: ${verString}`);
                    var installedVersions = JSON.parse(verString);
                    */
                    //var installedVersions = getInstalledVersions();
                    //win.webContents.send("installed-versions", installedVersions);     
                } catch (error) {
                    console.log(error);
                }
                break;
            case dataString.includes("no-account"):
                showErrorMessage("Not signed in. Please sign-in to your Microsoft account.");
                win.webContents.send("game-launched");
                break;
            case dataString.startsWith("game-launched"):
                win.webContents.send("game-launched");
                var settings = getSettings();
                if (settings.MinimizeLauncher === true) {
                    win.hide();
                } else if (settings.ExitLauncher === true) {
                    app.quit();
                } else {
                    console.log("Game Launched!");
                }
                break;
            
            
            default:
                break;
        }
    
    })

    backendProc.on('error', (err) => {
        console.error('Failed to start C# backend', err);
    });
}

const createTray = () => {
    const trayIconPath = path.join(__dirname, 'logo.ico');
    tray = new Tray(trayIconPath);

    const contextMenu =  Menu.buildFromTemplate([
        { label: 'Open', click: () => win.show() },
        { label: 'Quit', click: () => app.quit() },
    ]);
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
        }
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

app.on('ready', () => {
    createWindow();
    createTray();
});

const showErrorMessage = (message) => {
    dialog.showMessageBox(win, {
        type: 'error',
        title: 'Error',
        message: message,
        buttons: ['OK']     
    });
};

// get-installed-versions
ipcMain.on('get-installed-versions', (event, arg) => {
    var versions = getInstalledVersions();
    event.reply('installed-versions', versions);
});

// launch-game <modpackId> <versionModel>
ipcMain.on('launch-game', (event, arg) => {
    backendProc.stdin.write(`launch-game ${arg[0]} ${JSON.stringify(arg[1])} \n`);
});

// download-version <versionId> <modpackModel>
ipcMain.on('download-version', (event, arg) => {
    backendProc.stdin.write(`download-version ${arg[0]} ${arg[1]} \n`);
});

// select-version <modpackId> <versionId>
ipcMain.on('select-version', (event, arg) => {
    backendProc.stdin.write(`select-version ${arg[0]} ${arg[1]} \n`);
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

// change-setting <settingName> <value>
ipcMain.on('change-setting', (event, arg) => {
    backendProc.stdin.write(`change-setting ${arg[0]} ${arg[1]} \n`);
});

// show-error <errorMessage>
ipcMain.on('show-error', (event, arg) => {
    showErrorMessage(arg);
});

// open-folder <path>
ipcMain.on('open-folder', (event, path) => {
    shell.openPath(`${process.env.APPDATA}\\The MMM Launcher\\Minecraft\\Instances\\${path}`);
})
