import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { colors, getColor } from "@/lib/utils";
import { FaTrash, FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  HOST,
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "@/utils/constants";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo?.profileSetup === true) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo?.image) {
      setImage(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First Name is required");
      return false;
    }
    if (!lastName) {
      toast.error("Last Name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (!validateProfile()) return;
    setSaving(true);
    try {
      const response = await apiClient.post(
        UPDATE_PROFILE_ROUTE,
        { firstName, lastName, color: selectedColor, profileSetup: true },
        { withCredentials: true },
      );
      if (response.status === 200 && response.data) {
        setUserInfo({ ...response.data });
        toast.success("Profile updated successfully");
        navigate("/chat");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handelFileInputClick = () => fileInputRef.current.click();

  const handelImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("profile-image", file);
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.image) {
        setImage(`${HOST}/${response.data.image}`);
        setUserInfo({ ...userInfo, image: response.data.image });
        toast.success("Image updated");
      }
    } catch (error) {
      toast.error("Upload failed");
      console.error(error);
    }
  };

  const handelDeleteImage = async () => {
    if (!image || !confirm("Remove profile image?")) return;
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        setImage(null);
        toast.success("Image removed");
      }
    } catch (error) {
      toast.error("Failed to remove image");
    }
  };

  const initial = firstName ? firstName.charAt(0) : userInfo?.email?.charAt(0);

  return (
    <div className="min-h-screen bg-[#08090e] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-950/10 rounded-full blur-[160px]" />
      </div>

      <div
        className="relative w-full max-w-[680px] rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        style={{
          background: "linear-gradient(145deg, #13141f 0%, #0f1018 100%)",
        }}
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-80" />

        <div className="absolute inset-0 rounded-[28px] border border-white/[0.05] pointer-events-none" />

        <div className="p-7 md:p-10">
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() =>
                userInfo.profileSetup
                  ? navigate("/chat")
                  : toast.error("Please setup your profile first")
              }
              className="group w-10 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
            >
              <IoArrowBack className="text-base group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-semibold text-[22px] tracking-[-0.3px]">
                Edit Profile
              </h1>
              <p className="text-white/30 text-[13px] mt-0.5">
                Manage your personal information
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">
            <div className="flex flex-col items-center gap-5 md:w-[160px] shrink-0">
              <div
                className="relative cursor-pointer group"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={image ? handelDeleteImage : handelFileInputClick}
              >
                <div className="absolute -inset-[3px] rounded-full border border-violet-500/30" />

                <Avatar className="w-[120px] h-[120px] md:w-[136px] md:h-[136px] rounded-full overflow-hidden block relative z-10">
                  {image ? (
                    <AvatarImage
                      src={image}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div
                      className={`uppercase text-4xl font-semibold flex items-center justify-center w-full h-full ${getColor(selectedColor)}`}
                    >
                      {initial}
                    </div>
                  )}
                </Avatar>

                <div
                  className={`
    absolute inset-0 z-20 rounded-full flex flex-col items-center justify-center gap-1.5
    bg-black/65 backdrop-blur-[2px]
    transition-all duration-200

    opacity-100 md:opacity-0
    md:group-hover:opacity-100
  `}
                >
                  {image ? (
                    <FaTrash className="text-white/90 text-lg" />
                  ) : (
                    <FaPlus className="text-white/90 text-lg" />
                  )}
                  <span className="text-white/60 text-[10px] font-medium tracking-wide uppercase">
                    {image ? "Remove" : "Upload"}
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handelImageChange}
                  name="profile-image"
                  accept=".png,.jpg,.jpeg,.svg,.webp"
                />
              </div>

              <div className="flex flex-col items-center gap-2.5">
                <span className="text-white/25 text-[9px] uppercase tracking-[0.15em] font-medium">
                  Upload Image
                </span>
                <div className="flex gap-2">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-[26px] h-[26px] rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${color}
                        ${
                          selectedColor === index
                            ? "ring-2 ring-white/70 ring-offset-2 ring-offset-[#0f1018] scale-110"
                            : "opacity-70 hover:opacity-100"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-white/30 text-[11px] uppercase tracking-[0.1em] font-medium pl-0.5">
                  Email
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    disabled
                    value={userInfo.email}
                    className="h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white/35 text-sm focus-visible:ring-0 cursor-not-allowed pl-4 select-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <span className="text-[10px] text-white/20 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.05]">
                      locked
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-white/30 text-[11px] uppercase tracking-[0.1em] font-medium pl-0.5">
                    First Name
                  </label>
                  <Input
                    placeholder="First"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white text-sm placeholder:text-white/15
                      focus-visible:ring-1 focus-visible:ring-violet-500/60 focus-visible:border-violet-500/40
                      hover:border-white/[0.12] transition-all duration-200 pl-4"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-white/30 text-[11px] uppercase tracking-[0.1em] font-medium pl-0.5">
                    Last Name
                  </label>
                  <Input
                    placeholder="Last"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white text-sm placeholder:text-white/15
                      focus-visible:ring-1 focus-visible:ring-violet-500/60 focus-visible:border-violet-500/40
                      hover:border-white/[0.12] transition-all duration-200 pl-4"
                  />
                </div>
              </div>

              <div className="h-px bg-white/[0.05] my-1" />

              {/* Save Button */}
              <button
                onClick={saveChanges}
                disabled={saving}
                className="relative h-12 w-full rounded-2xl overflow-hidden font-semibold text-sm tracking-wide text-white
                  transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-[0_8px_32px_rgba(124,58,237,0.25)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.4)]"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <span className="relative z-10">
                  {saving ? "Saving…" : "Save Changes"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>
    </div>
  );
};

export default Profile;
