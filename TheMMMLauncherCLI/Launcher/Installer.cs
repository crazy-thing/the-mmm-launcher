using CmlLib.Core.Installer.Forge;
using CmlLib.Core;
using CmlLib.Core.Auth;
using CmlLib.Core.Downloader;
using System.ComponentModel;
using CmlLib.Utils;
using CmlLib.Core.Installer.FabricMC;
using TheMMMLauncherCLI.Models;
using CmlLib.Core.Version;

namespace TheMMMLauncherCLI.Launcher
{
    public class Installer
    {
        private static string minecraftRoot = AppDomain.CurrentDomain.BaseDirectory + "Minecraft";
        private MinecraftPath path;
        private CMLauncher launcher;
        public CMLauncher InitializeLauncher(VersionModel version)
        {
            path = new MinecraftPath();
            launcher = new CMLauncher(path);
            launcher.FileChanged += Launcher_FileChanged;
            launcher.ProgressChanged += Launcher_ProgressChanged;

            if (!Directory.Exists(minecraftRoot))
            {
                Directory.CreateDirectory(minecraftRoot);
            }
            path.BasePath = $"{version.InstancePath}";
            path.Runtime = $"{minecraftRoot}/runtimes";
            path.Library = $"{minecraftRoot}/libraries";
            path.Resource = $"{minecraftRoot}/resources";
            path.Versions = $"{minecraftRoot}/versions";
            path.Assets = $"{minecraftRoot}/assets";

            return launcher;
        }

        public async Task InstallForgeVersion(VersionModel version)
        {
            try
            {
                InitializeLauncher(version);

                var forge = new MForge(launcher);
                forge.ProgressChanged += (s, e) =>
                {
                    Console.WriteLine("Progress: {0}% \n", e.ProgressPercentage);
                };

                var versionName = await forge.Install(version.mcVersion, version.modLoader);
                Console.WriteLine("Install-Complete");


            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred installing forge version: ", ex.Message);
            }


        }

        public async Task InstallFabricVersion(VersionModel version)
        {
            try
            {
                InitializeLauncher(version);
                launcher.FileChanged += (e) =>
                {
                    Console.WriteLine("FileKind: " + e.FileKind.ToString());
                    Console.WriteLine("FileName: " + e.FileName);
                    Console.WriteLine("ProgressedFileCount: " + e.ProgressedFileCount);
                    Console.WriteLine("TotalFileCount: " + e.TotalFileCount);
                };
                launcher.ProgressChanged += (s, e) =>
                {
                    Console.WriteLine("Progress: {0}% \n", e.ProgressPercentage);
                };

                var fabricVersionLoader = new FabricVersionLoader
                {
                    LoaderVersion = version.modLoader
                };
                var fabricVersions = await fabricVersionLoader.GetVersionMetadatasAsync();

                var fullName = $"fabric-loader-{version.modLoader}-{version.mcVersion}";
                Console.WriteLine(fullName);
                var fabric = fabricVersions.GetVersionMetadata(fullName);
                await fabric.SaveAsync(path);
                await launcher.GetAllVersionsAsync();
                Console.WriteLine("Install-Complete");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

        }

        void progressChanged(object? sender, ProgressChangedEventArgs e)
        {
            Console.WriteLine($"{e.ProgressPercentage}%");
        }

        private void Launcher_FileChanged(DownloadFileChangedEventArgs e)
        {
            double progress = ((double)e.ProgressedFileCount / e.TotalFileCount) * 100;
            Console.WriteLine("Progress: {0}%", progress);
        }

        private void Launcher_ProgressChanged(object sender, System.ComponentModel.ProgressChangedEventArgs e)
        {
            Console.WriteLine("Progress: {0}%", e.ProgressPercentage);
        }
    }
}