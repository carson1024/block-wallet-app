import TimeAgo from "javascript-time-ago";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import en from "javascript-time-ago/locale/en";
import numeral from "numeral";

TimeAgo.addDefaultLocale(en);

export const getRemainingTimeString = (mili: number) => {
  const seconds = Math.floor(mili / 1000);
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
};

export const parseLamports = (lamports: number) => {
  return (lamports / 1000000000);
};

export const formatDecimals = (value: number) => {
  return (value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const splitDecimals = (text: string, decimals: number) => {
  return { text, decimals };
};

const parseSmallDecimal = (tokens: number) => {
  if (tokens === 0) return splitDecimals(numeral(0).format("0.00a"), 0);

  const decimals = -Math.floor(Math.log(tokens) / Math.log(10) + 1);
  const n = (tokens * 10 ** (decimals + 4)).toFixed(0);

  return splitDecimals(n.toString(), decimals);
};

export const formatTokens = (tokens: number) => {
  return tokens / 1000000000 > 0.1
    ? splitDecimals(numeral(tokens / 1000000000).format("0.00a"), 0)
    : parseSmallDecimal(tokens / 1000000000);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function abbreviateTokenAddress(address: string) {
  // Check if the address is valid
  if (typeof address !== "string") {
    // throw new Error("Invalid Solana token address");
    return "-/-";
  }

  // Abbreviate the address
  const abbreviatedAddress = address.slice(0, 6) + "..." + address.slice(-6);

  return abbreviatedAddress;
}

export const isValidURL = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return true;
  } catch (err) {
    // const regex = /^(https?:\/\/)?([^\s$.?#].[^\s]*)$/i;
    // return regex.test(urlString);
    return false;
  }
};

export const timeAgo = new TimeAgo("en-US");

export const formatNumber = (number: number, precision?: number) => {
  if (number === 0) return "0";
  if (number < 0.0001) return "0";
  if (number >= 1e9) {
    return (number / 1e9).toFixed(1) + "B"; // Billions
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(1) + "M"; // Millions
  } else if (number >= 1e3) {
    return (number / 1e3).toFixed(1) + "K"; // Thousands
  } else {
    return precision ? number?.toFixed(precision) : number?.toString(); // Less than a thousand
  }
};

export const deformatNumber = (formatted: string) => {
  interface NumberFormats {
    [key: string]: number;
  }

  const shorthandMap: NumberFormats = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
  };

  const shorthandPattern = /^(\d+(\.\d+)?)([KMB])$/i;
  const match = formatted.match(shorthandPattern);

  if (match) {
    const num = parseFloat(match[1]);
    const unit = match[3].toUpperCase();
    return num * shorthandMap[unit];
  }

  // If no match, try to parse it as a regular number
  return parseFloat(formatted);
};

export const isDefaultLink = (url: string) => {
  return url && url === "https://www.ape.lol";
};

export function snakeCase(string = "") {
  return string
    .replace(/\W+/g, " ")
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join("_");
}

export function formatDataProperties(data: any) {
  const dataObj: any = {};
  Object.keys(data || {}).forEach((key) => {
    if (!!data[key] && typeof data[key] !== "undefined") {
      const _key = snakeCase(key);
      dataObj[_key] = data[key];
    }
  });

  return dataObj;
}
