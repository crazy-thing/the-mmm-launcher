using CmlLib.Core;
using TheMMMLauncherCLI.Models;

namespace TheMMMLauncherCLI.Launcher
{
    public class Launch
    {
        string fullName;

        public async void LaunchGame(VersionModel version)
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

            var process = await launcher.CreateProcessAsync(fullName, new MLaunchOption());
            process.Start();
            process.WaitForInputIdle();
            Console.WriteLine("game-launched");

        }
    }
}

