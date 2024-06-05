using System.Text.Json;
using CmlLib.Core.Auth;
using MMLCLI.Core;
using MMLCLI.Models;
using MMLCLI.Util;

namespace MMLCLI
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
                    case "launch-game":
                        string stringLaunch = string.Join(" ", arguments);
                        Launch launch = new Launch();
                        launch.LaunchGame(modpackId: stringLaunch);
                        break;
                    case "download-modpack":
                        string stringModpack = string.Join(" ", arguments);
                        ModpackModel modpackModel = JsonSerializer.Deserialize<ModpackModel>(stringModpack);
                        Downloader downloader = new Downloader();
                        downloader.DownloadManifest(modpackModel);
                        break;
                    case "delete-modpack":
                        string stringModpackDel = string.Join(" ", arguments);
                        ModpackManager.UninstallModpack(stringModpackDel);
                        break;
                    case "sign-in":
                        string stringSignIn = string.Join(" ", arguments);
                        UserAccountModel accountModel = JsonSerializer.Deserialize<UserAccountModel>(stringSignIn);
                        AccountManager.AddAccount(accountModel);
                        break;
                    case "sign-out":
                        string signOut = string.Join(" ", arguments);
                        Console.WriteLine(signOut);
                        AccountManager.DeleteAccount(signOut);
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

