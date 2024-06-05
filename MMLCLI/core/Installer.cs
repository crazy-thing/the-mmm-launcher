using CmlLib.Core.Installer.Forge;
using CmlLib.Core;
using CmlLib.Core.Auth;
using CmlLib.Core.Downloader;
using System.ComponentModel;
using CmlLib.Utils;
using CmlLib.Core.Installer.FabricMC;
using MMLCLI.Models;
using CmlLib.Core.Version;

namespace MMLCLI.Core
{
    public class Installer
    {
        private static string minecraftRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "Minecraft");
        private static string runtimePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), ".minecraft", "runtime");

        private MinecraftPath path;
        private CMLauncher launcher;
        public CMLauncher InitializeLauncher(VersionModel version, string? modpackId = null)
        {
            path = new MinecraftPath();
            launcher = new CMLauncher(path);
            launcher.FileChanged += Launcher_FileChanged;

            if (!Directory.Exists(minecraftRoot))
            {
                Directory.CreateDirectory(minecraftRoot);
            }

            path.BasePath = Path.Combine(minecraftRoot, "Instances", modpackId);
            path.Runtime = runtimePath;
            path.Library = $"{minecraftRoot}/libraries";
            path.Resource = $"{minecraftRoot}/resources";
            path.Versions = $"{minecraftRoot}/versions";
            path.Assets = $"{minecraftRoot}/assets";

            return launcher;
        }

        public async Task InstallForgeVersion(VersionModel version, string modpackId)
        {
            try
            {
                InitializeLauncher(version, modpackId);

                var forge = new MForge(launcher);
                forge.ProgressChanged += (s, e) =>
                {
                    Console.WriteLine($"Loader Progress: {e.ProgressPercentage:F0}% \n");
                };

                Console.WriteLine(version.mcVersion + " " + version.modLoader);
                var versionName = await forge.Install(version.mcVersion, version.modLoader); 
                Console.WriteLine($"Install-Complete {modpackId}");


            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred installing forge version: {ex}");
            }


        }

        public async Task InstallFabricVersion(VersionModel version, string modpackId)
        {
            try
            {
                InitializeLauncher(version, modpackId);
                launcher.FileChanged += (e) =>
                {
                    Console.WriteLine("FileKind: " + e.FileKind.ToString());
                    Console.WriteLine("FileName: " + e.FileName);
                    Console.WriteLine("ProgressedFileCount: " + e.ProgressedFileCount);
                    Console.WriteLine("TotalFileCount: " + e.TotalFileCount);
                };
                launcher.ProgressChanged += (s, e) =>
                {
                    Console.WriteLine($"Loader Progress: {e.ProgressPercentage:F0}");
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
                Console.WriteLine($"Install-Complete {modpackId}");

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
            Console.WriteLine($"LauncherIn Progress: {progress:F0}%");
        }

    }
}