
// detect amount of ram installed
public class SettingsModel
{
    public bool MinimizeLauncher { get; set; } = true;
    public bool ExitLauncher { get; set; } = false;
    public bool RunOnStart { get; set; } = false;
    public bool DoNotRunStart { get; set; } = true;
    public string MinMem { get; set; } = "4096";
    public string MaxMem { get; set; } = "4096";
    
}