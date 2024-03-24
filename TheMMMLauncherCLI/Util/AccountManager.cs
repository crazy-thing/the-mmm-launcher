using System.Text.Json;
using CmlLib.Core;
using CmlLib.Core.Auth;
using CmlLib.Core.Auth.Microsoft;


namespace TheMMMLauncherCLI.Util
{
    public class AccountManager
    {
        private static string minecraftRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "The MMM Launcher", "Minecraft");
        private static string jsonFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "The MMM Launcher", "userAccounts.json");

        private static List<UserAccountModel> accounts;

        public static void LoadAccounts()
        {
            if (File.Exists(jsonFilePath))
            {
                string jsonData = File.ReadAllText(jsonFilePath);
                accounts = JsonSerializer.Deserialize<List<UserAccountModel>>(jsonData);
            }
            else
            {
                accounts = new List<UserAccountModel>();
            }
        }

        public static void SaveAccounts()
        {
            try
            {

                if (!Directory.Exists(Path.GetDirectoryName(jsonFilePath)))
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(jsonFilePath));
                }
                string jsonData = JsonSerializer.Serialize(accounts, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(jsonFilePath, jsonData);                
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        public static void AddAccount(UserAccountModel account)
        {
            try
            {
                accounts.Add(account);
                SaveAccounts();                
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

        }

        public static MSession? GetAccount()
        {
            if (accounts.Count() > 0)
            {
                return accounts[0].MSession;
            }
            return null;
        }

        public static void DeleteAccount(string gamerTag)
        {
            try
            {
                File.Delete(jsonFilePath);
                /* For multiple accounts
                Console.WriteLine(gamerTag);
                UserAccountModel account = accounts.Find(a => a.GamerTag == gamerTag);
                if (account != null)
                {
                    accounts.Remove(account);
                    Console.WriteLine("account removed");
                    SaveAccounts();
                }
                else
                {
                    Console.WriteLine($"Account with gamertag '{gamerTag}' not found.");
                } 
                */               
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

        }

        public static string ListAccounts()
        {
            return JsonSerializer.Serialize(accounts, new JsonSerializerOptions { WriteIndented = true });
        }

        public static async Task TestAccount(UserAccountModel userAccount)
        {
            try
            {
                var path = new MinecraftPath();
                var launcher = new CMLauncher(path);

                if (!Directory.Exists(minecraftRoot))
                {
                    Directory.CreateDirectory(minecraftRoot);
                }
                path.BasePath = $"{minecraftRoot}";
                path.Runtime = $"{minecraftRoot}/runtimes";
                path.Library = $"{minecraftRoot}/libraries";
                path.Resource = $"{minecraftRoot}/resources";
                path.Versions = $"{minecraftRoot}/versions";
                path.Assets = $"{minecraftRoot}/assets";

                launcher.FileChanged += (e) =>
                {
                    Console.WriteLine("FileKind: " + e.FileKind.ToString());
                    Console.WriteLine("FileName: " + e.FileName);
                    Console.WriteLine("ProgressedFileCount: " + e.ProgressedFileCount);
                    Console.WriteLine("TotalFileCount: " + e.TotalFileCount);
                };
                launcher.ProgressChanged += (s, e) =>
                {
                    Console.WriteLine("{0}%", e.ProgressPercentage);
                };

                var process = await launcher.CreateProcessAsync("1.19.2", new MLaunchOption{
                    Session = userAccount.MSession,
                    
                });

                process.Start();
                
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }

        }
    }
}