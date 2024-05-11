using System.Text.Json;
using MMLCLI.Models;

namespace MMLCLI.Util
{
    public class SettingsManager
    {
        private static string settingsJsonPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "settings.json");
        public static SettingsModel settings;
        public static void LoadSettings()
        {
            if (File.Exists(settingsJsonPath))
            {
                string jsonData = File.ReadAllText(settingsJsonPath);
                settings = JsonSerializer.Deserialize<SettingsModel>(jsonData);
            }
            else
            {
                settings = new SettingsModel();
                SaveSettings();
            }
        }

        public static void SaveSettings()
        {
            try
            {
                if (!Directory.Exists(Path.GetDirectoryName(settingsJsonPath)))
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(settingsJsonPath));
                }
                string jsonData = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(settingsJsonPath, jsonData);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred saving settings: {ex.Message}");
            }
        }

        public static void ChangeSetting(string settingName, object value)
        {
            var property =  typeof(SettingsModel).GetProperty(settingName);
            if (property != null)
            {
                property.SetValue(settings, Convert.ChangeType(value, property.PropertyType));

                SaveSettings();
            }
            else
            {
                Console.WriteLine($"Setting '{settingName}' not found");
            }
        }

    }
}