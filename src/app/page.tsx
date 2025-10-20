import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirecionar para signin se não estiver autenticado
  // O middleware vai lidar com a autenticação
  redirect('/signin');
}
