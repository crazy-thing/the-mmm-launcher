using System.Collections.ObjectModel;
using System.IO.Compression;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using TheMMMLauncherCLI.Launcher;
using TheMMMLauncherCLI.Models;

namespace TheMMMLauncherCLI.Util
{
    public class ModpackManager
    {
        private static readonly string modpacksDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "The MMM Launcher", "Minecraft", "Instances");
        private static string modpacksJsonFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "The MMM Launcher", "modpacks.json");

        private static readonly string baseApi = "http://127.0.0.1:3001/example/v1/";
        private static ObservableCollection<ModpackModel> modpacks;
        public bool IsVersionDownloaded(string modpackId)
        {
            string modpackPath = Path.Combine(modpacksDir, modpackId);
            return Directory.Exists(modpackPath);
        } 
        public async Task DownloadVersion(string versionId, ModpackModel modpack)
        {
            using (HttpClient client = new HttpClient())
            {
                try
                {
                    HttpResponseMessage res = await client.GetAsync($"{baseApi}/{modpack.id}/versions/{versionId}");

                    if (res.IsSuccessStatusCode)
                    {
                        HttpContent content = res.Content;

                        string resBody = await res.Content.ReadAsStringAsync();

                        string fileName = res.Content.Headers.ContentDisposition.FileName;
                        string version = modpack.versions.FirstOrDefault(ver => ver.id == versionId)?.name;
                        string instancePath = Path.Combine(modpacksDir, modpack.name, version);
                        if (!Directory.Exists(instancePath))
                        {
                            Directory.CreateDirectory(instancePath);
                        }

                        string filePath = Path.Combine(instancePath, fileName);
                        Console.WriteLine(filePath);

                        using (Stream stream = await content.ReadAsStreamAsync())
                        {
                            using (FileStream fileStream = File.Create(filePath))
                            {
                                await stream.CopyToAsync(fileStream);
                            }
                        }

                        Console.WriteLine($"Version {versionId} downloaded successfully.");
                        await ExtractModpack(filePath, instancePath);
                        AddVersion(versionId, modpack);
                    }
                    else
                    {
                        Console.WriteLine($"Failed to call the API. Status code: {res.StatusCode}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occured: {ex.Message}");
                }
            }
        }
        
        public static Task ExtractModpack(string filePath, string extractPath)
        {
            try
            {
                ZipFile.ExtractToDirectory(filePath, extractPath);
                File.Delete(filePath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occured: {ex.Message}");
            }

            return Task.CompletedTask;
        }

        public static async void AddVersion(string versionId, ModpackModel modpack)
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
                        versions = new ObservableCollection<VersionModel>()
                    };
                    modpacks.Add(existingModpack);
                }
               
               if (existingModpack.versions.Any(ver => ver.id == versionId))
               {
                Console.WriteLine($"Version {versionId} already exists. ");
                return;
               }

                VersionModel downloadedVersion = modpack.versions.FirstOrDefault(ver => ver.id == versionId);

                if (downloadedVersion != null)
                {
                    downloadedVersion.ParentModpackName = existingModpack.name;
                    existingModpack.versions.Add(downloadedVersion);
                    SaveModpacks();
                    if (downloadedVersion.modName.ToLower() == "fabric")
                    {
                        await installer.InstallFabricVersion(downloadedVersion);
                    }
                    else if (downloadedVersion.modName.ToLower() == "forge")
                    {
                        await installer.InstallForgeVersion(downloadedVersion);
                    }
                    else
                    {
                        Console.WriteLine("Invalid mod loader name");
                    }
                }
                else
                {
                    Console.WriteLine($"Version {versionId} not found in the downloaded modpack's version array.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred adding version to modpacks.json: ", ex);
            }
        }

        public static void UninstallVersion(VersionModel version)
        {
            try
            {
                Console.WriteLine("version id " + version.name);
                ModpackModel modpack = modpacks.FirstOrDefault(mp => mp.versions.Any(ver => ver.id == version.id));
                            
                if (modpack != null)
                {
                    VersionModel versionToRemove = modpack.versions.FirstOrDefault(ver => ver.id == version.id);
                    if (versionToRemove != null)
                    {

                        if (Directory.Exists(versionToRemove.InstancePath))
                        {
                            Directory.Delete(versionToRemove.InstancePath, true);
                            Console.WriteLine($"Deleted {versionToRemove} successfully");
                        }
                        else
                        {
                            Console.WriteLine($"Directory {versionToRemove.InstancePath} not found.");
                        }
                        modpack.versions.Remove(versionToRemove);
                        SaveModpacks();
                        Console.WriteLine("uninstall-complete \n");
                    }
                    else
                    {
                        Console.WriteLine($"Version {version.id} not found in modpack.");
                    }
                }
                else
                {
                    Console.WriteLine($"Modpack for version {version.id} not found.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while uninstalling version: {ex.Message}");                
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