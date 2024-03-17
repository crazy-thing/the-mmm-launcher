using CmlLib.Core;
using TheMMMLauncherCLI.Models;
using TheMMMLauncherCLI.Util;

namespace TheMMMLauncherCLI.Launcher
{
    public class Launch
    {
        string fullName;

        public async void LaunchGame(VersionModel version)
        {
            try
            {
                Installer installer = new Installer();
                CMLauncher launcher = installer.InitializeLauncher(version);
                if (version.modName.ToLower().Contains("fabric"))
                {
                    fullName = $"fabric-loader-{version.modLoader}-{version.mcVersion}";
                }
                else if (version.modName.ToLower().Contains("forge"))
                {
                    fullName = $"{version.mcVersion}-forge-{version.modLoader}";
                }

                var session = AccountManager.GetAccount();
                var process = await launcher.CreateProcessAsync(fullName, new MLaunchOption 
                {
                    MinimumRamMb = 8192,
                    MaximumRamMb = 10240,
                    Session = session
                });
                process.Start();
                process.WaitForInputIdle();
                Console.WriteLine("game-launched");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred launching game: {ex.Message}");
            }

        }
    }
}

