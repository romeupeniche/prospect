import React from 'react';
import { DashboardIcon } from '../icons/Dashboard';
import { WorldIcon } from '../icons/World';
import { FieldIcon } from '../icons/Field';
import { SettingsIcon } from '../icons/Settings';
import { Screens, useUIStore } from '../store/useUIStore';
import { CalendarIcon } from '../icons/Calendar';
import { SwordsIcon } from '../icons/Swords';
import { MessagesIcon } from '../icons/Messages';

const screens = [
    {
        title: "Dashboard",
        icon: <DashboardIcon className="w-5" />,
        screen: "dashboard"
    },
    {
        title: "Matchday",
        icon: <SwordsIcon className="w-6" />,
        screen: "matchday"
    },
    {
        title: "Calendário",
        icon: <CalendarIcon className="w-6" />,
        screen: "calendar"
    },
    {
        title: "Elenco",
        icon: <FieldIcon className="w-6" />,
        screen: "team"
    },
    {
        title: "Mensagens",
        icon: <MessagesIcon className="w-6" />,
        screen: "messages"
    },
    {
        title: "Mercado",
        icon: <WorldIcon className="w-6" />,
        screen: "market"
    },
] as {
    title: string;
    icon: React.ReactNode;
    screen: Screens;
}[];

const Sidebar: React.FC<{ currentTeam: Team }> = ({ currentTeam }) => {
    const { currentScreen, setScreen } = useUIStore();
    const isTeamColorBlack = currentTeam.colors.primary[500] === "#000"

    const handleChangeScreen = (screen: Screens) => {
        if (!(currentScreen === screen)) setScreen(screen);
    };

    return (
        <aside className="h-full w-20 bg-[#0c0c0c] rounded-3xl flex flex-col items-center py-8 mr-4 justify-between">
            <div className="flex flex-col items-center gap-10">
                <div className="relative w-12 h-12 flex items-center justify-center group cursor-pointer">
                    <img src={currentTeam.logo} className="absolute w-full h-full object-contain blur-md select-none group-hover:brightness-150 transition ease-in pointer-events-none" />
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={currentTeam.logo} className="w-14 h-14 object-contain z-10 select-none group-hover:scale-105 transition-transform ease-in pointer-events-none"
                            style={{
                                imageRendering: 'smooth',
                                transform: 'translateZ(0)'
                            }}
                        />
                    </div>
                </div>

                <nav className="flex flex-col gap-8 items-center">
                    {screens.map(({ icon, title, screen }) => (
                        <div
                            key={screen}
                            onClick={() => handleChangeScreen(screen)}
                            className={`${currentScreen === screen ? isTeamColorBlack ? 'text-white' : 'text-(--team-color-500)' : "cursor-pointer opacity-40 hover:opacity-100"} transition p-2`}
                            title={title}
                        >
                            {icon}
                        </div>
                    ))}
                </nav>
            </div>

            <div onClick={() => handleChangeScreen('settings')} className={`${currentScreen === 'settings' ? isTeamColorBlack ? 'text-white' : 'text-(--team-color-500)' : "cursor-pointer opacity-40 hover:opacity-100 transition"} p-2`} title="Configurações"><SettingsIcon className="w-6" /></div>
        </aside>
    );
}

export default Sidebar;