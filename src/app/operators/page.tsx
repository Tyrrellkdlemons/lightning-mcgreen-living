import type { Metadata } from 'next';
import { OperatorIndex } from '@/components/operators/OperatorIndex';

export const metadata: Metadata = {
  title: 'Apartment operator index',
  description:
    'Which apartment + townhome listings use which management company, leasing platform, and screening stack. Tier labels reflect each operator\'s publicly known portfolio positioning — never invented for specific units.',
};

export default function OperatorsPage() {
  return <OperatorIndex />;
}
