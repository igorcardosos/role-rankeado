import { getAppConfig } from '@/lib/config';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const { nomeApp } = await getAppConfig();
  return <LoginForm nomeApp={nomeApp} />;
}
