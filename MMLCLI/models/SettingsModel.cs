using NickStrupat;

namespace MMLCLI.Models {
    public class SettingsModel
    {
        public bool MinimizeLauncher { get; set; } = true;
        public bool ExitLauncher { get; set; } = false;
        public bool RunOnStart { get; set; } = false;
        public bool DoNotRunStart { get; set; } = true;
        public string MinMem { get; set; } = "4096";
        private string _maxMem;
        public string MaxMem
        {
            get 
            {
                if (string.IsNullOrEmpty(_maxMem))
                {
                    var totalMemoryBytes = new ComputerInfo().TotalPhysicalMemory;
                    double halfTotalMemoryMB = Math.Floor((totalMemoryBytes / 2) / (1024.0 * 1024.0));
                    _maxMem = halfTotalMemoryMB.ToString();
                }
                return _maxMem;
            }
            set 
            {
                _maxMem = value;
            }
        }

    }
}
