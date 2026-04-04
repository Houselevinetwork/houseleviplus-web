'use client';

import { useLogin } from '@houselevi/ui-shared';
import { Button } from './Button';
import { Input } from './Input';

export function LoginForm() {
  const { login, isLoading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    await login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name=\"email\" type=\"email\" required />
      <Input name=\"password\" type=\"password\" required />
      {error && <p className=\"text-red-500\">{error}</p>}
      <Button type=\"submit\" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
