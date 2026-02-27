import numeral from 'numeral';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format STX amount from microSTX to STX with proper decimals
 * @param microStx - Amount in microSTX (1 STX = 1,000,000 microSTX)
 * @returns Formatted STX string (e.g., "0.00395")
 */
export function formatStx(microStx: number): string {
  const stx = microStx / 1_000_000;
  return numeral(stx).format('0.000000');
}

/**
 * Format USD amount
 * @param usd - Amount in USD
 * @returns Formatted USD string (e.g., "$0.0026")
 */
export function formatUsd(usd: number): string {
  return numeral(usd).format('$0,0.0000');
}

/**
 * Format percentage
 * @param value - Percentage value (e.g., 0.23 for 23%)
 * @returns Formatted percentage string (e.g., "23%")
 */
export function formatPercentage(value: number): string {
  return numeral(value).format('0.0%');
}

/**
 * Format date to readable string
 * @param date - Date object or timestamp
 * @returns Formatted date string (e.g., "Feb 27, 2026")
 */
export function formatDate(date: Date | number): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

/**
 * Format date to relative time
 * @param date - Date object or timestamp
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Truncate address for display
 * @param address - Full Stacks address
 * @returns Truncated address (e.g., "SP2X0...PGZGM")
 */
export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
}
