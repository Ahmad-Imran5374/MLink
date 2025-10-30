import { useChatStore } from "../store/useChatStore";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Sidebar from "../components/Sidebar";

function HomePage() {
  const { selectedUser } = useChatStore();
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-6rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Mobile: Show sidebar when no user selected, hide when user selected */}
            {/* Desktop: Always show sidebar */}
            <div
              className={`${selectedUser ? "hidden lg:flex" : "flex w-full lg:w-auto"} transition-all duration-300`}
            >
              <Sidebar />
            </div>

            {/* Mobile: Show chat when user selected, hide when no user selected */}
            {/* Desktop: Show chat or NoChatSelected based on selection */}
            <div
              className={`flex-1 ${selectedUser ? "flex" : "hidden lg:flex"} transition-all duration-300`}
            >
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
