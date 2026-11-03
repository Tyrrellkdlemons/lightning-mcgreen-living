import {connection} from 'next/server';
/** Read the clock only after a live request is established. */
export async function requestTime(){await connection();return Date.now();}
