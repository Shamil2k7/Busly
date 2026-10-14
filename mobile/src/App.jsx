import React, { useState } from 'react';
import { MobileAuthProvider, useMobileAuth } from './context/MobileAuthContext';
import TopBar from './components/common/TopBar';
import BottomNav from './components/common/BottomNav';
import Toast from './components/common/Toast';
import RoleSwitcherModal from './components/common/RoleSwitcherModal';
import AuthScreen from './screens/auth/AuthScreen';

// Parent Screens
import ParentHomeScreen from './screens/parent/ParentHomeScreen';
import ParentLiveTrackingScreen from './screens/parent/ParentLiveTrackingScreen';
import ParentFeesScreen from './screens/parent/ParentFeesScreen';
import ParentNotificationsScreen from './screens/parent/ParentNotificationsScreen';

// Teacher Screens
import TeacherHomeScreen from './screens/teacher/TeacherHomeScreen';
import TeacherRosterScreen from './screens/teacher/TeacherRosterScreen';
import TeacherFleetScreen from './screens/teacher/TeacherFleetScreen';
import TeacherAddStudentModal from './screens/teacher/TeacherAddStudentModal';

// Driver Screens
import DriverCockpitScreen from './screens/driver/DriverCockpitScreen';
import DriverManifestScreen from './screens/driver/DriverManifestScreen';
import DriverSosModal from './screens/driver/DriverSosModal';

function MobileAppContent() {
  const { user } = useMobileAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  // If unauthenticated, show AuthScreen
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex justify-center">
        <main className="w-full max-w-md min-h-screen h-[100dvh] bg-[#F8FAFC] flex flex-col relative overflow-hidden shadow-xl md:border-x md:border-gray-200">
          <Toast />
          <AuthScreen />
        </main>
      </div>
    );
  }

  const role = user.role;

  // Render role-specific screen based on active tab
  const renderRoleScreen = () => {
    if (role === 'PARENT') {
      switch (activeTab) {
        case 'track':
          return <ParentLiveTrackingScreen />;
        case 'fees':
          return <ParentFeesScreen />;
        case 'alerts':
          return <ParentNotificationsScreen />;
        case 'home':
        default:
          return <ParentHomeScreen onNavigate={(tab) => setActiveTab(tab)} />;
      }
    }

    if (role === 'TEACHER') {
      switch (activeTab) {
        case 'students':
          return <TeacherRosterScreen onOpenAddStudent={() => setIsAddStudentOpen(true)} />;
        case 'fleet':
          return <TeacherFleetScreen />;
        case 'home':
        default:
          return (
            <TeacherHomeScreen
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddStudent={() => setIsAddStudentOpen(true)}
            />
          );
      }
    }

    if (role === 'DRIVER') {
      switch (activeTab) {
        case 'manifest':
          return <DriverManifestScreen />;
        case 'cockpit':
        default:
          return (
            <DriverCockpitScreen
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenSos={() => setIsSosOpen(true)}
            />
          );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex justify-center">
      <main className="w-full max-w-md min-h-screen h-[100dvh] bg-[#F8FAFC] flex flex-col relative overflow-hidden shadow-xl md:border-x md:border-gray-200">
        <Toast />

        {/* Top Header */}
        <TopBar
          title={
            role === 'PARENT'
              ? `Family ${user.familyCode || 'FAM'}`
              : role === 'TEACHER'
              ? user.name
              : `${user.assignedBus?.busNumber || 'BUS 01'}`
          }
          subtitle={
            role === 'PARENT'
              ? user.schoolName
              : role === 'TEACHER'
              ? `Class ${user.assignedClasses || '10'}`
              : `Driver ${user.name}`
          }
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
        />

        {/* Active Screen Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
          {renderRoleScreen()}
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenAddStudent={() => setIsAddStudentOpen(true)}
          onOpenSos={() => setIsSosOpen(true)}
        />

        {/* Role Switcher Modal */}
        <RoleSwitcherModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
        />

        {/* Teacher Add Student Enrollment Modal */}
        <TeacherAddStudentModal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
        />

        {/* Driver SOS Emergency Modal */}
        <DriverSosModal
          isOpen={isSosOpen}
          onClose={() => setIsSosOpen(false)}
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <MobileAuthProvider>
      <MobileAppContent />
    </MobileAuthProvider>
  );
}
