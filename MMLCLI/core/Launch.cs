using System.Runtime.InteropServices;
using CmlLib.Core;
using CmlLib.Core.Auth.Microsoft;
using MMLCLI.Models;
using MMLCLI.Util;

namespace MMLCLI.Core
{
    public class Launch
    {
        string fullName;

        public async void LaunchGame(string modpackId)
        {
            try
            {
                var modpacks = ModpackManager.modpacks;

                var selectedModpack = modpacks.FirstOrDefault(mp => mp.id == modpackId);

                var selectedVersion = selectedModpack.mainVersion;

                Installer installer = new Installer();
                CMLauncher launcher = installer.InitializeLauncher(selectedVersion, modpackId);

                if (selectedVersion.modName.ToLower().Contains("fabric"))
                {
                    fullName = $"fabric-loader-{selectedVersion.modLoader}-{selectedVersion.mcVersion}";
                }
                else if (selectedVersion.modName.ToLower().Contains("forge"))
                {
                    fullName = $"{selectedVersion.mcVersion}-forge-{selectedVersion.modLoader}";
                }

                var session = AccountManager.GetAccount();

                var settings = SettingsManager.settings;

                Console.WriteLine(session);
                if (session != null )
                {
                    session.UserType = "msa";
                    Console.WriteLine($"Launching with {fullName}");
                    var process = await launcher.CreateProcessAsync(fullName, new MLaunchOption 
                    {
                        MinimumRamMb = int.Parse(settings.MinMem),
                        MaximumRamMb = int.Parse(settings.MaxMem),
                        Session = session
                    });
                    
                    process.StartInfo.CreateNoWindow = true;

                    process.Start();


                    if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                    {
                        process.WaitForInputIdle();       
                    }

                    Console.WriteLine("game-launched");

                    if (settings.ExitLauncher == true)
                    {
                        Environment.Exit(0);
                    }
                    
                    process.WaitForExit();
                    Console.WriteLine("game-closed");
                    
                }
                else
                {
                    Console.WriteLine("no-account");
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred launching game: {ex} \n");
                Console.WriteLine("error-launching");

            }

        }
    }
}

