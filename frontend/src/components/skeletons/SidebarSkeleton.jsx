import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-full lg:w-72 lg:border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center gap-2 p-5">
          <Users className="w-6 h-6" />
          <span className="font-medium hidden sm:block">Contacts</span>
        </div>
        <div className="border-b border-base-300"></div>

        {/* Checkbox skeleton */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="skeleton w-4 h-4 rounded" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-3 w-16" />
          </div>
        </div>
        <div className="border-b border-base-300"></div>

        {/* Skeleton Contacts */}
        <div className="overflow-y-auto w-full">
          {skeletonContacts.map((_, idx) => (
            <div key={idx} className="w-full">
              <div className="w-full p-3 flex items-center gap-3">
                {/* Avatar skeleton */}
                <div className="relative mx-auto lg:mx-0">
                  <div className="skeleton size-12 rounded-full" />
                </div>

                {/* User info skeleton */}
                <div className="block text-left min-w-0 flex-1 ml-3 lg:ml-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-12 hidden sm:block" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-3 w-24 flex-1" />
                    <div className="flex items-center gap-2">
                      <div className="skeleton h-3 w-12 sm:hidden" />
                      <div className="skeleton w-6 h-6 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Divider - full width except for last item */}
              {idx < skeletonContacts.length - 1 && (
                <div className="border-b border-base-300/50"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
