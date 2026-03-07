import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { HOST, LOGOUT_ROUTE } from "@/utils/constants";
import { FiEdit2, FiLogOut } from "react-icons/fi";
import apiClient from "@/lib/api-client";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();

  const handleLogout = async(e) => {
    e.stopPropagation();
    try {
        const response = await apiClient.post(LOGOUT_ROUTE, {}, {withCredentials: true})

        if (response.status === 200) {
            navigate("/auth")
            setUserInfo(null);
        }
    } catch (error) {
        
    }
    console.log("Logout clicked");
  };

  return (
    <div className="absolute bottom-0 w-full bg-gray-900 border-t border-gray-800">
      <div className="flex items-center gap-3 px-4 py-3">

        <button
          onClick={() => navigate("/profile")}
          className="relative shrink-0 focus:outline-none"
        >
          <Avatar className="w-10 h-10 rounded-full overflow-hidden block hover:ring-2 hover:ring-violet-400 transition-all">
            {userInfo?.image ? (
              <AvatarImage
                src={`${HOST}/${userInfo.image}`}
                alt="profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className={`uppercase text-sm font-semibold flex items-center justify-center w-full h-full border ${getColor(userInfo?.color)}`}
              >
                {userInfo?.firstName
                  ? userInfo.firstName.charAt(0)
                  : userInfo?.email?.charAt(0)}
              </div>
            )}
          </Avatar>
        </button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <p className="text-white text-sm font-semibold truncate">
            {userInfo?.firstName || userInfo?.email}
          </p>

          <button
            onClick={() => navigate("/profile")}
            className="text-gray-400 hover:text-violet-400 transition"
          >
            <FiEdit2 size={14} />
          </button>
        </div>
<button
  onClick={handleLogout}
  className="shrink-0 text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-800 transition"
>
  <FiLogOut size={20} />
</button>

      </div>
    </div>
  );
};

export default ProfileInfo;