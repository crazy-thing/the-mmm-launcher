using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Runtime.InteropServices;
using MMLCLI.Models;
using MMLCLI.Core;

namespace MMLCLI.Util
{
    public static class ModpackManager
    {
        private static readonly string modpacksDir;
        private static readonly string modpacksJsonFile;
        private static readonly string baseApi = "https://minecraftmigos.me/example/v1/";
        public static ObservableCollection<ModpackModel> modpacks;

        static ModpackManager()
        {

            if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                modpacksDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Library", "Application Support", "MML", "Minecraft", "Instances");
                modpacksJsonFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Library", "Application Support", "MML", "modpacks.json");
            }
            else
            {
                modpacksDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "Minecraft", "Instances");
                modpacksJsonFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "modpacks.json");
            }
        }

        public static bool IsVersionDownloaded(string modpackId)
        {
            string modpackPath = Path.Combine(modpacksDir, modpackId);
            return Directory.Exists(modpackPath);
        }

        public static async void AddModpack(ModpackModel modpack, Manifest manifest)
        {
            try
            {
                Installer installer = new Installer();

                ModpackModel existingModpack = modpacks.FirstOrDefault(mp => mp.id == modpack.id);
                if (existingModpack == null)
                {
                    existingModpack = new ModpackModel
                    {
                        id = modpack.id,
                        name = modpack.name,
                        description = modpack.description,
                        thumbnail = modpack.thumbnail,
                        mainVersion = modpack.mainVersion
                    };
                    modpacks.Add(existingModpack);
                }

                ModLoader fabricLoader = manifest.minecraft.modLoaders.FirstOrDefault(loader => loader.id.Contains("fabric"));
                ModLoader forgeLoader = manifest.minecraft.modLoaders.FirstOrDefault(loader => loader.id.ToLower().Contains("forge"));

                if (fabricLoader != null)
                {
                    string fabricVersion = Regex.Replace(fabricLoader.id, @"[^\d.]", "");
                    existingModpack.mainVersion.mcVersion = manifest.minecraft.version;
                    existingModpack.mainVersion.modLoader = fabricVersion;
                    existingModpack.mainVersion.modName = "fabric";
                    existingModpack.mainVersion.ParentModpackName = existingModpack.name;
                    SaveModpacks();
                    await installer.InstallFabricVersion(existingModpack.mainVersion, modpack.id);
                }
                else if (forgeLoader != null)
                {
                    Console.WriteLine(forgeLoader.id);
                    string forgeVersion = Regex.Replace(forgeLoader.id, @"[^\d.]", "");
                    Console.WriteLine(forgeVersion);
                    existingModpack.mainVersion.mcVersion = manifest.minecraft.version;
                    existingModpack.mainVersion.modLoader = forgeVersion;
                    existingModpack.mainVersion.modName = "forge";
                    existingModpack.mainVersion.ParentModpackName = existingModpack.name;
                    SaveModpacks();
                    await installer.InstallForgeVersion(existingModpack.mainVersion, modpack.id);
                }
                else
                {
                    Console.WriteLine("No mod loader");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred adding version to modpacks.json: ", ex);
            }
        }

        public static void UninstallModpack(string modpackId)
        {
            try
            {
                modpackId = modpackId.Trim('"');
                Console.WriteLine(modpackId);
                ModpackModel modpack = modpacks.FirstOrDefault(mp => mp.id == modpackId);
                if (modpack != null)
                {
                    if (Directory.Exists(modpack.InstancePath))
                    {
                        Directory.Delete(modpack.InstancePath, true);
                        Console.WriteLine($"Deleted {modpack} successfully");
                    }
                    else
                    {
                        Console.WriteLine($"Directory {modpack.InstancePath} not found.");
                    }
                    modpacks.Remove(modpack);
                    SaveModpacks();
                    Console.WriteLine("uninstall-complete \n");
                }
                else
                {
                    Console.WriteLine($"Modpack not found.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while uninstalling modpack: {ex}");                
            }
        }

        public static void LoadModpacks()
        {
            if (File.Exists(modpacksJsonFile))
            {
                string jsonData = File.ReadAllText(modpacksJsonFile);
                modpacks = JsonSerializer.Deserialize<ObservableCollection<ModpackModel>>(jsonData);
            }
            else
            {
                modpacks = new ObservableCollection<ModpackModel>();
            }
        }

        public static string CheckForInstalledVersions()
        {
            if (File.Exists(modpacksJsonFile))
            {
                string jsonData = File.ReadAllText(modpacksJsonFile);
                return jsonData;
            }
            else
            {
                Console.WriteLine("no json file");
                return null;
            }
        }

        public static void SaveModpacks()
        {
            try
            {
                if (!Directory.Exists(Path.GetDirectoryName(modpacksJsonFile)))
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(modpacksJsonFile));
                }
                string jsonData = JsonSerializer.Serialize(modpacks, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(modpacksJsonFile, jsonData); 
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }
    }
}
