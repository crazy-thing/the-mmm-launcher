using System.Text.Json;
using CmlLib.Core;
using CmlLib.Core.Auth;
using CmlLib.Core.Auth.Microsoft;
using MMLCLI.Models;


namespace MMLCLI.Util
{
    public class AccountManager
    {
        private static string jsonFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "userAccounts.json");

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
    }
}