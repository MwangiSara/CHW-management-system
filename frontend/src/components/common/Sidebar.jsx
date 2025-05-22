import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChartBarIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      roles: ["CHW", "CHA", "ADMIN"],
    },
    {
      name: "My Requests",
      href: "/requests",
      icon: DocumentTextIcon,
      roles: ["CHW", "CHA", "ADMIN"],
    },
    {
      name: "New Request",
      href: "/requests/new",
      icon: PlusCircleIcon,
      roles: ["CHW"],
    },
    {
      name: "Pending Approvals",
      href: "/pending",
      icon: ClockIcon,
      roles: ["CHA", "ADMIN"],
    },
    // {
    //   name: "Profile",
    //   href: "/profile",
    //   icon: UserIcon,
    //   roles: ["CHW", "CHA", "ADMIN"],
    // },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary-600 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-primary-600 font-bold text-lg">C</span>
        </div>
        <span className="ml-3 text-white font-semibold">CHW System</span>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "bg-primary-700 text-white"
                          : "text-primary-200 hover:text-white hover:bg-primary-700"
                      } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200`
                    }
                    onClick={() => setOpen(false)}
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>

          <li className="mt-auto">
            <div className="bg-primary-700 rounded-md p-3">
              <div className="text-xs text-primary-200">Logged in as</div>
              <div className="text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-xs text-primary-300">{user?.role}</div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition show={open} as={React.Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={React.Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
