import { redirect } from 'next/navigation';

export default function PricingRedirect() {
  // Marketing pricing lives under /marketing; middleware may rewrite /pricing to it.
  redirect('/marketing/pricing');
}
