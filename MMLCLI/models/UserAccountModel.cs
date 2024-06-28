using CmlLib.Core.Auth;

namespace MMLCLI.Models {
    public class UserAccountModel
    {
        public string GamerTag { get; set; }
        public string ProfilePicture { get; set; }
        public MSession MSession { get; set; }
    }
}
