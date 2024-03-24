using CmlLib.Core;
using TheMMMLauncherCLI.Models;
using TheMMMLauncherCLI.Util;

namespace TheMMMLauncherCLI.Launcher
{
    public class Launch
    {
        string fullName;

        public async void LaunchGame(string modpackId, VersionModel version)
        {
            try
            {
                Installer installer = new Installer();
                CMLauncher launcher = installer.InitializeLauncher(version, modpackId);
                if (version.modName.ToLower().Contains("fabric"))
                {
                    fullName = $"fabric-loader-{version.modLoader}-{version.mcVersion}";
                }
                else if (version.modName.ToLower().Contains("forge"))
                {
                    fullName = $"{version.mcVersion}-forge-{version.modLoader}";
                }

                var session = AccountManager.GetAccount();
                var settings = SettingsManager.settings;

                Console.WriteLine(session);
                if (session != null )
                {
                    Console.WriteLine($"Launching with {fullName}");
                    var process = await launcher.CreateProcessAsync(fullName, new MLaunchOption 
                    {
                        MinimumRamMb = int.Parse(settings.MinMem),
                        MaximumRamMb = int.Parse(settings.MaxMem),
                        Session = session
                    });
                    
                    process.StartInfo.CreateNoWindow = false;

                    process.Start();
                    process.WaitForInputIdle();

                    
                    Console.WriteLine("game-launched");
                    if (settings.ExitLauncher == true)
                    {
                        Environment.Exit(0);
                    }
                    
                    
                }
                else
                {
                    Console.WriteLine("no-account");
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred launching game: {ex.Message}");
            }

        }
    }
}

