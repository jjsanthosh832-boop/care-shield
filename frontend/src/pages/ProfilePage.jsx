import { useAuth } from '../hooks/useAuth';
import { ProfileForm } from '../components/forms/ProfileForm';
import { Card } from '../components/ui/Card';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account information and security preferences</p>
      </div>

      <Card className="p-0">
        <ProfileForm user={user} />
      </Card>
    </div>
  );
}