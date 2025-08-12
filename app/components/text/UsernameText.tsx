import React from 'react';
import useRiv from '../../hooks/useRiv';

interface UsernameTextProps {
	fallback?: string; // text to show when username is empty
	prefix?: string;   // optional prefix like "Hi, "
	className?: string;
}

export default function UsernameText({ fallback = 'Unknown', prefix = '', className }: UsernameTextProps) {
	const { state } = useRiv();
	const name = state?.fullname || state?.username || fallback;
	return <span className={className}>{prefix}{name}</span>;
}

