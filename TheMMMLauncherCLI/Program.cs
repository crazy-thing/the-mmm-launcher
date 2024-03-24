using TheMMMLauncherCLI.Launcher;
using TheMMMLauncherCLI.Util;
using System.Text.Json;
using TheMMMLauncherCLI.Models;
using CmlLib.Core.Auth;

namespace TheMMMLauncherCLI
{
   class Program
    {

        static async Task Main(string[] args)
        {
            Console.WriteLine("C# Backend Started \n");
            SettingsManager.LoadSettings();
            AccountManager.LoadAccounts();
            ModpackManager.LoadModpacks();
            Console.WriteLine($"settings-loaded");
 
            string command;
            while ((command = Console.ReadLine()) != "exit")
            {
                string[] commandParts = command.Split(' ');
                string mainCommand = commandParts[0];
                string[] arguments = commandParts.Length > 1 ? commandParts[1..] : new string[0];
                switch (mainCommand)
                {
                    /*
                    case "get-installed-versions":
                        var installedVersions = ModpackManager.CheckForInstalledVersions();
                        Console.WriteLine($"installed-versions {installedVersions}");
                        break;
                    */
                    case "launch-game":
                        var stringVersion = string.Join(" ", arguments.Skip(1));
                        VersionModel version = JsonSerializer.Deserialize<VersionModel>(stringVersion);
                        Launch launch = new Launch();
                        launch.LaunchGame(modpackId: arguments[0], version);
                        break;
                    case "download-version":
                        string stringModpack = string.Join(" ", arguments.Skip(1));
                        ModpackModel modpackModel = JsonSerializer.Deserialize<ModpackModel>(stringModpack);
                        CurseForgeDownloader curseForgeDownloader = new CurseForgeDownloader();
                        await curseForgeDownloader.DownloadManifest(arguments[0], modpackModel);
                        break;
                    case "select-version":
                        Console.WriteLine($"Selecting version {arguments[0]} and selecting modpack {arguments[1]}");
                        ModpackManager.SelectVersion(arguments[0], arguments[1]);
                        break;
                    case "delete-version":
                        string stringDelVersion = string.Join(" ", arguments);
                        VersionModel versionToDel = JsonSerializer.Deserialize<VersionModel>(stringDelVersion);
                        ModpackManager.UninstallVersion(versionToDel);
                        break;
                    case "sign-in":
                        string stringSignIn = string.Join(" ", arguments);
                        UserAccountModel accountModel = JsonSerializer.Deserialize<UserAccountModel>(stringSignIn);
                        AccountManager.AddAccount(accountModel);
                        break;
                    case "sign-out":
                        AccountManager.DeleteAccount(arguments[0]);
                        break;
                    case "change-setting":
                        SettingsManager.ChangeSetting(arguments[0], arguments[1]);
                        break;
                    default:
                        Console.WriteLine("Invalid command");
                        break;

                }
            }
        }
    }    
}

