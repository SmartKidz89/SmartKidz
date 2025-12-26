import Section from '@/components/ui/Section';
import AuthCard from '@/components/auth/AuthCard';

import { Page } from "@/components/ui/PageScaffoldServer";
export default function Signup({ searchParams }) {
  const plan = searchParams?.plan ?? null;
  return (
    
    <Page title="Signup">
<main>
      <Section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <AuthCard mode="signup" initialPlan={plan} />
      </Section>
    </main>
  
    </Page>
  );
}