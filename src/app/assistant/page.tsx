import type { Metadata } from 'next';
import { HousingAssistant } from '@/components/assistant/HousingAssistant';
export const metadata: Metadata = { title: 'Housing research assistant', description: 'Ask general California and Arizona housing questions with citations to dated public directory records.', alternates: { canonical: '/assistant' } };
export default function AssistantPage() { return <HousingAssistant />; }
