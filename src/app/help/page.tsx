import type { Metadata } from 'next';
import { HelpNavigator } from '@/components/help/HelpNavigator';
export const metadata: Metadata = { title:'Find your next step', description:'A practical housing, application and moving help navigator for California and Arizona.', alternates:{canonical:'/help'} };
export default function HelpPage(){ return <HelpNavigator/>; }
