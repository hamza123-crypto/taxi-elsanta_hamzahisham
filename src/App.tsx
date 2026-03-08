import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { ProfileSetup } from "./components/ProfileSetup";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md h-20 flex justify-between items-center border-b border-blue-200 shadow-lg px-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-bounce">🛺</div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              توك توك السنطة
            </h2>
            <p className="text-sm text-gray-600">منصة النقل المحلية</p>
          </div>
        </div>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}

function Content() {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Unauthenticated>
        <div className="text-center mb-12">
          <div className="text-8xl mb-6 animate-bounce">🛺</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            توك توك السنطة
          </h1>
          <p className="text-2xl text-gray-700 mb-3">منصة حجز التوك توك المحلية</p>
          <p className="text-lg text-gray-600 mb-8">سجل دخولك للبدء في رحلتك معنا</p>
          <div className="flex justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>أسعار مناسبة</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>خدمة سريعة</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>سائقين موثوقين</span>
            </div>
          </div>
        </div>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        {!currentUser?.profile ? (
          <ProfileSetup />
        ) : (
          <Dashboard user={currentUser} />
        )}
      </Authenticated>
    </div>
  );
}
