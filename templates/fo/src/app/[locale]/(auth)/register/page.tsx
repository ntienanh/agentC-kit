import { Suspense } from 'react';
import { RegisterExperience } from './register-experience';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterExperience />
    </Suspense>
  );
}
