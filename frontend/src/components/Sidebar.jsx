import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

function Sidebar() {
  const { getUsers, users, setSelectedUser, selectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;
  return (
    <aside className="h-full w-full lg:w-72 lg:border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="w-full">
        <div className="flex items-center gap-2 p-5">
          <Users className="size-6" />
          <span className="font-medium hidden sm:block">Contacts</span>
        </div>
        <div className="border-b border-base-300"></div>
        <div className="px-5 py-3">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
            />
            <span className="text-sm">Show online only</span>
            <span className="text-xs text-zinc-500">
              ({onlineUsers.length - 1} online)
            </span>
          </label>
        </div>
        <div className="border-b border-base-300"></div>
        <div className="overflow-y-auto w-full">
          {filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>

              {/* User info */}
              <div className="block text-left min-w-0 flex-1 ml-3 lg:ml-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">{user.fullName}</div>
                  {user.lastMessage && (
                    <div className="text-xs text-zinc-400 ml-2 hidden sm:block">
                      {formatMessageTime(user.lastMessage.createdAt)}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-400 truncate flex-1">
                    {user.lastMessage ? (
                      user.lastMessage.isDeleted ? (
                        <span className="italic">Message deleted</span>
                      ) : (
                        <span>
                          {user.lastMessage.text ||
                            (user.lastMessage.image && "📷 Photo") ||
                            (user.lastMessage.video && "🎥 Video")}
                        </span>
                      )
                    ) : (
                      <span>
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {user.lastMessage && (
                      <div className="text-xs text-zinc-400 sm:hidden">
                        {formatMessageTime(user.lastMessage.createdAt)}
                      </div>
                    )}
                    {user.unreadCount > 0 && (
                      <div className="bg-primary text-primary-content text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {user.unreadCount > 99 ? "99+" : user.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">
              No online users
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
